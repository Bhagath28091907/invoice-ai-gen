import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Infinity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Upgrade = () => {
  const [loading, setLoading] = useState(false);
  const { user, credits, isUnlimited, refreshCredits } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to upgrade",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: 10000, // 100 INR in paise
          currency: 'INR',
        },
      });

      if (error) throw error;

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_your_key_here', // You'll need to provide your Razorpay key
        amount: data.amount,
        currency: data.currency,
        name: 'Invoice Generator',
        description: 'Annual Unlimited Plan',
        order_id: data.id,
        handler: async (response: any) => {
          try {
            // Verify payment and update subscription
            await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            await refreshCredits();
            toast({
              title: "Success!",
              description: "You now have unlimited invoice generations!",
            });
          } catch (error: any) {
            toast({
              title: "Payment Error",
              description: error.message,
              variant: "destructive",
            });
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#3B82F6',
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
          <p className="text-muted-foreground">
            Choose the perfect plan for your invoice generation needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Free Plan
                </CardTitle>
                {!isUnlimited && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">₹0</div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>5 invoice generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Basic PDF export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>GST compliance</span>
                </li>
              </ul>
              <div className="pt-4">
                <div className="text-sm text-muted-foreground">
                  {!isUnlimited && credits !== null && (
                    <span>You have {credits} credits remaining</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Infinity className="h-5 w-5" />
                  Pro Plan
                </CardTitle>
                <Badge>Most Popular</Badge>
                {isUnlimited && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </div>
              <CardDescription>For professionals and businesses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                ₹100
                <span className="text-sm font-normal text-muted-foreground">/year</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unlimited invoice generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Premium PDF export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>GST compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Invoice history</span>
                </li>
              </ul>
              <Button
                onClick={handleUpgrade}
                disabled={loading || isUnlimited}
                className="w-full"
              >
                {loading
                  ? "Processing..."
                  : isUnlimited
                  ? "Already Subscribed"
                  : "Upgrade Now"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Secure payment powered by Razorpay</p>
          <p>Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;