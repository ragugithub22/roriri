import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AssignedTask {
  id: string;
  task_description: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
  trainer_name?: string;
  file_url?: string | null;
  file_name?: string | null;
}

interface AssignedTasksViewProps {
  userId: string;
  userType: 'trainee' | 'intern';
}

export default function AssignedTasksView({ userId, userType }: AssignedTasksViewProps) {
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["assigned-tasks", userId, userType],
    queryFn: async () => {
      const { data: tasksData, error: tasksError } = await supabase
        .from("trainer_task_assignments")
        .select("*")
        .eq("assignee_id", userId)
        .eq("assignee_type", userType)
        .order("created_at", { ascending: false });
      
      if (tasksError) throw tasksError;
      if (!tasksData || tasksData.length === 0) return [];

      const trainerIds = [...new Set(tasksData.map((t: any) => t.trainer_id).filter(Boolean))];
      const placeholderId = '00000000-0000-0000-0000-000000000000';

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", trainerIds.length > 0 ? trainerIds : [placeholderId]);

      const profileMap = new Map(profiles?.map((p: any) => [p.id, p.full_name]) || []);

      return tasksData.map((task: any) => ({
        ...task,
        trainer_name: profileMap.get(task.trainer_id) || 'Unknown Trainer'
      })) as AssignedTask[];
    },
    enabled: !!userId
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${taskId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('task-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("trainer_task_assignments" as any)
        .update({
          file_url: filePath,
          file_name: file.name,
          uploaded_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq("id", taskId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["assigned-tasks"] });
    },
    onError: (error: any) => {
      toast.error(`Upload failed: ${error.message}`);
    },
    onSettled: () => {
      setUploadingTaskId(null);
    }
  });

  const handleFileUpload = (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 700 * 1024 * 1024) {
      toast.error("File size must be less than 700MB");
      return;
    }

    setUploadingTaskId(taskId);
    uploadMutation.mutate({ taskId, file });
  };

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
                <TableHead>Action</TableHead>
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
                  <TableCell>
                    {task.file_name || task.status === 'completed' ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="h-4 w-4" />
                        <span className="truncate max-w-[100px]">{task.file_name || 'Submitted'}</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleFileUpload(task.id, e)}
                          disabled={uploadingTaskId === task.id}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={uploadingTaskId === task.id}
                        >
                          {uploadingTaskId === task.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-1" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    )}
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
