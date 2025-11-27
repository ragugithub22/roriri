import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, ClipboardList, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const UserDashboardHome = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: applicationsCount } = useQuery({
    queryKey: ['user-applications-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('academy_applications')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user?.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const { data: dailyUpdatesCount } = useQuery({
    queryKey: ['user-daily-updates-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('academy_daily_work_updates')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', user?.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const { data: complaintsCount } = useQuery({
    queryKey: ['user-complaints-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('academy_complaints')
        .select('*', { count: 'exact', head: true })
        .eq('complaint_from', user?.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name || 'User'}!</h2>
        <p className="text-muted-foreground">Here's an overview of your activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total applications submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Updates</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyUpdatesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Work updates logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaintsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Complaints filed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Available for viewing</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardHome;
