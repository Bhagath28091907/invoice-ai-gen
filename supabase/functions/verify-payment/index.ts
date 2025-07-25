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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    // Verify payment signature
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret not configured');
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = await createHmac("sha256", razorpayKeySecret).update(body).digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // Use service role client to update database
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Create subscription record
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Add 1 year

    const { error: subscriptionError } = await supabaseService
      .from('subscriptions')
      .insert({
        user_id: user.id,
        razorpay_payment_id,
        razorpay_order_id,
        amount: 10000, // 100 INR in paise
        currency: 'INR',
        status: 'completed',
        subscription_type: 'annual',
        expires_at: expiresAt.toISOString(),
      });

    if (subscriptionError) {
      throw subscriptionError;
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
      throw creditsError;
    }

    console.log('Payment verified and subscription updated for user:', user.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});