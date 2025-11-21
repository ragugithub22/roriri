import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Car,
  User,
  Receipt,
  DollarSign,
  TrendingUp,
  FileText as DocumentIcon,
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

interface ToursTravelsLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

const toursTravelsMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/tours-travels",
    id: "dashboard"
  },
  {
    title: "Tour Packages",
    icon: MapPin,
    path: "/tours-travels/packages",
    id: "packages"
  },
  {
    title: "Customers",
    icon: Users,
    path: "/tours-travels/customers",
    id: "customers"
  },
  {
    title: "Enquiries",
    icon: FileText,
    path: "/tours-travels/enquiries",
    id: "enquiries"
  },
  {
    title: "Bookings",
    icon: Calendar,
    path: "/tours-travels/bookings",
    id: "bookings"
  },
  {
    title: "Trip Management",
    icon: MapPin,
    path: "/tours-travels/trips",
    id: "trips"
  },
  {
    title: "Vehicle Management",
    icon: Car,
    path: "/tours-travels/vehicles",
    id: "vehicles"
  },
  {
    title: "Driver Management",
    icon: User,
    path: "/tours-travels/drivers",
    id: "drivers"
  },
  {
    title: "Quotations",
    icon: Receipt,
    path: "/tours-travels/quotations",
    id: "quotations"
  },
  {
    title: "Payments",
    icon: DollarSign,
    path: "/tours-travels/payments",
    id: "payments"
  },
  {
    title: "Expenses",
    icon: TrendingUp,
    path: "/tours-travels/expenses",
    id: "expenses"
  },
  {
    title: "Documents",
    icon: DocumentIcon,
    path: "/tours-travels/documents",
    id: "documents"
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/tours-travels/reports",
    id: "reports"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/tours-travels/settings",
    id: "settings"
  }
];

export default function ToursTravelsLayout({ children, activeSection }: ToursTravelsLayoutProps) {
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
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Rithish Tours & Travels</h2>
                <p className="text-sm text-muted-foreground">Tour Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {toursTravelsMenuItems.map((item) => (
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
