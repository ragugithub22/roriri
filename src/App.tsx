import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AcademyDashboard from "./pages/AcademyDashboard";
import ITAcademyDashboard from "./pages/ITAcademyDashboard";
import FoundationDashboard from "./pages/FoundationDashboard";
import FarmDashboard from "./pages/FarmDashboard";
import ConsultancyDashboard from "./pages/ConsultancyDashboard";
import TradingDashboard from "./pages/TradingDashboard";
import AutomationDashboard from "./pages/AutomationDashboard";
import ITDashboard from "./pages/ITDashboard";
import ToursTravelsDashboard from "./pages/ToursTravelsDashboard";
import BuildersDashboard from "./pages/BuildersDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/academy" element={<AcademyDashboard />} />
          <Route path="/it-academy" element={<ITAcademyDashboard />} />
          <Route path="/foundation" element={<FoundationDashboard />} />
          <Route path="/farm" element={<FarmDashboard />} />
          <Route path="/consultancy" element={<ConsultancyDashboard />} />
          <Route path="/trading" element={<TradingDashboard />} />
          <Route path="/automation" element={<AutomationDashboard />} />
          <Route path="/it" element={<ITDashboard />} />
          <Route path="/tours-travels" element={<ToursTravelsDashboard />} />
          <Route path="/builders" element={<BuildersDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
