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
import BeneficiariesPage from "./pages/BeneficiariesPage";
import VolunteersPage from "./pages/VolunteersPage";
import EventsPage from "./pages/EventsPage";
import DonorsPage from "./pages/DonorsPage";
import DonationsPage from "./pages/DonationsPage";
import ExpensesPage from "./pages/ExpensesPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import CertificatesPage from "./pages/CertificatesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import FarmDashboard from "./pages/FarmDashboard";
import FarmEventsPage from "./pages/FarmEventsPage";
import FarmGamesPage from "./pages/FarmGamesPage";
import FarmFoodPage from "./pages/FarmFoodPage";
import FarmTicketsPage from "./pages/FarmTicketsPage";
import FarmBookingsPage from "./pages/FarmBookingsPage";
import FarmFoodOrdersPage from "./pages/FarmFoodOrdersPage";
import FarmPaymentsPage from "./pages/FarmPaymentsPage";
import FarmExpensesPage from "./pages/FarmExpensesPage";
import FarmAnnouncementsPage from "./pages/FarmAnnouncementsPage";
import FarmSettingsPage from "./pages/FarmSettingsPage";
import FarmReportsPage from "./pages/FarmReportsPage";
import FarmVisitorEntryPage from "./pages/FarmVisitorEntryPage";
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
import HostelResidentDetail from "./pages/HostelResidentDetail";
import AssetManagement from "./pages/AssetManagement";
import EntitiesManagement from "./pages/EntitiesManagement";
import SyllabusDetails from "./pages/SyllabusDetails";
import ReceiptPage from "./pages/ReceiptPage";
import CertificatePage from "./pages/CertificatePage";
import InternshipLayout from "./components/internship/InternshipLayout";
import InternshipDashboard from "./pages/internship/InternshipDashboard";
import CandidatePage from "./pages/internship/CandidatePage";
import InternDetailsWrapper from "./pages/internship/InternDetailsWrapper";
import EnquiryPage from "./pages/internship/EnquiryPage";
import CoursePage from "./pages/internship/CoursePage";
import PaymentReportPage from "./pages/internship/PaymentReportPage";
import IDCardPage from "./pages/internship/IDCardPage";
import ChatBoxPage from "./pages/internship/ChatBoxPage";
import IndustrialVisit from "./pages/IndustrialVisit";
import IndustrialVisitEnquiry from "./pages/IndustrialVisitEnquiry";
import IndustrialVisitVisitors from "./pages/IndustrialVisitVisitors";
import IndustrialVisitPaymentReport from "./pages/IndustrialVisitPaymentReport";
import IndustrialVisitRegistration from "./pages/IndustrialVisitRegistration";
import IndustrialVisitVisitorDetails from "./pages/IndustrialVisitVisitorDetails";
import IndustrialVisitInterviews from "./pages/IndustrialVisitInterviews";
import IndustrialVisitNormalVisitors from "./pages/IndustrialVisitNormalVisitors";
import UserDashboard from "./pages/UserDashboard";
import TraineeDashboard from "./pages/TraineeDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import InternDashboard from "./pages/InternDashboard";
import InstituteDashboard from "./pages/institute/InstituteDashboard";

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
            <Route path="/industrial-visit/registration" element={<IndustrialVisitRegistration />} />
            <Route path="/" element={<Index />} />
            <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/trainee-dashboard" element={<ProtectedRoute><TraineeDashboard /></ProtectedRoute>} />
            <Route path="/employee-dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/intern-dashboard" element={<ProtectedRoute><InternDashboard /></ProtectedRoute>} />
            <Route path="/institute-dashboard" element={<ProtectedRoute><InstituteDashboard /></ProtectedRoute>} />
            <Route path="/academy" element={<ProtectedRoute><AcademyDashboard /></ProtectedRoute>} />
            <Route path="/it-academy" element={<ProtectedRoute><ITAcademyDashboard /></ProtectedRoute>} />
            <Route path="/foundation" element={<ProtectedRoute><FoundationDashboard /></ProtectedRoute>} />
            <Route path="/foundation/beneficiaries" element={<ProtectedRoute><BeneficiariesPage /></ProtectedRoute>} />
            <Route path="/foundation/volunteers" element={<ProtectedRoute><VolunteersPage /></ProtectedRoute>} />
            <Route path="/foundation/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
            <Route path="/foundation/donors" element={<ProtectedRoute><DonorsPage /></ProtectedRoute>} />
            <Route path="/foundation/donations" element={<ProtectedRoute><DonationsPage /></ProtectedRoute>} />
            <Route path="/foundation/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/foundation/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
            <Route path="/foundation/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
            <Route path="/foundation/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/foundation/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/farm" element={<ProtectedRoute><FarmDashboard /></ProtectedRoute>} />
            <Route path="/farm/events" element={<ProtectedRoute><FarmEventsPage /></ProtectedRoute>} />
            <Route path="/farm/games" element={<ProtectedRoute><FarmGamesPage /></ProtectedRoute>} />
            <Route path="/farm/food" element={<ProtectedRoute><FarmFoodPage /></ProtectedRoute>} />
            <Route path="/farm/tickets" element={<ProtectedRoute><FarmTicketsPage /></ProtectedRoute>} />
            <Route path="/farm/bookings" element={<ProtectedRoute><FarmBookingsPage /></ProtectedRoute>} />
            <Route path="/farm/food-orders" element={<ProtectedRoute><FarmFoodOrdersPage /></ProtectedRoute>} />
            <Route path="/farm/payments" element={<ProtectedRoute><FarmPaymentsPage /></ProtectedRoute>} />
            <Route path="/farm/expenses" element={<ProtectedRoute><FarmExpensesPage /></ProtectedRoute>} />
            <Route path="/farm/announcements" element={<ProtectedRoute><FarmAnnouncementsPage /></ProtectedRoute>} />
            <Route path="/farm/settings" element={<ProtectedRoute><FarmSettingsPage /></ProtectedRoute>} />
            <Route path="/farm/reports" element={<ProtectedRoute><FarmReportsPage /></ProtectedRoute>} />
            <Route path="/farm/visitors" element={<ProtectedRoute><FarmVisitorEntryPage /></ProtectedRoute>} />
            <Route path="/consultancy" element={<ProtectedRoute><ConsultancyDashboard /></ProtectedRoute>} />
            <Route path="/trading" element={<ProtectedRoute><TradingDashboard /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><AutomationDashboard /></ProtectedRoute>} />
            <Route path="/it" element={<ProtectedRoute><ITDashboard /></ProtectedRoute>} />
            <Route path="/tours-travels" element={<ProtectedRoute><ToursTravelsDashboard /></ProtectedRoute>} />
            <Route path="/builders" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/projects" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/sites" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/contractors" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/labour" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/materials" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/clients" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/finance" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/documents" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/reports" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/users" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
            <Route path="/builders/settings" element={<ProtectedRoute><BuildersDashboard /></ProtectedRoute>} />
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
            <Route path="/hostel/:type/:id" element={<ProtectedRoute><HostelResidentDetail /></ProtectedRoute>} />
            <Route path="/asset-management" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
            <Route path="/entities" element={<ProtectedRoute><EntitiesManagement /></ProtectedRoute>} />
            <Route path="/syllabus/:subjectId" element={<ProtectedRoute><SyllabusDetails /></ProtectedRoute>} />
            <Route path="/receipt" element={<ReceiptPage />} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="/industrial-visit" element={<ProtectedRoute><IndustrialVisit /></ProtectedRoute>} />
            <Route path="/industrial-visit/enquiry" element={<ProtectedRoute><IndustrialVisitEnquiry /></ProtectedRoute>} />
            <Route path="/industrial-visit/visitors" element={<ProtectedRoute><IndustrialVisitVisitors /></ProtectedRoute>} />
            <Route path="/industrial-visit/interviews" element={<ProtectedRoute><IndustrialVisitInterviews /></ProtectedRoute>} />
            <Route path="/industrial-visit/normal-visitors" element={<ProtectedRoute><IndustrialVisitNormalVisitors /></ProtectedRoute>} />
            <Route path="/industrial-visit/payment-report" element={<ProtectedRoute><IndustrialVisitPaymentReport /></ProtectedRoute>} />
            <Route path="/industrial-visit/registration" element={<IndustrialVisitRegistration />} />
            <Route path="/industrial-visit-registration/:visitorId?" element={<IndustrialVisitRegistration />} />
            <Route path="/industrial-visit-visitor-details/:visitorId" element={<ProtectedRoute><IndustrialVisitVisitorDetails /></ProtectedRoute>} />
            
            {/* Internship Routes with Nested Sidebar */}
            <Route path="/internship" element={<ProtectedRoute><InternshipLayout /></ProtectedRoute>}>
              <Route index element={<InternshipDashboard />} />
              <Route path="candidate" element={<CandidatePage />} />
              <Route path="candidate/:id" element={<InternDetailsWrapper />} />
              <Route path="enquiry" element={<EnquiryPage />} />
              <Route path="course" element={<CoursePage />} />
              <Route path="payment-report" element={<PaymentReportPage />} />
              <Route path="id-card" element={<IDCardPage />} />
              <Route path="chat" element={<ChatBoxPage />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
