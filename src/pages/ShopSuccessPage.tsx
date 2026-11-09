import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShopSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-20 w-20 text-foreground mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Thank You for Your Order!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your payment was successful. A receipt from Stripe has been sent to your email, and we'll
            be in touch about getting your merch to you.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/")}>Return Home</Button>
            <Button variant="outline" onClick={() => navigate("/shop")}>
              Place Another Order
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShopSuccessPage;
