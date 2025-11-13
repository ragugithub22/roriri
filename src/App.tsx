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
import EmployeeList from "./pages/EmployeeList";
import EmployeeDetail from "./pages/EmployeeDetail";
import DepartmentList from "./pages/DepartmentList";
import PositionList from "./pages/PositionList";
import TraineeDetail from "./pages/TraineeDetail";
import ITParkDashboard from "./pages/ITParkDashboard";
import RolesList from "./pages/RolesList";
import MOUManagement from "./pages/MOUManagement";
import HostelManagement from "./pages/HostelManagement";
import AssetManagement from "./pages/AssetManagement";
import EntitiesManagement from "./pages/EntitiesManagement";
import SyllabusDetails from "./pages/SyllabusDetails";
import ReceiptPage from "./pages/ReceiptPage";

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
            <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute><DepartmentList /></ProtectedRoute>} />
            <Route path="/positions" element={<ProtectedRoute><PositionList /></ProtectedRoute>} />
            <Route path="/trainees/:id" element={<ProtectedRoute><TraineeDetail /></ProtectedRoute>} />
            <Route path="/it-park" element={<ProtectedRoute><ITParkDashboard /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><RolesList /></ProtectedRoute>} />
            <Route path="/mou" element={<ProtectedRoute><MOUManagement /></ProtectedRoute>} />
            <Route path="/hostel" element={<ProtectedRoute><HostelManagement /></ProtectedRoute>} />
            <Route path="/asset-management" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
            <Route path="/entities" element={<ProtectedRoute><EntitiesManagement /></ProtectedRoute>} />
            <Route path="/syllabus/:subjectId" element={<ProtectedRoute><SyllabusDetails /></ProtectedRoute>} />
            <Route path="/receipt" element={<ReceiptPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
