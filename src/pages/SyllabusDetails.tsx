import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SyllabusDetails() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data: subjectData, error } = await supabase
        .from("subjects" as any)
        .select("*")
        .eq("id", subjectId)
        .single();
      if (error) throw error;
      if (!subjectData) return null;

      const data = subjectData as any;
      if (data.course_id) {
        const { data: courseData } = await supabase
          .from("courses")
          .select("name, course_code")
          .eq("id", data.course_id)
          .single();
        
        return { ...data, course: courseData };
      }
      
      return { ...data, course: null };
    },
    enabled: !!subjectId,
  });

  const { data: syllabusList = [] } = useQuery({
    queryKey: ["syllabus", subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      
      const { data, error } = await supabase
        .from("syllabus" as any)
        .select("*")
        .eq("subject_id", subjectId)
        .order("week_number", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!subjectId,
  });

  const saveSyllabusMutation = useMutation({
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
          .insert([syllabusData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus", subjectId] });
      setIsSyllabusOpen(false);
      setEditingSyllabus(null);
      toast.success("Syllabus saved successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to save syllabus: ${error.message}`);
    },
  });

  const deleteSyllabusMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("syllabus" as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus", subjectId] });
      toast.success("Syllabus deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete syllabus: ${error.message}`);
    },
  });

  const handleSyllabusSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const syllabusData = {
      subject_id: subjectId,
      week_number: parseInt(formData.get("week_number") as string),
      topic: formData.get("topic") as string,
      description: formData.get("description") as string,
      learning_objectives: formData.get("learning_objectives") as string,
      resources: formData.get("resources") as string,
    };

    saveSyllabusMutation.mutate(syllabusData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl py-8 px-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/it-academy")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Syllabus Details</h1>
              {subject && (
                <p className="text-muted-foreground">
                  {subject.subject_name} ({subject.subject_code}) - {subject.course?.name}
                </p>
              )}
            </div>
          </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Syllabus</CardTitle>
                <CardDescription>Manage syllabus for this subject</CardDescription>
              </div>
              <Dialog open={isSyllabusOpen} onOpenChange={setIsSyllabusOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingSyllabus(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Syllabus
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingSyllabus ? "Edit" : "Add"} Syllabus</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSyllabusSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="week_number">Week Number</Label>
                        <Input
                          id="week_number"
                          name="week_number"
                          type="number"
                          defaultValue={editingSyllabus?.week_number}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Input
                          id="topic"
                          name="topic"
                          defaultValue={editingSyllabus?.topic}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingSyllabus?.description}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="learning_objectives">Learning Objectives</Label>
                      <Textarea
                        id="learning_objectives"
                        name="learning_objectives"
                        defaultValue={editingSyllabus?.learning_objectives}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resources">Resources</Label>
                      <Textarea
                        id="resources"
                        name="resources"
                        defaultValue={editingSyllabus?.resources}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsSyllabusOpen(false);
                        setEditingSyllabus(null);
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syllabusList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No syllabus items found
                    </TableCell>
                  </TableRow>
                ) : (
                  syllabusList.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">Week {item.week_number}</TableCell>
                      <TableCell>{item.topic}</TableCell>
                      <TableCell className="max-w-md truncate">{item.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingSyllabus(item);
                              setIsSyllabusOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSyllabusMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
