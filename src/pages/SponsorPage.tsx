import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Check, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TIERS = {
  bronze: {
    name: "Bronze",
    price: "$500+",
    priceId: "price_1SH8PuJAN6cVIX7QWaOcIRSO",
    color: "from-amber-600 to-amber-800",
    benefits: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website",
    ],
  },
  silver: {
    name: "Silver",
    price: "$1,000+",
    priceId: "price_1SH8Q6JAN6cVIX7QRdO0m2Lz",
    color: "from-gray-400 to-gray-600",
    benefits: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website",
      "Featured in our Newsletter",
      "Social Media Recognition",
    ],
  },
  gold: {
    name: "Gold",
    price: "$3,000+",
    priceId: "price_1SH8QJJAN6cVIX7QtH0hMu34",
    color: "from-yellow-400 to-yellow-600",
    benefits: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website",
      "Featured in our Newsletter",
      "Social Media Recognition",
      "Name on Team Trailer",
      "Logo on Banner",
      "Logo on Team Apparel",
    ],
  },
  platinum: {
    name: "Platinum",
    price: "$5,000+",
    priceId: "price_1SH8QTJAN6cVIX7QZQbu7oCx",
    color: "from-gray-300 to-gray-500",
    benefits: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website",
      "Featured in our Newsletter",
      "Social Media Recognition",
      "Name on Team Trailer",
      "Logo on Banner",
      "Logo on Team Apparel",
      "Name on Car",
      "Media Coverage",
      "Priority Placement and Sizing of Logo on Car",
    ],
  },
  diamond: {
    name: "Diamond",
    price: "$10,000+",
    priceId: "price_1SH8QgJAN6cVIX7Q52wi9rvR",
    color: "from-cyan-300 to-cyan-500",
    benefits: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website",
      "Featured in our Newsletter",
      "Social Media Recognition",
      "Name on Team Trailer",
      "Logo on Banner",
      "Logo on Team Apparel",
      "Name on Car",
      "Media Coverage",
      "Priority Placement and Sizing of Logo on Car",
      "Dedicated Paragraph on Website",
      "Media Mentions",
    ],
  },
};

const SponsorPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  // Calculate Stripe fee: 2.7% + $0.05
  const calculateStripeFee = (amount: number) => {
    return (amount * 0.027) + 0.05;
  };

  const calculateTotal = (amount: number) => {
    return amount + calculateStripeFee(amount);
  };

  const getTierBaseAmount = (tier: keyof typeof TIERS) => {
    // Extract base amount from tier price string (e.g., "$500+" -> 500)
    const priceStr = TIERS[tier].price;
    return parseInt(priceStr.replace(/\D/g, ''));
  };

  const handleSponsor = async (tier: keyof typeof TIERS) => {
    setLoading(tier);
    try {
      const baseAmount = getTierBaseAmount(tier);
      
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          baseAmount: baseAmount * 100, // Convert to cents
          tier: tier,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCustomDonation = async () => {
    const amount = parseFloat(customAmount);
    
    if (isNaN(amount) || amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount of at least $1.00",
        variant: "destructive",
      });
      return;
    }

    setLoading("custom");
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          customAmount: Math.round(amount * 100), // Convert to cents
          tier: "custom",
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sponsorship Tiers</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Support our solar car team and gain visibility for your brand
          </p>
        </div>

        {/* Custom Donation Section */}
        <Card className="max-w-md mx-auto mb-12">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <DollarSign className="h-6 w-6 text-foreground" />
              Custom Donation Amount
            </CardTitle>
            <CardDescription>
              Enter any amount you'd like to contribute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="custom-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="100.00"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {customAmount && parseFloat(customAmount) >= 1 && (
                  <p className="text-sm text-muted-foreground">
                    Total: ${calculateTotal(parseFloat(customAmount)).toFixed(2)}
                    <span className="block text-xs">
                      (includes ${calculateStripeFee(parseFloat(customAmount)).toFixed(2)} Stripe fee)
                    </span>
                  </p>
                )}
              </div>
              <Button
                onClick={handleCustomDonation}
                disabled={loading !== null}
                className="w-full bg-foreground text-background hover:bg-foreground/90"
              >
                {loading === "custom" ? "Processing..." : "Donate Custom Amount"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Or Choose a Sponsorship Tier</h2>
          <p className="text-muted-foreground">
            Select a tier based on your contribution level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {Object.entries(TIERS).map(([key, tier]) => (
            <Card key={key} className="relative overflow-hidden flex flex-col">
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${tier.color}`} />
              
              <CardHeader className="text-center pt-8">
                <div className={`text-3xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-2`}>
                  {tier.name}
                </div>
                <CardTitle className="text-2xl">{tier.price}</CardTitle>
                <CardDescription className="text-sm mt-2">
                  Total: ${calculateTotal(getTierBaseAmount(key as keyof typeof TIERS)).toFixed(2)}
                  <span className="block text-xs text-muted-foreground">
                    (includes ${calculateStripeFee(getTierBaseAmount(key as keyof typeof TIERS)).toFixed(2)} Stripe fee)
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSponsor(key as keyof typeof TIERS)}
                  disabled={loading !== null}
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                >
                  {loading === key ? "Processing..." : "Become a Sponsor"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground">
            All sponsorships are tax-deductible. For custom sponsorship packages or questions, 
            please contact us directly.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SponsorPage;
