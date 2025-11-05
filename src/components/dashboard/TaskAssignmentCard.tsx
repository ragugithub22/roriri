import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_by: string;
  entity_id: string | null;
  start_date: string;
  end_date: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  assigned_to_profile?: { full_name: string; email: string };
  entity?: { name: string };
}

export default function TaskAssignmentCard() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userRoles = [] } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isAdminOrManager = userRoles.some(
    (r: any) => r.role === "admin" || r.role === "manager"
  );

  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: isAdminOrManager,
  });

  const { data: entities = [] } = useQuery({
    queryKey: ["entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["user-tasks"],
    queryFn: async () => {
      const { data: tasksData, error } = await supabase
        .from("user_tasks" as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      if (!tasksData) return [];

      const profileIds = [...new Set(tasksData.map((t: any) => t.assigned_to).filter(Boolean))];
      const entityIds = [...new Set(tasksData.map((t: any) => t.entity_id).filter(Boolean))];

      const [profilesData, entitiesData] = await Promise.all([
        profileIds.length > 0
          ? supabase.from("profiles").select("id, full_name, email").in("id", profileIds)
          : { data: [] },
        entityIds.length > 0
          ? supabase.from("entities").select("id, name").in("id", entityIds)
          : { data: [] },
      ]);

      const profilesMap = new Map((profilesData.data || []).map((p: any) => [p.id, p]));
      const entitiesMap = new Map((entitiesData.data || []).map((e: any) => [e.id, e]));

      return tasksData.map((task: any) => ({
        ...task,
        assigned_to_profile: profilesMap.get(task.assigned_to),
        entity: entitiesMap.get(task.entity_id),
      })) as Task[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("user_tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_tasks",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const { error } = await supabase.from("user_tasks" as any).insert({
        ...taskData,
        assigned_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Failed to assign task");
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("user_tasks" as any)
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task status updated");
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
    },
    onError: () => {
      toast.error("Failed to update task status");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get("title"),
      description: formData.get("description"),
      assigned_to: formData.get("assigned_to"),
      entity_id: formData.get("entity_id") || null,
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      priority: formData.get("priority"),
      status: "pending",
    };
    createTaskMutation.mutate(taskData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Task Assignment</CardTitle>
            <CardDescription>Manage and track team tasks</CardDescription>
          </div>
          {isAdminOrManager && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assigned_to">Assign To</Label>
                      <Select name="assigned_to" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile: any) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.full_name} ({profile.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="entity_id">Entity (Optional)</Label>
                      <Select name="entity_id">
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                        <SelectContent>
                          {entities.map((entity: any) => (
                            <SelectItem key={entity.id} value={entity.id}>
                              {entity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input id="start_date" name="start_date" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Deadline</Label>
                      <Input id="end_date" name="end_date" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select name="priority" defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Assign Task
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks assigned yet
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(task.priority) as any}>
                      {task.priority}
                    </Badge>
                    <Badge variant={getStatusColor(task.status) as any}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1 capitalize">
                        {task.status.replace("_", " ")}
                      </span>
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                  <div>
                    <span className="font-medium">Assigned to:</span>{" "}
                    {task.assigned_to_profile?.full_name || "Unknown"}
                  </div>
                  {task.entity && (
                    <div>
                      <span className="font-medium">Entity:</span> {task.entity.name}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Deadline:</span>{" "}
                    {new Date(task.end_date).toLocaleDateString()}
                  </div>
                </div>
                {task.assigned_to === user?.id && task.status !== "completed" && (
                  <div className="flex gap-2 mt-4">
                    {task.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateTaskStatusMutation.mutate({
                            id: task.id,
                            status: "in_progress",
                          })
                        }
                      >
                        Start Task
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() =>
                        updateTaskStatusMutation.mutate({
                          id: task.id,
                          status: "completed",
                        })
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
