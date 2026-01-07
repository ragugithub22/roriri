import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Receipt, 
  MessageSquare, 
  LogOut,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import InstituteDashboardHome from "./InstituteDashboardHome";
import InstituteIndustrialVisit from "./InstituteIndustrialVisit";
import InstituteInternship from "./InstituteInternship";
import InstitutePlacementTraining from "./InstitutePlacementTraining";
import InstituteMOUDetails from "./InstituteMOUDetails";
import InstitutePaymentReport from "./InstitutePaymentReport";
import InstituteChatBox from "./InstituteChatBox";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "industrial-visit", label: "Industrial Visit", icon: Building2 },
  { id: "internship", label: "Internship", icon: GraduationCap },
  { id: "placement-training", label: "Placement Training", icon: Briefcase },
  { id: "mou-details", label: "MOU Details", icon: FileText },
  { id: "payment-report", label: "Payment Report", icon: Receipt },
  { id: "chatbox", label: "Chatbox", icon: MessageSquare },
];

const InstituteDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeItem, setActiveItem] = useState("dashboard");

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const renderActiveComponent = () => {
    switch (activeItem) {
      case "dashboard":
        return <InstituteDashboardHome />;
      case "industrial-visit":
        return <InstituteIndustrialVisit />;
      case "internship":
        return <InstituteInternship />;
      case "placement-training":
        return <InstitutePlacementTraining />;
      case "mou-details":
        return <InstituteMOUDetails />;
      case "payment-report":
        return <InstitutePaymentReport />;
      case "chatbox":
        return <InstituteChatBox />;
      default:
        return <InstituteDashboardHome />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="h-[73px] border-b bg-gradient-to-b from-cyan-600 to-teal-600 flex items-center px-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-white" />
              <h1 className="text-lg font-bold text-white">Institute Portal</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveItem(item.id)}
                        className={`hover:bg-gradient-to-r hover:from-cyan-600 hover:to-teal-600 hover:text-white ${
                          activeItem === item.id ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold" : ""
                        }`}
                        isActive={activeItem === item.id}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleLogout}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Header - matching IT Park Dashboard */}
          <header className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-6 px-6 shadow-md">
            <div className="container mx-auto max-w-7xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigate("/auth")}
                    className="text-white hover:bg-white/20"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">Institute Portal</h1>
                      <p className="text-sm opacity-90">Dashboard & Analytics</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-white hover:bg-white/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 bg-background min-h-[calc(100vh-73px)]">
            <div className="space-y-6">
              {renderActiveComponent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default InstituteDashboard;
