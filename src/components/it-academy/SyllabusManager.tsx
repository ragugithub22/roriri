import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SyllabusManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects" as any)
        .select("id, subject_name, subject_code")
        .eq("status", "active");
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const { data: syllabus = [] } = useQuery({
    queryKey: ["syllabus"],
    queryFn: async () => {
      const { data: syllabusData, error } = await supabase
        .from("syllabus" as any)
        .select("*")
        .order("week_number", { ascending: true });
      if (error) throw error;
      if (!syllabusData) return [];

      const subjectIds = syllabusData.map((s: any) => s.subject_id).filter(Boolean);

      const subjectsData = subjectIds.length > 0 
        ? await supabase.from("subjects" as any).select("id, subject_name, subject_code").in("id", subjectIds)
        : { data: [] };

      const subjectsMap = new Map(((subjectsData.data || []) as any[]).map((s: any) => [s.id, s]));

      return syllabusData.map((item: any) => ({
        ...item,
        subject: subjectsMap.get(item.subject_id)
      })) as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (syllabusData: any) => {
      if (editingSyllabus) {
        const { error } = await supabase
          .from("syllabus" as any)
          .update(syllabusData)
          .eq("id", editingSyllabus.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("syllabus" as any)
          .insert(syllabusData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingSyllabus ? "Syllabus updated" : "Syllabus created");
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
      setIsOpen(false);
      setEditingSyllabus(null);
    },
    onError: () => {
      toast.error("Failed to save syllabus");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("syllabus" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Syllabus deleted");
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
    },
    onError: () => {
      toast.error("Failed to delete syllabus");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const syllabusData = {
      subject_id: formData.get("subject_id"),
      week_number: parseInt(formData.get("week_number") as string),
      topic: formData.get("topic"),
      description: formData.get("description") || null,
      learning_objectives: formData.get("learning_objectives") || null,
      resources: formData.get("resources") || null,
    };
    saveMutation.mutate(syllabusData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Syllabus Management</CardTitle>
            <CardDescription>Manage subject syllabus and curriculum</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSyllabus(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Syllabus Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSyllabus ? "Edit" : "Create"} Syllabus Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject_id">Subject</Label>
                  <Select name="subject_id" defaultValue={editingSyllabus?.subject_id} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.subject_name} ({subject.subject_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="week_number">Week Number</Label>
                  <Input
                    id="week_number"
                    name="week_number"
                    type="number"
                    min="1"
                    defaultValue={editingSyllabus?.week_number}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    name="topic"
                    defaultValue={editingSyllabus?.topic}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingSyllabus?.description}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="learning_objectives">Learning Objectives</Label>
                  <Textarea
                    id="learning_objectives"
                    name="learning_objectives"
                    defaultValue={editingSyllabus?.learning_objectives}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="resources">Resources</Label>
                  <Textarea
                    id="resources"
                    name="resources"
                    defaultValue={editingSyllabus?.resources}
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingSyllabus ? "Update" : "Create"} Syllabus Entry
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
              <TableHead>Subject</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {syllabus.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.subject?.subject_name || "-"}</TableCell>
                <TableCell>Week {item.week_number}</TableCell>
                <TableCell>{item.topic}</TableCell>
                <TableCell className="max-w-md truncate">{item.description || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSyllabus(item);
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(item.id)}
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
