import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
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

interface FoundationLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

const foundationMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/foundation",
    id: "dashboard"
  },
  {
    title: "Beneficiaries",
    icon: Users,
    path: "/foundation/beneficiaries",
    id: "beneficiaries"
  },
  {
    title: "Volunteers",
    icon: UserCheck,
    path: "/foundation/volunteers",
    id: "volunteers"
  },
  {
    title: "Events & Programs",
    icon: Calendar,
    path: "/foundation/events",
    id: "events"
  },
  {
    title: "Donors & Sponsors",
    icon: DollarSign,
    path: "/foundation/donors",
    id: "donors"
  },
  {
    title: "Donations",
    icon: Receipt,
    path: "/foundation/donations",
    id: "donations"
  },
  {
    title: "Expenses",
    icon: Receipt,
    path: "/foundation/expenses",
    id: "expenses"
  },
  {
    title: "Announcements",
    icon: FileText,
    path: "/foundation/announcements",
    id: "announcements"
  },
  {
    title: "Certificates",
    icon: Award,
    path: "/foundation/certificates",
    id: "certificates"
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/foundation/reports",
    id: "reports"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/foundation/settings",
    id: "settings"
  }
];

export default function FoundationLayout({ children, activeSection }: FoundationLayoutProps) {
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
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900">
                <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">RORIRI Foundation</h2>
                <p className="text-sm text-muted-foreground">Social Welfare</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {foundationMenuItems.map((item) => (
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

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
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
