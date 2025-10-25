import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import AdminPanel from "./pages/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/academy" element={<ProtectedRoute><AcademyDashboard /></ProtectedRoute>} />
            <Route path="/it-academy" element={<ProtectedRoute><ITAcademyDashboard /></ProtectedRoute>} />
            <Route path="/foundation" element={<ProtectedRoute><FoundationDashboard /></ProtectedRoute>} />
            <Route path="/farm" element={<ProtectedRoute><FarmDashboard /></ProtectedRoute>} />
            <Route path="/consultancy" element={<ProtectedRoute><ConsultancyDashboard /></ProtectedRoute>} />
            <Route path="/trading" element={<ProtectedRoute><TradingDashboard /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><AutomationDashboard /></ProtectedRoute>} />
            <Route path="/it" element={<ProtectedRoute><ITDashboard /></ProtectedRoute>} />
            <Route path="/tours-travels" element={<ProtectedRoute><ToursTravelsDashboard /></ProtectedRoute>} />
            <Route path="/builders" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
