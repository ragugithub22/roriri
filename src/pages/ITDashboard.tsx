import { useState } from "react";
import { Laptop, Users, Code, TrendingUp, Plus, Bug, Shield, Building2, DollarSign, FileText, UserCheck, Calendar, Briefcase, User, MessageSquare, Settings, Target, Handshake, Clock } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
import EnquiryDetails from "./EnquiryDetails";
import Attendance from "./Attendance";
import ProjectDetails from "./ProjectDetails";
import Internship from "./Internship";
import MeetingDetails from "./MeetingDetails";
import Clients from "./Clients";
import Employee from "./Employee";
import MOU from "./MOU";
import Coordinator from "./Coordinator";
import TaskDetails from "./TaskDetails";
import ClientEnquiry from "./ClientEnquiry";
import EmployeeDetail from "./EmployeeDetail";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: Laptop },
  { id: "enquiry-details", label: "Enquiry Details", icon: FileText },
  { id: "employee", label: "Employee", icon: User },
  { id: "attendance", label: "Attendance", icon: UserCheck },
  { id: "clients", label: "Clients", icon: Users },
  { id: "project-details", label: "Project Details", icon: Briefcase },
  { id: "coordinator", label: "Coordinator", icon: Target },
  { id: "internship", label: "Internship", icon: Code },
  { id: "mou", label: "MOU", icon: Handshake },
  { id: "task-details", label: "Task Details", icon: Clock },
  { id: "meeting-details", label: "Meeting Details", icon: Calendar },
];

const ITDashboard = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const renderActiveComponent = () => {
    switch (activeItem) {
      case "dashboard":
        return <DashboardContent />;
      case "enquiry-details":
        return <EnquiryDetails onNavigate={setActiveItem} />;
      case "project-enquiry":
        return <ClientEnquiry />;
      case "employee":
        return <Employee onViewEmployee={(id) => {
          setSelectedEmployeeId(id);
          setActiveItem("employee-detail");
        }} />;
      case "employee-detail":
        return <EmployeeDetail employeeId={selectedEmployeeId} onBack={() => setActiveItem("employee")} />;
      case "attendance":
        return <Attendance />;
      case "clients":
        return <Clients />;
      case "project-details":
        return <ProjectDetails />;
      case "coordinator":
        return <Coordinator />;
      case "internship":
        return <Internship />;
      case "mou":
        return <MOU />;
      case "task-details":
        return <TaskDetails />;
      case "meeting-details":
        return <MeetingDetails />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Laptop className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">IT Company</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel></SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveItem(item.id)}
                          className="w-full"
                          isActive={activeItem === item.id}
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
            entityName="RORIRI IT Company"
            entityIcon={Laptop}
            entityColor="from-indigo-500 to-blue-500"
          >
            {renderActiveComponent()}
          </DashboardLayout>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

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

  const { data: projects = [] } = useQuery({
    queryKey: ["it-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_projects")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["it-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_clients")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["it-activities"],
    queryFn: async () => {
      const { data: entityData } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_company")
        .single();

      if (!entityData) return [];

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("entity_id", entityData.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  const quickActions = [
    { label: "New Project", icon: Plus, onClick: () => {}, variant: "default" as const },
    { label: "Add Client", icon: Users, onClick: () => {} },
    { label: "Track Bugs", icon: Bug, onClick: () => {} },
    { label: "Code Review", icon: Code, onClick: () => {} },
  ];

  const projectColumns = [
    { key: "project_code", label: "Project Code" },
    { key: "name", label: "Name" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    },
    { key: "technology_stack", label: "Tech Stack" },
  ];

  const projectStatusData = [
    { status: "Planning", count: 4 },
    { status: "Development", count: 12 },
    { status: "Testing", count: 6 },
    { status: "Deployed", count: 12 },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Project Pipeline"
          description="Projects by development stage"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <QuickActions actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Active Projects"
            description="Current software development projects"
            columns={projectColumns}
            data={projects}
            emptyMessage="No projects found"
          />
        </div>

        <ActivityFeed activities={activities} />
      </div>
    </>
  );
};

export default ITDashboard;
