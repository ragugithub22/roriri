import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavigationItem, navigationItems } from "@/config/RORIRI IT PARK";
import RolesList from "@/pages/RolesList";
import DepartmentList from "@/pages/DepartmentList";
import EmployeeList from "@/pages/EmployeeList";
import EmployeeDetail from "@/pages/EmployeeDetail";
import MOUManagement from "@/pages/MOUManagement";
import HostelManagement from "@/pages/HostelManagement";
import HostelResidentDetail from "@/pages/HostelResidentDetail";
import AssetManagement from "@/pages/AssetManagement";
import EntitiesManagement from "@/pages/EntitiesManagement";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import IndustrialVisit from "@/pages/IndustrialVisit";
import IndustrialVisitEnquiry from "@/pages/IndustrialVisitEnquiry";
import IndustrialVisitVisitors from "@/pages/IndustrialVisitVisitors";
import KPICard from "@/components/dashboard/KPICard";
import { Users, Shield, DollarSign, Building2 } from "lucide-react";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";

const pageComponents: Record<string, ComponentType | null> = {
  "/roles": RolesList,
  "/departments": DepartmentList,
  "/employees": EmployeeList,
  "/mou": MOUManagement,
  "/asset-management": AssetManagement,
  "/entities": EntitiesManagement,
  "/industrial-visit": IndustrialVisit,
  "/industrial-visit/enquiry": IndustrialVisitEnquiry,
  "/industrial-visit/visitors": IndustrialVisitVisitors,
  "/reports": ReportsPage,
  "/settings": SettingsPage,
};

export default function ITParkDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [activeItem, setActiveItem] = useState<NavigationItem | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [selectedResidentType, setSelectedResidentType] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

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
    // Check if we should show entities page (coming from entity dashboard)
    if (location.state?.showEntities) {
      const entitiesItem = filteredNavItems.find(item => item.path === "/entities");
      if (entitiesItem) {
        setActiveItem(entitiesItem);
        // Clear the state to prevent it from persisting
        navigate("/it-park", { replace: true, state: {} });
        return;
      }
    }
    
    if (!activeItem) {
      const firstItem = filteredNavItems.find(item => !item.isLogout);
      if (firstItem) {
        setActiveItem(firstItem);
      }
    }
  }, [filteredNavItems, activeItem, location.state, navigate]);

  const ActiveComponent = activeItem ? pageComponents[activeItem.path] ?? null : null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="border-b p-4 bg-gradient-to-b from-blue-600 to-indigo-600">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-white" />
              <h1 className="text-lg font-bold text-white">RORIRI IT PARK</h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-gradient-to-b from-blue-600 to-indigo-600">
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70 text-xs uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
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
                          className={`text-white hover:bg-white/20 ${
                            activeItem?.path === item.path ? "bg-white/20 font-semibold" : ""
                          }`}
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
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-50">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white hover:bg-white/20" />
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">RORIRI IT Park</h2>
                    <p className="text-sm text-white/80">Dashboard & Management</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 bg-background min-h-[calc(100vh-73px)]">
            <div className="space-y-6">
              {activeItem?.path === "/hostel" ? (
                selectedResidentId && selectedResidentType ? (
                  <HostelResidentDetail
                    residentId={selectedResidentId}
                    residentType={selectedResidentType}
                    onBack={() => {
                      setSelectedResidentId(null);
                      setSelectedResidentType(null);
                    }}
                  />
                ) : (
                  <HostelManagement
                    onViewResident={(id, type) => {
                      setSelectedResidentId(id);
                      setSelectedResidentType(type);
                    }}
                  />
                )
              ) : activeItem?.path === "/employees" ? (
                selectedEmployeeId ? (
                  <EmployeeDetail
                    employeeId={selectedEmployeeId}
                    onBack={() => setSelectedEmployeeId(null)}
                  />
                ) : (
                  <EmployeeList
                    onViewEmployee={(id) => setSelectedEmployeeId(id)}
                  />
                )
              ) : ActiveComponent ? (
                ActiveComponent === IndustrialVisit ? (
                  <IndustrialVisit onNavigate={(path) => setActiveItem({ path } as NavigationItem)} />
                ) : (
                  <ActiveComponent />
                )
              ) : (
                <DashboardContent />
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const DashboardContent = () => {
  const { data: totalRoles = 0 } = useQuery({
    queryKey: ["total-roles"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("roles")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalDepartments = 0 } = useQuery({
    queryKey: ["total-departments"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("departments")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalEmployees = 0 } = useQuery({
    queryKey: ["total-employees"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: monthlyRevenue = 0 } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data, error } = await supabase
        .from("academy_payments")
        .select("amount")
        .gte("payment_date", `${currentMonth}-01`)
        .lt("payment_date", `${currentMonth}-32`);
      if (error) throw error;

      const academyRevenue = data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Add revenue from other entities if needed
      const { data: foundationData } = await supabase
        .from("foundation_donations")
        .select("amount")
        .gte("donation_date", `${currentMonth}-01`)
        .lt("donation_date", `${currentMonth}-32`);

      const foundationRevenue = foundationData?.reduce((sum, donation) => sum + (donation.amount || 0), 0) || 0;

      return academyRevenue + foundationRevenue;
    },
  });



  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Roles"
          value={totalRoles}
          subtitle="System roles"
          trend={5}
          icon={Shield}
          color="from-indigo-500 to-blue-500"
        />
        <KPICard
          title="Total Departments"
          value={totalDepartments}
          subtitle="Active departments"
          trend={12}
          icon={Building2}
          color="from-purple-500 to-violet-500"
        />
        <KPICard
          title="Total Employees"
          value={totalEmployees}
          subtitle="Staff members"
          trend={8}
          icon={Users}
          color="from-green-500 to-emerald-500"
        />
        <KPICard
          title="Revenue This Month"
          value={`₹${monthlyRevenue.toLocaleString()}`}
          subtitle="Monthly earnings"
          trend={15}
          icon={DollarSign}
          color="from-cyan-500 to-blue-500"
        />
      </div>


    </>
  );
};
