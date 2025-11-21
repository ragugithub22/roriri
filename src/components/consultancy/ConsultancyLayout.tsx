import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
  Award,
  BarChart3,
  Settings,
  ArrowLeft,
  Home,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface ConsultancyLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

const consultancyMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/consultancy",
    id: "dashboard"
  },
  {
    title: "Clients",
    icon: Users,
    path: "/consultancy/clients",
    id: "clients"
  },
  {
    title: "Job Openings",
    icon: Briefcase,
    path: "/consultancy/job-openings",
    id: "job-openings"
  },
  {
    title: "Candidates",
    icon: UserCheck,
    path: "/consultancy/candidates",
    id: "candidates"
  },
  {
    title: "Shortlisting",
    icon: UserCheck,
    path: "/consultancy/shortlisting",
    id: "shortlisting"
  },
  {
    title: "Interviews",
    icon: Calendar,
    path: "/consultancy/interviews",
    id: "interviews"
  },
  {
    title: "Placements",
    icon: Award,
    path: "/consultancy/placements",
    id: "placements"
  },
  {
    title: "Payments & Billing",
    icon: DollarSign,
    path: "/consultancy/payments",
    id: "payments"
  },
  {
    title: "Enquiries",
    icon: FileText,
    path: "/consultancy/enquiries",
    id: "enquiries"
  },
  {
    title: "Documents",
    icon: FileText,
    path: "/consultancy/documents",
    id: "documents"
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/consultancy/reports",
    id: "reports"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/consultancy/settings",
    id: "settings"
  }
];

export default function ConsultancyLayout({ children, activeSection }: ConsultancyLayoutProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">RIYA Consultancy</h2>
                <p className="text-sm text-muted-foreground">Recruitment & Placement</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {consultancyMenuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={activeSection === item.id}
                        className="w-full justify-start"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    All Entities
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
