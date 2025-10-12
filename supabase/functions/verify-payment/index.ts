import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from Supabase Auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      console.error('User authentication failed');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const requestBody = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = requestBody;

    // Input validation
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error('Missing payment parameters');
      return new Response(
        JSON.stringify({ error: 'Invalid payment data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify payment signature
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      console.error('Payment service configuration error');
      return new Response(
        JSON.stringify({ error: 'Payment verification unavailable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      );
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = await createHmac("sha256", razorpayKeySecret).update(body).digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed', { razorpay_order_id });
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Use service role client to update database
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Validate payment amount (expected: 100 INR = 10000 paise)
    const expectedAmount = 10000;
    
    // Create subscription record
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Add 1 year

    const { error: subscriptionError } = await supabaseService
      .from('subscriptions')
      .insert({
        user_id: user.id,
        razorpay_payment_id,
        razorpay_order_id,
        amount: expectedAmount,
        currency: 'INR',
        status: 'completed',
        subscription_type: 'annual',
        expires_at: expiresAt.toISOString(),
      });

    if (subscriptionError) {
      console.error('Subscription creation failed', { user_id: user.id, error: subscriptionError });
      return new Response(
        JSON.stringify({ error: 'Payment processing failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update user credits to unlimited
    const { error: creditsError } = await supabaseService
      .from('user_credits')
      .update({
        is_unlimited: true,
        unlimited_expires_at: expiresAt.toISOString(),
        total_credits_purchased: 999999,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (creditsError) {
      console.error('Credits update failed', { user_id: user.id, error: creditsError });
      return new Response(
        JSON.stringify({ error: 'Payment processing failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Payment verified and subscription updated for user:', user.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Payment verification failed. Please contact support if the issue persists.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});