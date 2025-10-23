import { GraduationCap, Users, BookOpen, TrendingUp, Plus, FileText } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import ChartCard from "@/components/dashboard/ChartCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AcademyDashboard = () => {
  // Fetch students data
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch courses data
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent activity
  const { data: activities = [] } = useQuery({
    queryKey: ["academy-activities"],
    queryFn: async () => {
      const { data: entityData } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "academy")
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
    { label: "Add New Student", icon: Plus, onClick: () => console.log("Add student"), variant: "default" as const },
    { label: "Create Course", icon: BookOpen, onClick: () => console.log("Create course") },
    { label: "View Reports", icon: FileText, onClick: () => console.log("View reports") },
    { label: "Manage Classes", icon: Users, onClick: () => console.log("Manage classes") },
  ];

  const studentColumns = [
    { key: "student_code", label: "Student ID" },
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { 
      key: "status", 
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    },
  ];

  // Sample chart data
  const enrollmentData = [
    { month: "Jan", students: 200 },
    { month: "Feb", students: 230 },
    { month: "Mar", students: 280 },
    { month: "Apr", students: 310 },
    { month: "May", students: 350 },
    { month: "Jun", students: 400 },
  ];

  return (
    <DashboardLayout
      entityName="RORIRI Academy"
      entityIcon={GraduationCap}
      entityColor="from-blue-500 to-cyan-500"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Students"
          value={students.length}
          subtitle="Active enrollments"
          trend={12}
          icon={Users}
          color="from-blue-500 to-cyan-500"
        />
        <KPICard
          title="Total Courses"
          value={courses.length}
          subtitle="Available programs"
          trend={8}
          icon={BookOpen}
          color="from-purple-500 to-pink-500"
        />
        <KPICard
          title="Completion Rate"
          value="87%"
          subtitle="Student success"
          trend={5}
          icon={TrendingUp}
          color="from-green-500 to-emerald-500"
        />
        <KPICard
          title="Active Classes"
          value="24"
          subtitle="Running sessions"
          trend={15}
          icon={GraduationCap}
          color="from-orange-500 to-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Student Enrollment Trend"
          description="Monthly enrollment growth"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <QuickActions actions={quickActions} />
      </div>

      {/* Data Tables and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            title="Recent Students"
            description="Latest student enrollments"
            columns={studentColumns}
            data={students}
            emptyMessage="No students found"
          />
        </div>
        
        <ActivityFeed activities={activities} />
      </div>
    </DashboardLayout>
  );
};

export default AcademyDashboard;
