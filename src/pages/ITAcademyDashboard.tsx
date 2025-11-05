import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import KPICard from "@/components/dashboard/KPICard";
import { Code2, Users, BookOpen, Award, LayoutDashboard, GraduationCap, CreditCard, FileText, UserCog, LogOut, Home, ArrowLeft } from "lucide-react";
import UsersRolesManager from "@/components/it-academy/UsersRolesManager";
import CoursesManager from "@/components/it-academy/CoursesManager";
import BatchesManager from "@/components/it-academy/BatchesManager";
import StudentsManager from "@/components/it-academy/StudentsManager";
import PaymentsManager from "@/components/it-academy/PaymentsManager";
import CertificatesManager from "@/components/it-academy/CertificatesManager";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "Dashboard", value: "dashboard", icon: LayoutDashboard },
  { title: "Users & Roles", value: "users", icon: UserCog },
  { title: "Courses", value: "courses", icon: BookOpen },
  { title: "Batches", value: "batches", icon: Code2 },
  { title: "Students", value: "students", icon: Users },
  { title: "Payments", value: "payments", icon: CreditCard },
  { title: "Certificates", value: "certificates", icon: GraduationCap },
];

const ITAcademyDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // Fetch IT courses
  const { data: courses = [] } = useQuery({
    queryKey: ["it-courses"],
    queryFn: async () => {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .maybeSingle();
      
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
        .maybeSingle();
      
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
        .maybeSingle();
      
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

  // Simplified dashboard view: removed quick actions and tables for now

  // Enrollment data removed in simplified view

  const totalCourses = courses.length;
  const totalTrainers = trainers.length;
  const totalTrainees = trainees.length;
  const certificationCourses = courses.filter(c => c.certification_available).length;

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <Code2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">RORIRI IT Academy</h2>
                  <p className="text-xs text-muted-foreground">Super Admin</p>
                </div>
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.value)}
                        isActive={activeTab === item.value}
                        tooltip={item.title}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 space-y-2 border-t">
              <SidebarMenuButton onClick={() => navigate("/")} tooltip="All Entities">
                <Home className="h-4 w-4" />
                <span>All Entities</span>
              </SidebarMenuButton>
              <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center gap-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <SidebarTrigger className="text-white hover:bg-white/20" />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">IT Academy Dashboard</h1>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
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
              </div>
            )}

            {activeTab === "users" && <UsersRolesManager />}
            {activeTab === "courses" && <CoursesManager />}
            {activeTab === "batches" && <BatchesManager />}
            {activeTab === "students" && <StudentsManager />}
            {activeTab === "payments" && <PaymentsManager />}
            {activeTab === "certificates" && <CertificatesManager />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ITAcademyDashboard;
