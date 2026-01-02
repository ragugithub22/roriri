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
import IndustrialVisitInterviews from "@/pages/IndustrialVisitInterviews";
import IndustrialVisitNormalVisitors from "@/pages/IndustrialVisitNormalVisitors";
import IndustrialVisitPaymentReport from "@/pages/IndustrialVisitPaymentReport";
import LetterManagement from "@/pages/LetterManagement";
import ChatBox from "@/components/chat/ChatBox";
import UsersManager from "@/components/it-park/UsersManager";
import UserModulesPage from "@/pages/UserModulesPage";
import KPICard from "@/components/dashboard/KPICard";
import { Users, Shield, DollarSign, Building2, ArrowLeft, LogOut } from "lucide-react";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";

const pageComponents: Record<string, ComponentType | null> = {
  "/it-park": null, // Dashboard - handled separately
  "/roles": RolesList,
  "/departments": DepartmentList,
  "/employees": EmployeeList,
  "/mou": MOUManagement,
  "/hostel": HostelManagement,
  "/asset-management": AssetManagement,
  "/entities": EntitiesManagement,
  "/letters": LetterManagement,
  "/chat": ChatBox,
  "/users": UsersManager,
  "/industrial-visit": IndustrialVisit,
  "/industrial-visit/enquiry": IndustrialVisitEnquiry,
  "/industrial-visit/visitors": IndustrialVisitVisitors,
  "/industrial-visit/interviews": IndustrialVisitInterviews,
  "/industrial-visit/normal-visitors": IndustrialVisitNormalVisitors,
  "/industrial-visit/payment-report": IndustrialVisitPaymentReport,
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ['is-admin', (user as any)?.id || (user as any)?.userId],
    queryFn: async () => {
      if (!user) return false;

      // Check if this is a custom login user (from our user_login system)
      const customUser = user as any;
      if (customUser.role) {
        // For custom login users, check role directly
        return customUser.role === 'super_admin' || customUser.role === 'admin';
      }

      // For Supabase auth users, check the traditional way
      if (!customUser.id) return false;

      // First check if this is the super admin by email or username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', customUser.id)
        .single();

      if (profile && (profile.username === 'admin' || profile.email === 'admin@roririsoft.com')) {
        return true;
      }

      // Otherwise check role-based admin status
      const { data, error } = await supabase.rpc('is_admin', { _user_id: customUser.id });
      if (error) return false;
      return data;
    },
    enabled: !!user,
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
    // While loading admin status, show all items to avoid flickering
    if (isAdminLoading) {
      return navigationItems.filter(item => !entityPaths.includes(item.path));
    }
    
    return navigationItems.filter(item => {
      if (entityPaths.includes(item.path)) {
        return false;
      }
      if (item.isLogout) return true;
      if (item.adminOnly) return isAdmin;
      return true;
    });
  }, [isAdmin, isAdminLoading]);

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

  // Check if activeItem path is in pageComponents, even for sub-paths like /industrial-visit/interviews
  const ActiveComponent = activeItem?.path ? pageComponents[activeItem.path] ?? null : null;

  // Show dashboard content when no specific component is selected or for dashboard path
  const shouldShowDashboard = !activeItem || activeItem.path === "/it-park" || (!ActiveComponent && !activeItem.path.startsWith("/industrial-visit/"));

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="h-[73px] border-b bg-gradient-to-b from-cyan-600 to-teal-600 flex items-center px-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-white" />
              <h1 className="text-lg font-bold text-white">RORIRI IT PARK</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavItems.filter(item => !item.isLogout).map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          onClick={() => setActiveItem(item)}
                          className={`hover:bg-gradient-to-r hover:from-cyan-600 hover:to-teal-600 hover:text-white ${
                            activeItem?.path === item.path ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold" : ""
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
          {/* Header */}
          <header className="bg-gradient-primary text-primary-foreground py-6 px-6 shadow-medium">
            <div className="container mx-auto max-w-7xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => navigate("/it-park", { state: { showEntities: true } })}
                    className="text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-foreground/20">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">RORIRI IT Park</h1>
                      <p className="text-sm opacity-90">Dashboard & Analytics</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-primary-foreground hover:bg-primary-foreground/20"
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
              ) : activeItem?.path === "/users" ? (
                selectedUserId ? (
                  <UserModulesPage
                    userId={selectedUserId}
                    onBack={() => setSelectedUserId(null)}
                  />
                ) : (
                  <UsersManager
                    onViewUser={(id) => setSelectedUserId(id)}
                  />
                )
              ) : ActiveComponent ? (
                ActiveComponent === IndustrialVisit ? (
                  <IndustrialVisit onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />
                ) : ActiveComponent === IndustrialVisitEnquiry ? (
                  <IndustrialVisitEnquiry onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />
                ) : ActiveComponent === IndustrialVisitVisitors ? (
                  <IndustrialVisitVisitors onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />
                ) : ActiveComponent === IndustrialVisitInterviews ? (
                  <IndustrialVisitInterviews onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />
                ) : ActiveComponent === IndustrialVisitNormalVisitors ? (
                  <IndustrialVisitNormalVisitors onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />
                ) : ActiveComponent === IndustrialVisitPaymentReport ? (
                  <IndustrialVisitPaymentReport onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />
                ) : (
                  <ActiveComponent />
                )
              ) : activeItem?.path?.startsWith("/industrial-visit/") ? (
                (() => {
                  const SubComponent = pageComponents[activeItem.path];
                  if (SubComponent === IndustrialVisitEnquiry) {
                    return <IndustrialVisitEnquiry onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />;
                  }
                  if (SubComponent === IndustrialVisitVisitors) {
                    return <IndustrialVisitVisitors onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />;
                  }
                  if (SubComponent === IndustrialVisitInterviews) {
                    return <IndustrialVisitInterviews onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />;
                  }
                  if (SubComponent === IndustrialVisitNormalVisitors) {
                    return <IndustrialVisitNormalVisitors onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />;
                  }
                  if (SubComponent === IndustrialVisitPaymentReport) {
                    return <IndustrialVisitPaymentReport onNavigate={(path) => setActiveItem({ path, label: path, icon: Building2 } as NavigationItem)} />;
                  }
                  return SubComponent ? <SubComponent /> : <DashboardContent />;
                })()
              ) : shouldShowDashboard ? (
                <DashboardContent />
              ) : null}
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

      const academyRevenue = (data as any)?.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) || 0;

      // Add revenue from other entities if needed
      const { data: foundationData } = await supabase
        .from("donations")
        .select("amount")
        .gte("donation_date", `${currentMonth}-01`)
        .lt("donation_date", `${currentMonth}-32`);

      const foundationRevenue = (foundationData as any)?.reduce((sum: number, donation: any) => sum + (donation.amount || 0), 0) || 0;

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
