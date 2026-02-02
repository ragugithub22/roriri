import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { validateForm, getFormString, getFormInt } from "@/lib/validation";

export default function BatchesManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: entity } = useQuery({
    queryKey: ["it-academy-entity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses", entity?.id],
    queryFn: async () => {
      if (!entity?.id) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, course_code")
        .eq("entity_id", entity.id)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!entity?.id,
  });

  const { data: trainers = [] } = useQuery({
    queryKey: ["it-trainers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_trainers")
        .select("id, full_name, trainer_code")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const { data: batchesData, error } = await supabase
        .from("batches" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!batchesData) return [];

      const courseIds = batchesData.map((b: any) => b.course_id).filter(Boolean);
      const trainerIds = batchesData.map((b: any) => b.trainer_id).filter(Boolean);

      const [coursesData, trainersData] = await Promise.all([
        courseIds.length > 0 
          ? supabase.from("courses").select("id, name, course_code").in("id", courseIds)
          : Promise.resolve({ data: [] }),
        trainerIds.length > 0
          ? supabase.from("it_trainers").select("id, full_name").in("id", trainerIds)
          : Promise.resolve({ data: [] })
      ]);

      const coursesMap = new Map((coursesData.data || []).map((c: any) => [c.id, c]));
      const trainersMap = new Map((trainersData.data || []).map((t: any) => [t.id, t]));

      return batchesData.map((batch: any) => ({
        ...batch,
        course: coursesMap.get(batch.course_id),
        trainer: trainersMap.get(batch.trainer_id)
      }));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (batchData: any) => {
      if (editingBatch) {
        const { error } = await supabase
          .from("batches" as any)
          .update(batchData)
          .eq("id", editingBatch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("batches" as any)
          .insert(batchData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingBatch ? "Batch updated" : "Batch created");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      setIsOpen(false);
      setEditingBatch(null);
    },
    onError: () => {
      toast.error("Failed to save batch");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("batches" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Batch deleted");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: () => {
      toast.error("Failed to delete batch");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const batchCode = getFormString(formData, "batch_code");
    const batchName = getFormString(formData, "batch_name");
    const courseId = getFormString(formData, "course_id");
    const startDate = getFormString(formData, "start_date");

    // Validate form fields
    const isValid = validateForm([
      { value: batchCode, fieldName: "Batch Code", rules: ["required", { minLength: 2 }, { maxLength: 50 }] },
      { value: batchName, fieldName: "Batch Name", rules: ["required", { minLength: 2 }, { maxLength: 100 }] },
      { value: courseId, fieldName: "Course", rules: ["required"] },
      { value: startDate, fieldName: "Start Date", rules: ["required", "date"] },
    ]);

    if (!isValid) return;

    const batchData = {
      batch_code: batchCode,
      batch_name: batchName,
      course_id: courseId,
      trainer_id: getFormString(formData, "trainer_id") || null,
      start_date: startDate,
      end_date: getFormString(formData, "end_date") || null,
      schedule: getFormString(formData, "schedule"),
      capacity: getFormInt(formData, "capacity"),
      status: getFormString(formData, "status") || "active",
    };
    saveMutation.mutate(batchData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Batches Management</CardTitle>
            <CardDescription>Manage course batches and schedules</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBatch(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingBatch ? "Edit" : "Create"} Batch</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batch_code">Batch Code</Label>
                    <Input
                      id="batch_code"
                      name="batch_code"
                      defaultValue={editingBatch?.batch_code}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="batch_name">Batch Name</Label>
                    <Input
                      id="batch_name"
                      name="batch_name"
                      defaultValue={editingBatch?.batch_name}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course_id">Course</Label>
                    <Select name="course_id" defaultValue={editingBatch?.course_id} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.course_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trainer_id">Trainer</Label>
                    <Select name="trainer_id" defaultValue={editingBatch?.trainer_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trainer (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id}>
                            {trainer.full_name} ({trainer.trainer_code})
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
                      defaultValue={editingBatch?.start_date}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      defaultValue={editingBatch?.end_date}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input
                      id="schedule"
                      name="schedule"
                      placeholder="e.g., Mon-Fri 10AM-2PM"
                      defaultValue={editingBatch?.schedule}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      defaultValue={editingBatch?.capacity}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingBatch?.status || "active"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingBatch ? "Update" : "Create"} Batch
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch: any) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.batch_code}</TableCell>
                <TableCell>{batch.batch_name}</TableCell>
                <TableCell>{batch.course?.name || "-"}</TableCell>
                <TableCell>{batch.trainer?.full_name || "-"}</TableCell>
                <TableCell>{batch.schedule || "-"}</TableCell>
                <TableCell>
                  <Badge variant={batch.status === "active" ? "default" : "secondary"}>
                    {batch.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBatch(batch);
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(batch.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
