import { useState } from "react";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TestEmailPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("6500");
  const [tier, setTier] = useState("platinum");

  const handleSendTestEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-receipt", {
        body: {
          email: email,
          amount: parseInt(amount) * 100, // Convert to cents
          tier: tier,
          sessionId: "test_" + Date.now(),
        },
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent!",
        description: `Receipt email sent to ${email}`,
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">Test Receipt Email</h1>
          <p className="text-muted-foreground text-center mb-8">
            Send a test receipt email to verify the formatting and content
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Email Test Parameters</CardTitle>
              <CardDescription>
                Configure the test email details below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Recipient Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-amount">Donation Amount (USD)</Label>
                <Input
                  id="test-amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="6500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Tier will be auto-assigned: $500+ Bronze, $1000+ Silver, $3000+ Gold, $5000+ Platinum, $10000+ Diamond
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-tier">Override Tier (Optional)</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger id="test-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSendTestEmail}
                disabled={loading}
                className="w-full bg-foreground text-background hover:bg-foreground/90"
              >
                {loading ? "Sending..." : "Send Test Email"}
              </Button>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Email Preview</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The email will include:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Professional header with organization name</li>
                  <li>• Receipt date and transaction ID</li>
                  <li>• Donation amount and tier</li>
                  <li>• Tax information (EIN: 746002018)</li>
                  <li>• Complete list of sponsorship benefits</li>
                  <li>• Next steps for the sponsor</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TestEmailPage;
