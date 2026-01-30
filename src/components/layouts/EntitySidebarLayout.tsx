import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import roririLogo from "@/assets/roriri-round-logo.png";
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
          <SidebarHeader className="h-[73px] border-b border-white/10 bg-gradient-to-b from-cyan-600 to-teal-600 flex items-center">
            <div className="flex items-center gap-2 px-4">
              <img src={roririLogo} alt="RORIRI Logo" className="h-8 w-8 rounded-full" />
              <h1 className="text-lg font-bold text-white">{entityName}</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
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
                          className={`hover:bg-gradient-to-r hover:from-cyan-600 hover:to-teal-600 hover:text-white ${
                            activeItem === item.value ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold" : ""
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
          <header className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-6 px-6 shadow-md">
            <div className="container mx-auto max-w-7xl">
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
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <EntityIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{entityName}</h1>
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
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
