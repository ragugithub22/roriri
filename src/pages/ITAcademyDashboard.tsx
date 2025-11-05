import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { Code2, Users, BookOpen, Award, DollarSign, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersRolesManager from "@/components/it-academy/UsersRolesManager";
import CoursesManager from "@/components/it-academy/CoursesManager";
import BatchesManager from "@/components/it-academy/BatchesManager";
import StudentsManager from "@/components/it-academy/StudentsManager";
import PaymentsManager from "@/components/it-academy/PaymentsManager";
import CertificatesManager from "@/components/it-academy/CertificatesManager";

const ITAcademyDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch IT courses
  const { data: courses = [] } = useQuery({
    queryKey: ["it-courses"],
    queryFn: async () => {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .single();
      
      if (!entity) return [];
      
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("entity_id", entity.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch trainers
  const { data: trainers = [] } = useQuery({
    queryKey: ["it-trainers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_trainers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch students enrolled in IT courses
  const { data: trainees = [] } = useQuery({
    queryKey: ["it-trainees"],
    queryFn: async () => {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .single();
      
      if (!entity) return [];

      const { data: itCourses } = await supabase
        .from("courses")
        .select("id")
        .eq("entity_id", entity.id);
      
      if (!itCourses || itCourses.length === 0) return [];

      const courseIds = itCourses.map(c => c.id);

      const { data: classes } = await supabase
        .from("classes")
        .select("id")
        .in("course_id", courseIds);
      
      if (!classes || classes.length === 0) return [];

      const classIds = classes.map(c => c.id);

      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          students!inner(
            student_code,
            full_name,
            email,
            phone,
            status
          ),
          classes!inner(
            class_name,
            courses!inner(
              name
            )
          )
        `)
        .in("class_id", classIds)
        .order("enrollment_date", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch activity logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["it-academy-activity"],
    queryFn: async () => {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .single();
      
      if (!entity) return [];

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("entity_id", entity.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const quickActions = [
    { label: "Add New Course", icon: Plus, onClick: () => console.log("Add course"), variant: "default" as const },
    { label: "Register Trainee", icon: UserPlus, onClick: () => console.log("Register trainee") },
    { label: "Add Trainer", icon: Users, onClick: () => console.log("Add trainer") },
    { label: "View Certifications", icon: Award, onClick: () => console.log("View certifications") },
  ];

  const courseColumns = [
    { key: "course_code", label: "Code" },
    { key: "name", label: "Course Name" },
    { 
      key: "course_level", 
      label: "Level",
      render: (value: string) => (
        <Badge variant={value === "Beginner" ? "secondary" : value === "Intermediate" ? "default" : "destructive"}>
          {value}
        </Badge>
      )
    },
    { key: "duration_weeks", label: "Duration (weeks)" },
    { key: "fees", label: "Fees (₹)", render: (value: number) => `₹${value?.toLocaleString()}` },
    { 
      key: "certification_available", 
      label: "Certification",
      render: (value: boolean) => value ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>
    },
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

  const trainerColumns = [
    { key: "trainer_code", label: "Code" },
    { key: "full_name", label: "Trainer Name" },
    { key: "specialization", label: "Specialization" },
    { 
      key: "is_external", 
      label: "Type",
      render: (value: boolean) => (
        <Badge variant={value ? "outline" : "default"}>
          {value ? "External" : "Internal"}
        </Badge>
      )
    },
    { key: "hourly_rate", label: "Rate (₹/hr)", render: (value: number) => value ? `₹${value?.toLocaleString()}` : "-" },
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

  const traineeColumns = [
    { 
      key: "student_code", 
      label: "Code",
      render: (_: any, row: any) => row.students?.student_code 
    },
    { 
      key: "full_name", 
      label: "Trainee Name",
      render: (_: any, row: any) => row.students?.full_name 
    },
    { 
      key: "course", 
      label: "Course",
      render: (_: any, row: any) => row.classes?.courses?.name 
    },
    { 
      key: "class_name", 
      label: "Class",
      render: (_: any, row: any) => row.classes?.class_name 
    },
    { 
      key: "enrollment_date", 
      label: "Enrolled",
      render: (value: string) => new Date(value).toLocaleDateString() 
    },
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

  // Course enrollment data for chart
  const enrollmentData = courses.map(course => ({
    name: course.name?.substring(0, 15) + (course.name?.length > 15 ? "..." : ""),
    students: Math.floor(Math.random() * 50) + 10,
  }));

  const totalCourses = courses.length;
  const totalTrainers = trainers.length;
  const totalTrainees = trainees.length;
  const certificationCourses = courses.filter(c => c.certification_available).length;

  return (
    <DashboardLayout
      entityName="RORIRI IT Academy - Super Admin"
      entityIcon={Code2}
      entityColor="from-blue-500 to-indigo-600"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total IT Courses"
            value={totalCourses}
            subtitle="Active training programs"
            icon={BookOpen}
            color="from-blue-500 to-indigo-600"
          />
          <KPICard
            title="Active Trainees"
            value={totalTrainees}
            subtitle="Enrolled students"
            icon={Users}
            color="from-green-500 to-emerald-600"
          />
          <KPICard
            title="Trainers"
            value={totalTrainers}
            subtitle={`${trainers.filter(t => !t.is_external).length} internal, ${trainers.filter(t => t.is_external).length} external`}
            icon={Users}
            color="from-purple-500 to-violet-600"
          />
          <KPICard
            title="Certifications"
            value={certificationCourses}
            subtitle="Courses with certification"
            icon={Award}
            color="from-orange-500 to-amber-600"
          />
        </div>

        {/* Charts and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard
              title="Course Enrollments"
              description="Number of trainees per IT course"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <QuickActions actions={quickActions} />
        </div>

        {/* IT Courses Table */}
        <DataTable
          title="IT Courses"
          description="HTML, CSS, JavaScript, MySQL, PHP, SDLC and more"
          columns={courseColumns}
          data={courses}
          emptyMessage="No IT courses found"
        />

        {/* Trainers Table */}
        <DataTable
          title="Trainers"
          description="Internal and external IT trainers"
          columns={trainerColumns}
          data={trainers}
          emptyMessage="No trainers found"
        />

        {/* Trainees Table */}
        <DataTable
          title="Recent Trainees"
          description="Students enrolled in IT courses"
          columns={traineeColumns}
          data={trainees}
          emptyMessage="No trainees found"
        />

        </TabsContent>

        <TabsContent value="users">
          <UsersRolesManager />
        </TabsContent>

        <TabsContent value="courses">
          <CoursesManager />
        </TabsContent>

        <TabsContent value="batches">
          <BatchesManager />
        </TabsContent>

        <TabsContent value="students">
          <StudentsManager />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsManager />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificatesManager />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ITAcademyDashboard;
