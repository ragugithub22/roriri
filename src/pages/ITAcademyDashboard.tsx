import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import KPICard from "@/components/dashboard/KPICard";
import { Code2, Users, BookOpen, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CoursesManager from "@/components/it-academy/CoursesManager";
import SubjectsManager from "@/components/it-academy/SubjectsManager";
import SyllabusManager from "@/components/it-academy/SyllabusManager";
import TraineesManager from "@/components/it-academy/TraineesManager";
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

  // Fetch trainees enrolled in IT courses
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
    <DashboardLayout
      entityName="RORIRI IT Academy - Super Admin"
      entityIcon={Code2}
      entityColor="from-blue-500 to-indigo-600"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" orientation="vertical">
        <div className="flex gap-6">
          <TabsList className="flex flex-col h-fit w-48 space-y-1">
            <TabsTrigger value="dashboard" className="w-full justify-start">Dashboard</TabsTrigger>
            <TabsTrigger value="courses" className="w-full justify-start">Courses</TabsTrigger>
            <TabsTrigger value="subjects" className="w-full justify-start">Subjects</TabsTrigger>
            <TabsTrigger value="syllabus" className="w-full justify-start">Syllabus</TabsTrigger>
            <TabsTrigger value="trainees" className="w-full justify-start">Trainees</TabsTrigger>
            <TabsTrigger value="payments" className="w-full justify-start">Payments</TabsTrigger>
            <TabsTrigger value="certificates" className="w-full justify-start">Certificates</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            <TabsContent value="dashboard" className="mt-0">
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
                  subtitle="Enrolled trainees"
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
            </TabsContent>

            <TabsContent value="courses" className="mt-0">
              <CoursesManager />
            </TabsContent>

            <TabsContent value="subjects" className="mt-0">
              <SubjectsManager />
            </TabsContent>

            <TabsContent value="syllabus" className="mt-0">
              <SyllabusManager />
            </TabsContent>

            <TabsContent value="trainees" className="mt-0">
              <TraineesManager />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentsManager />
            </TabsContent>

            <TabsContent value="certificates" className="mt-0">
              <CertificatesManager />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </DashboardLayout>
  );
};

export default ITAcademyDashboard;
