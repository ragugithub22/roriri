import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, GraduationCap, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const InstituteDashboardHome = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [instituteName, setInstituteName] = useState<string>("");

  useEffect(() => {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        setUserId(sessionData.originalId || sessionData.userId);
      } catch (error) {
        console.error('Error parsing user session:', error);
      }
    }
  }, []);

  // Fetch institute name from user_login
  const { data: instituteData } = useQuery({
    queryKey: ['institute-data', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_login')
        .select('name, user_type')
        .eq('original_id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (instituteData?.name) {
      setInstituteName(instituteData.name);
    }
  }, [instituteData]);

  // Fetch industrial visit count for this institute
  const { data: industrialVisitCount } = useQuery({
    queryKey: ['institute-industrial-visits', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('industrial_visit_visitors')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  // Fetch internship count
  const { data: internshipCount } = useQuery({
    queryKey: ['institute-internships', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('internship_enquiries')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  // Fetch courses count
  const { data: coursesCount } = useQuery({
    queryKey: ['institute-courses', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {instituteName || 'Institute'}!</h2>
        <p className="text-muted-foreground">Here's an overview of your activities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industrial Visits</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{industrialVisitCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total visits registered</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internship Enquiries</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internshipCount || 0}</div>
            <p className="text-xs text-muted-foreground">Students enrolled</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Training programs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstituteDashboardHome;
