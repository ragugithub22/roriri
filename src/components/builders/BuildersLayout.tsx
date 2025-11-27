import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  MapPin,
  HardHat,
  Users,
  Package,
  UserCheck,
  DollarSign,
  FileText,
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

interface BuildersLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

const buildersMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/builders",
    id: "dashboard"
  },
  {
    title: "Projects",
    icon: Building2,
    path: "/builders/projects",
    id: "projects"
  },
  {
    title: "Sites",
    icon: MapPin,
    path: "/builders/sites",
    id: "sites"
  },
  {
    title: "Contractors",
    icon: HardHat,
    path: "/builders/contractors",
    id: "contractors"
  },
  {
    title: "Labour",
    icon: Users,
    path: "/builders/labour",
    id: "labour"
  },
  {
    title: "Materials",
    icon: Package,
    path: "/builders/materials",
    id: "materials"
  },
  {
    title: "Clients",
    icon: UserCheck,
    path: "/builders/clients",
    id: "clients"
  },
  {
    title: "Finance",
    icon: DollarSign,
    path: "/builders/finance",
    id: "finance"
  },
  {
    title: "Documents",
    icon: FileText,
    path: "/builders/documents",
    id: "documents"
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/builders/reports",
    id: "reports"
  },
  {
    title: "Users & Roles",
    icon: Users,
    path: "/builders/users",
    id: "users"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/builders/settings",
    id: "settings"
  }
];

export default function BuildersLayout({ children, activeSection }: BuildersLayoutProps) {
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
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Roshan Builders</h2>
                <p className="text-sm text-muted-foreground">Construction Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {buildersMenuItems.map((item) => (
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
