import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavigationItem, navigationItems } from "@/config/RORIRI IT PARK";
import RolesList from "@/pages/RolesList";
import DepartmentList from "@/pages/DepartmentList";
import EmployeeList from "@/pages/EmployeeList";
import MOUManagement from "@/pages/MOUManagement";
import HostelManagement from "@/pages/HostelManagement";
import AssetManagement from "@/pages/AssetManagement";
import EntitiesManagement from "@/pages/EntitiesManagement";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
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

const pageComponents: Record<string, ComponentType | null> = {
  "/roles": RolesList,
  "/departments": DepartmentList,
  "/employees": EmployeeList,
  "/mou": MOUManagement,
  "/hostel": HostelManagement,
  "/asset-management": AssetManagement,
  "/entities": EntitiesManagement,
  "/reports": ReportsPage,
  "/settings": SettingsPage,
};

export default function ITParkDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeItem, setActiveItem] = useState<NavigationItem | null>(null);

  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });
      if (error) return false;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const entityPaths = [
    "/it-academy",
    "/foundation",
    "/farm",
    "/consultancy",
    "/tours-travels",
    "/builders",
  ];

  const filteredNavItems = useMemo(() => {
    return navigationItems.filter(item => {
      if (entityPaths.includes(item.path)) {
        return false;
      }
      if (item.isLogout) return true;
      if (item.adminOnly) return isAdmin;
      return true;
    });
  }, [isAdmin]);

  useEffect(() => {
    if (!activeItem) {
      const firstItem = filteredNavItems.find(item => !item.isLogout);
      if (firstItem) {
        setActiveItem(firstItem);
      }
    }
  }, [filteredNavItems, activeItem]);

  const ActiveComponent = activeItem ? pageComponents[activeItem.path] ?? null : null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">RORIRI IT PARK</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel></SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          onClick={() => {
                            if (item.isLogout) {
                              handleLogout();
                            } else {
                              setActiveItem(item);
                            }
                          }}
                          className="w-full"
                          isActive={activeItem?.path === item.path}
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
        <SidebarInset>
    <DashboardLayout
      entityName="RORIRI IT Park"
      entityIcon={Building2}
      entityColor="from-blue-600 to-indigo-600"
    >
      <div className="space-y-6">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{activeItem?.label ?? "IT Park Overview"}</CardTitle>
              <CardDescription>
                Select a sidebar item to load its module inside the IT Park workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12 text-muted-foreground">
                IT Park dashboard features coming soon...
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
