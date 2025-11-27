import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  SidebarInset,
} from "@/components/ui/sidebar";

export interface SidebarNavItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface EntitySidebarLayoutProps {
  children: ReactNode;
  entityName: string;
  entityIcon: LucideIcon;
  navItems: SidebarNavItem[];
  activeItem: string;
  onItemChange: (value: string) => void;
}

export default function EntitySidebarLayout({
  children,
  entityName,
  entityIcon: EntityIcon,
  navItems,
  activeItem,
  onItemChange,
}: EntitySidebarLayoutProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="border-b border-white/10 bg-gradient-to-b from-blue-600 to-indigo-600">
            <div className="flex items-center gap-2 px-4 py-3">
              <EntityIcon className="h-6 w-6 text-white" />
              <h1 className="text-lg font-bold text-white">{entityName}</h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-gradient-to-b from-blue-600 to-indigo-600">
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70 text-xs uppercase tracking-wider px-4">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.value}>
                        <SidebarMenuButton
                          onClick={() => onItemChange(item.value)}
                          className={`w-full text-white hover:bg-white/20 ${
                            activeItem === item.value ? "bg-white/20 font-semibold" : ""
                          }`}
                          isActive={activeItem === item.value}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 shadow-md border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/it-park", { state: { showEntities: true } })}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-xl font-semibold">{entityName}</h2>
                  <p className="text-sm text-white/80">Dashboard & Management</p>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-white/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 bg-background min-h-[calc(100vh-73px)]">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
