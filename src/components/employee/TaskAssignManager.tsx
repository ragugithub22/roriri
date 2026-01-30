import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, Plus, Trash2, Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface TaskAssignManagerProps {
  trainerId: string;
}

interface Assignee {
  id: string;
  name: string;
}

export default function TaskAssignManager({ trainerId }: TaskAssignManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [assigneeType, setAssigneeType] = useState<"trainee" | "intern" | "">("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch trainees (students table)
  const { data: trainees = [] } = useQuery({
    queryKey: ["trainees-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name");
      if (error) throw error;
      return data.map((t) => ({ id: t.id, name: t.full_name })) as Assignee[];
    },
  });

  // Fetch interns (internship_candidates table)
  const { data: interns = [] } = useQuery({
    queryKey: ["interns-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_candidates")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data.map((i) => ({ id: i.id, name: i.name })) as Assignee[];
    },
  });

  // Fetch existing task assignments
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["trainer-task-assignments", trainerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainer_task_assignments" as any)
        .select("*")
        .eq("trainer_id", trainerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!trainerId,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: {
      assignee_type: string;
      assignee_ids: string[];
      task_description: string;
      start_date: string;
      end_date: string;
    }) => {
      // Create a task for each selected assignee
      const tasksToInsert = taskData.assignee_ids.map((assignee_id) => ({
        trainer_id: trainerId,
        assignee_type: taskData.assignee_type,
        assignee_id,
        task_description: taskData.task_description,
        start_date: taskData.start_date,
        end_date: taskData.end_date,
        status: "pending",
      }));

      const { error } = await supabase
        .from("trainer_task_assignments" as any)
        .insert(tasksToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tasks assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["trainer-task-assignments"] });
      setIsOpen(false);
      setAssigneeType("");
      setSelectedAssignees([]);
    },
    onError: (error: any) => {
      toast.error(`Failed to assign tasks: ${error.message}`);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("trainer_task_assignments" as any)
        .delete()
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["trainer-task-assignments"] });
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!assigneeType) {
      toast.error("Please select a type (Trainee or Intern)");
      return;
    }
    
    if (selectedAssignees.length === 0) {
      toast.error("Please select at least one assignee");
      return;
    }

    const taskData = {
      assignee_type: assigneeType,
      assignee_ids: selectedAssignees,
      task_description: formData.get("task_description") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
    };

    createTaskMutation.mutate(taskData);
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const currentAssignees = assigneeType === "trainee" ? trainees : assigneeType === "intern" ? interns : [];

  // Get assignee name by id and type
  const getAssigneeName = (assigneeId: string, type: string) => {
    const list = type === "trainee" ? trainees : interns;
    return list.find((a) => a.id === assigneeId)?.name || "Unknown";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('task-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(`Download failed: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Task Assignment
            </CardTitle>
            <CardDescription>Assign tasks to trainees and interns</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Assign Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Assign New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="assignee_type">Select Type</Label>
                  <Select
                    value={assigneeType}
                    onValueChange={(value) => {
                      setAssigneeType(value as "trainee" | "intern");
                      setSelectedAssignees([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trainee">Trainee</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {assigneeType && (
                  <div>
                    <Label>Select {assigneeType === "trainee" ? "Trainees" : "Interns"}</Label>
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 mt-2">
                      {currentAssignees.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No {assigneeType}s found</p>
                      ) : (
                        currentAssignees.map((assignee) => (
                          <div key={assignee.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={assignee.id}
                              checked={selectedAssignees.includes(assignee.id)}
                              onCheckedChange={() => toggleAssignee(assignee.id)}
                            />
                            <label
                              htmlFor={assignee.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {assignee.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {selectedAssignees.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedAssignees.length} selected
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="task_description">Task Description</Label>
                  <Textarea
                    id="task_description"
                    name="task_description"
                    placeholder="Enter task details..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Assigning..." : "Assign Task"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks assigned yet. Click "Assign Task" to create one.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Task Description</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task: any) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    {getAssigneeName(task.assignee_id, task.assignee_type)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {task.assignee_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{task.task_description}</TableCell>
                  <TableCell>{new Date(task.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(task.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.file_url && task.file_name ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(task.file_url, task.file_name)}
                        className="text-primary"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        <span className="truncate max-w-[80px]">{task.file_name}</span>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        No file
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
