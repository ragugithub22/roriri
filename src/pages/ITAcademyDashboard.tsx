import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EntitySidebarLayout, { SidebarNavItem } from "@/components/layouts/EntitySidebarLayout";
import KPICard from "@/components/dashboard/KPICard";
import { 
  Code2, 
  Users, 
  BookOpen, 
  Award, 
  GraduationCap,
  FileText,
  CreditCard,
  Award as Certificate,
  FileCheck,
  Clipboard,
  MessageSquareWarning,
  Home,
  UserCheck,
  Briefcase
} from "lucide-react";
import CoursesManager from "@/components/it-academy/CoursesManager";
import SubjectsManager from "@/components/it-academy/SubjectsManager";
import TraineesManager from "@/components/it-academy/TraineesManager";
import PaymentsManager from "@/components/it-academy/PaymentsManager";
import CertificatesManager from "@/components/it-academy/CertificatesManager";
import ApplicationsManager from "../components/it-academy/ApplicationsManager";
import DailyWorkUpdateManager from "../components/it-academy/DailyWorkUpdateManager";
import ComplaintsManager from "../components/it-academy/ComplaintsManager";
import EmployeesManager from "../components/it-academy/EmployeesManager";
import EmployeeDetail from "../components/it-academy/EmployeeDetail";
import SyllabusDetails from "./SyllabusDetails";
import TraineeDetail from "./TraineeDetail";
import CandidatePage from "./internship/CandidatePage";

const baseNavItems: SidebarNavItem[] = [
  { label: "Dashboard", value: "dashboard", icon: Home },
  { label: "Courses", value: "courses", icon: BookOpen },
  { label: "Subjects", value: "subjects", icon: FileText },
  { label: "Employees", value: "employees", icon: UserCheck },
  { label: "Payments", value: "payments", icon: CreditCard },
  { label: "Certificates", value: "certificates", icon: Certificate },
  { label: "Applications", value: "applications", icon: FileCheck },
  { label: "Daily Work Update", value: "daily-work-update", icon: Clipboard },
  { label: "Complaints", value: "complaints", icon: MessageSquareWarning },
];

// Additional menu items for Trainer role
const trainerNavItems: SidebarNavItem[] = [
  { label: "Trainees", value: "trainees", icon: Users },
  { label: "Intern", value: "intern", icon: Briefcase },
];

const ITAcademyDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Get user role from localStorage
  const userRole = useMemo(() => {
    try {
      const session = localStorage.getItem('userSession');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.role?.toLowerCase() || '';
      }
    } catch {
      return '';
    }
    return '';
  }, []);

  // Build nav items based on role
  const navItems = useMemo(() => {
    const items = [...baseNavItems];
    // Add Trainees and Intern menu items for Trainer role
    if (userRole === 'trainer') {
      // Insert after Subjects (index 2) for better UX
      items.splice(3, 0, ...trainerNavItems);
    }
    return items;
  }, [userRole]);

  // Valid tab values for URL hash navigation
  const validTabs = useMemo(() => navItems.map(item => item.value), [navItems]);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
      // Reset detail views when changing tabs
      setSelectedSubjectId(null);
      setSelectedTraineeId(null);
      setSelectedEmployeeId(null);
    }
  }, [location.hash, validTabs]);

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
    <EntitySidebarLayout
      entityName="RORIRI IT Academy"
      entityIcon={GraduationCap}
      navItems={navItems}
      activeItem={activeTab}
      onItemChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === "dashboard" && (
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
        )}

        {activeTab === "courses" && <CoursesManager />}
        
        {activeTab === "subjects" && (
          selectedSubjectId ? (
            <SyllabusDetails subjectId={selectedSubjectId} onBack={() => setSelectedSubjectId(null)} />
          ) : (
            <SubjectsManager onViewSyllabus={(subjectId) => setSelectedSubjectId(subjectId)} />
          )
        )}

        {activeTab === "trainees" && (
          selectedTraineeId ? (
            <TraineeDetail traineeId={selectedTraineeId} onBack={() => setSelectedTraineeId(null)} />
          ) : (
            <TraineesManager onViewTrainee={(traineeId) => setSelectedTraineeId(traineeId)} />
          )
        )}

        {activeTab === "employees" && (
          selectedEmployeeId ? (
            <EmployeeDetail employeeId={selectedEmployeeId} onBack={() => setSelectedEmployeeId(null)} />
          ) : (
            <EmployeesManager onViewEmployee={(employeeId) => setSelectedEmployeeId(employeeId)} />
          )
        )}

        {activeTab === "payments" && <PaymentsManager />}
        {activeTab === "certificates" && <CertificatesManager />}
        {activeTab === "applications" && <ApplicationsManager />}
        {activeTab === "daily-work-update" && <DailyWorkUpdateManager />}
        {activeTab === "complaints" && <ComplaintsManager />}
        {activeTab === "intern" && <CandidatePage />}
      </div>
    </EntitySidebarLayout>
  );
};

export default ITAcademyDashboard;
