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
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function TaskAssignmentCard() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data: adminCheck } = await supabase.rpc('is_admin', { _user_id: user.id });
      const { data: roles } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return {
        isAdmin: adminCheck,
        isManager: (roles as any)?.role === 'manager',
        canAssign: adminCheck || (roles as any)?.role === 'manager'
      };
    },
    enabled: !!user?.id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: userRole?.canAssign,
  });

  const { data: entities = [] } = useQuery({
    queryKey: ['entities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: userRole?.canAssign,
  });

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ['user-tasks'],
    queryFn: async () => {
      const { data: tasksData, error } = await supabase
        .from('user_tasks' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!tasksData) return [];

      const userIds = [...new Set([
        ...tasksData.map((t: any) => t.assigned_to),
        ...tasksData.map((t: any) => t.assigned_by)
      ].filter(Boolean))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return tasksData.map((task: any) => ({
        ...task,
        assigned_to_profile: profilesMap.get(task.assigned_to),
        assigned_by_profile: profilesMap.get(task.assigned_by)
      }));
    },
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('user_tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const createMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const { error } = await supabase
        .from('user_tasks' as any)
        .insert({
          ...taskData,
          assigned_by: user?.id
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task assigned successfully");
      queryClient.invalidateQueries({ queryKey: ['user-tasks'] });
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Failed to assign task");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('user_tasks' as any)
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task status updated");
      queryClient.invalidateQueries({ queryKey: ['user-tasks'] });
    },
    onError: () => {
      toast.error("Failed to update task");
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
      status: 'pending'
    };
    createMutation.mutate(taskData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Task Assignments</CardTitle>
            <CardDescription>Manage and track team tasks</CardDescription>
          </div>
          {userRole?.canAssign && (
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
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide task details..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assigned_to">Assign To</Label>
                      <Select name="assigned_to" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name || user.email}
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
                          {entities.map((entity) => (
                            <SelectItem key={entity.id} value={entity.id}>
                              {entity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        name="start_date"
                        type="date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Deadline</Label>
                      <Input
                        id="end_date"
                        name="end_date"
                        type="date"
                        required
                      />
                    </div>
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
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tasks assigned yet
            </p>
          ) : (
            tasks.map((task: any) => (
              <Card key={task.id} className="border-l-4" style={{
                borderLeftColor: 
                  task.priority === 'high' ? '#ef4444' : 
                  task.priority === 'medium' ? '#f97316' : 
                  '#3b82f6'
              }}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <Badge variant={getStatusVariant(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Assigned to: <strong>{task.assigned_to_profile?.full_name || 'Unknown'}</strong>
                        </span>
                        {task.end_date && (
                          <span className="text-muted-foreground">
                            Deadline: <strong>{new Date(task.end_date).toLocaleDateString()}</strong>
                          </span>
                        )}
                        <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                          Priority: {task.priority}
                        </span>
                      </div>
                    </div>
                    {task.assigned_to === user?.id && task.status !== 'completed' && (
                      <div className="ml-4 flex gap-2">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ 
                              id: task.id, 
                              status: 'in_progress' 
                            })}
                          >
                            Start
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ 
                            id: task.id, 
                            status: 'completed' 
                          })}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
