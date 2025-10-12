import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SponsorSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier");
  const amount = searchParams.get("amount");
  const sessionId = searchParams.get("session_id");
  const [receiptSent, setReceiptSent] = useState(false);

  useEffect(() => {
    // Process payment and send receipt
    const processPayment = async () => {
      if (sessionId && !receiptSent) {
        try {
          await supabase.functions.invoke("process-payment-success", {
            body: { sessionId },
          });
          setReceiptSent(true);
        } catch (error) {
          console.error("Error processing payment:", error);
        }
      }
    };

    processPayment();
  }, [sessionId, receiptSent]);

  const formatAmount = (cents: string) => {
    const dollars = parseInt(cents) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-20 w-20 text-foreground mx-auto mb-6" />
          
          <h1 className="text-4xl font-bold mb-4">Thank You for Your Sponsorship!</h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            {tier === "custom" && amount && `Your custom donation of ${formatAmount(amount)} has been successfully processed.`}
            {tier && tier !== "custom" && `Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier sponsorship has been successfully processed.`}
            {!tier && "Your sponsorship has been successfully processed."}
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">What's Next?</h2>
            <ul className="text-left space-y-3 max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                <span>A tax receipt has been sent to your email with our EIN for your records</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                <span>Our team will contact you within 48 hours to collect your logo and branding materials</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                <span>You'll receive regular updates about the team's progress</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/")} variant="default">
              Return Home
            </Button>
            <Button onClick={() => navigate("/contact")} variant="outline">
              Contact Us
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SponsorSuccessPage;
