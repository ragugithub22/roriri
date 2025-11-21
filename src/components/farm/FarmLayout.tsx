import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  LayoutDashboard,
  Calendar,
  Gamepad2,
  Utensils,
  UserCheck,
  Ticket,
  BookOpen,
  ShoppingCart,
  CreditCard,
  Receipt,
  Megaphone,
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

interface FarmLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

const farmMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/farm",
    id: "dashboard"
  },
  {
    title: "Events / Farm Activities",
    icon: Calendar,
    path: "/farm/events",
    id: "events"
  },
  {
    title: "Games / Activities",
    icon: Gamepad2,
    path: "/farm/games",
    id: "games"
  },
  {
    title: "Food & Beverages",
    icon: Utensils,
    path: "/farm/food",
    id: "food"
  },
  {
    title: "Visitor Entry",
    icon: UserCheck,
    path: "/farm/visitors",
    id: "visitors"
  },
  {
    title: "Tickets & Pricing",
    icon: Ticket,
    path: "/farm/tickets",
    id: "tickets"
  },
  {
    title: "Bookings / Reservations",
    icon: BookOpen,
    path: "/farm/bookings",
    id: "bookings"
  },
  {
    title: "Food Orders",
    icon: ShoppingCart,
    path: "/farm/food-orders",
    id: "food-orders"
  },
  {
    title: "Payments / Revenue",
    icon: CreditCard,
    path: "/farm/payments",
    id: "payments"
  },
  {
    title: "Expenses",
    icon: Receipt,
    path: "/farm/expenses",
    id: "expenses"
  },
  {
    title: "Announcements",
    icon: Megaphone,
    path: "/farm/announcements",
    id: "announcements"
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/farm/reports",
    id: "reports"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/farm/settings",
    id: "settings"
  }
];

export default function FarmLayout({ children, activeSection }: FarmLayoutProps) {
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
                <Sprout className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Rithish Farms</h2>
                <p className="text-sm text-muted-foreground">Farm Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {farmMenuItems.map((item) => (
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
