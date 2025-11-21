import { useState } from "react";
import { Laptop, Users, Code, TrendingUp, Shield, Building2, DollarSign, FileText, UserCheck, Calendar, Briefcase, User, MessageSquare, Settings, Target, Handshake, Clock, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import AllEnquiries from "./AllEnquiries";
import EmployeeDetail from "./EmployeeDetail";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: Laptop },
  { id: "employee", label: "Employee", icon: User },
  { id: "attendance", label: "Attendance", icon: UserCheck },
  { id: "task-details", label: "Task Details", icon: Clock },
  { id: "meeting-details", label: "Meeting Details", icon: Calendar },
  { id: "project-details", label: "Project Details", icon: Briefcase },
  { id: "clients", label: "Clients", icon: Users },
  { id: "internship", label: "Internship", icon: Code },
  { id: "enquiry-details", label: "Enquiry Details", icon: FileText },
  { id: "coordinator", label: "Coordinator", icon: Target },
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
      case "all-enquiries":
        return <AllEnquiries />;
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

const DashboardContent: React.FC = () => {
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

  const { data: totalClients = 0 } = useQuery({
    queryKey: ["total-it-clients"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("it_clients")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalProjects = 0 } = useQuery({
    queryKey: ["total-it-projects"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("it_projects")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: projectEnquiries = 0 } = useQuery({
    queryKey: ["total-it-enquiries"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("it_client_enquiries")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: completedProjects = 0 } = useQuery({
    queryKey: ["completed-it-projects"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("it_projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: monthlyRevenue = 0 } = useQuery({
    queryKey: ["monthly-it-revenue"],
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="Total Employees"
          value={totalEmployees}
          subtitle="Staff members"
          trend={8}
          icon={Users}
          color="from-green-500 to-emerald-500"
        />
        <KPICard
          title="Total Clients"
          value={totalClients}
          subtitle="Active clients"
          trend={12}
          icon={User}
          color="from-blue-500 to-indigo-500"
        />
        <KPICard
          title="Total Projects"
          value={totalProjects}
          subtitle="All projects"
          trend={15}
          icon={Briefcase}
          color="from-purple-500 to-violet-500"
        />
        <KPICard
          title="Project Enquiries"
          value={projectEnquiries}
          subtitle="Client enquiries"
          trend={10}
          icon={FileText}
          color="from-orange-500 to-red-500"
        />
        <KPICard
          title="Completed Projects"
          value={completedProjects}
          subtitle="Finished projects"
          trend={20}
          icon={CheckCircle}
          color="from-teal-500 to-cyan-500"
        />
        <KPICard
          title="Monthly Revenue"
          value={`₹${monthlyRevenue.toLocaleString()}`}
          subtitle="Monthly earnings"
          trend={15}
          icon={DollarSign}
          color="from-yellow-500 to-orange-500"
        />
      </div>


    </>
  );
};

export default ITDashboard;
