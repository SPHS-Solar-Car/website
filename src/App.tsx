import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import JoinPage from "./pages/JoinPage";
import ContactPage from "./pages/ContactPage";
import PointsPage from "./pages/PointsPage";
import SponsorPage from "./pages/SponsorPage";
import SponsorSuccessPage from "./pages/SponsorSuccessPage";
import TestEmailPage from "./pages/TestEmailPage";
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
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/points" element={<PointsPage />} />
          <Route path="/sponsor" element={<SponsorPage />} />
          <Route path="/sponsor/success" element={<SponsorSuccessPage />} />
          <Route path="/test-email" element={<TestEmailPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
