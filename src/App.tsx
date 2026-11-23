import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SHOP_ENABLED } from "@/config/merch";
import Index from "./pages/Index";
import JoinPage from "./pages/JoinPage";
import ContactPage from "./pages/ContactPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import SponsorsPage from "./pages/SponsorsPage";
import SponsorPage from "./pages/SponsorPage";
import SponsorSuccessPage from "./pages/SponsorSuccessPage";
import ShopPage from "./pages/ShopPage";
import ShopSuccessPage from "./pages/ShopSuccessPage";
import TestEmailPage from "./pages/TestEmailPage";
import TestAdminEmailPage from "./pages/TestAdminEmailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/join" element={<JoinPage />} />
          {/* Alias routes for user-friendly URLs */}
          <Route path="/how-to-join" element={<JoinPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/sponsor" element={<SponsorPage />} />
          <Route path="/support" element={<SponsorPage />} />
          <Route path="/support-us" element={<SponsorPage />} />
          <Route path="/sponsor/success" element={<SponsorSuccessPage />} />
          {/* Shop is switched off with SHOP_ENABLED in src/config/merch.ts */}
          <Route path="/shop" element={SHOP_ENABLED ? <ShopPage /> : <Navigate to="/" replace />} />
          <Route path="/merch" element={SHOP_ENABLED ? <ShopPage /> : <Navigate to="/" replace />} />
          <Route path="/shop/success" element={SHOP_ENABLED ? <ShopSuccessPage /> : <Navigate to="/" replace />} />
          <Route path="/test-email" element={<TestEmailPage />} />
          <Route path="/test-admin-email" element={<TestAdminEmailPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
