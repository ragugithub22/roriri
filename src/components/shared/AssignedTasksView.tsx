import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface AssignedTask {
  id: string;
  task_description: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
  trainer_name?: string;
}

interface AssignedTasksViewProps {
  userId: string;
  userType: 'trainee' | 'intern';
}

export default function AssignedTasksView({ userId, userType }: AssignedTasksViewProps) {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["assigned-tasks", userId, userType],
    queryFn: async () => {
      // Fetch tasks assigned to this user
      const { data: tasksData, error: tasksError } = await supabase
        .from("trainer_task_assignments")
        .select("*")
        .eq("assignee_id", userId)
        .eq("assignee_type", userType)
        .order("created_at", { ascending: false });
      
      if (tasksError) throw tasksError;
      if (!tasksData || tasksData.length === 0) return [];

      // Get all trainer IDs
      const trainerIds = [...new Set(tasksData.map((t: any) => t.trainer_id).filter(Boolean))];
      const placeholderId = '00000000-0000-0000-0000-000000000000';

      // Fetch trainer names from profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", trainerIds.length > 0 ? trainerIds : [placeholderId]);

      const profileMap = new Map(profiles?.map((p: any) => [p.id, p.full_name]) || []);

      // Enrich tasks with trainer names
      return tasksData.map((task: any) => ({
        ...task,
        trainer_name: profileMap.get(task.trainer_id) || 'Unknown Trainer'
      })) as AssignedTask[];
    },
    enabled: !!userId
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Tasks</CardTitle>
        <CardDescription>Tasks assigned to you by trainers</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No tasks assigned to you yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Task Description</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task, index) => (
                <TableRow key={task.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2">{task.task_description}</p>
                  </TableCell>
                  <TableCell className="font-medium">{task.trainer_name}</TableCell>
                  <TableCell>{new Date(task.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {task.end_date ? new Date(task.end_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                      {task.status?.replace('_', ' ') || 'Pending'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
