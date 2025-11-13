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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function SubjectsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<any>(null);
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

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data: subjectsData, error } = await supabase
        .from("subjects" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!subjectsData) return [];

      const courseIds = subjectsData.map((s: any) => s.course_id).filter(Boolean);

      const coursesData = courseIds.length > 0 
        ? await supabase.from("courses").select("id, name, course_code").in("id", courseIds)
        : { data: [] };

      const coursesMap = new Map((coursesData.data || []).map((c: any) => [c.id, c]));

      return subjectsData.map((subject: any) => ({
        ...subject,
        course: coursesMap.get(subject.course_id)
      })) as any[];
    },
  });

  const { data: syllabusList = [] } = useQuery({
    queryKey: ["syllabus", expandedSubjectId],
    queryFn: async () => {
      if (!expandedSubjectId) return [];
      
      const { data, error } = await supabase
        .from("syllabus" as any)
        .select("*")
        .eq("subject_id", expandedSubjectId)
        .order("week_number", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!expandedSubjectId,
  });

  const saveMutation = useMutation({
    mutationFn: async (subjectData: any) => {
      if (editingSubject) {
        const { error } = await supabase
          .from("subjects" as any)
          .update(subjectData)
          .eq("id", editingSubject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("subjects" as any)
          .insert(subjectData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingSubject ? "Subject updated" : "Subject created");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setIsOpen(false);
      setEditingSubject(null);
    },
    onError: () => {
      toast.error("Failed to save subject");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Subject deleted");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: () => {
      toast.error("Failed to delete subject");
    },
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
      queryClient.invalidateQueries({ queryKey: ["syllabus", expandedSubjectId] });
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
      queryClient.invalidateQueries({ queryKey: ["syllabus", expandedSubjectId] });
      toast.success("Syllabus deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete syllabus: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subjectData = {
      subject_code: formData.get("subject_code"),
      subject_name: formData.get("subject_name"),
      course_id: formData.get("course_id"),
      description: formData.get("description") || null,
      hours: parseInt(formData.get("hours") as string) || null,
      status: formData.get("status"),
    };
    saveMutation.mutate(subjectData);
  };

  const handleSyllabusSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const syllabusData = {
      subject_id: expandedSubjectId,
      week_number: parseInt(formData.get("week_number") as string),
      topic: formData.get("topic") as string,
      description: formData.get("description") as string,
      learning_objectives: formData.get("learning_objectives") as string,
      resources: formData.get("resources") as string,
    };

    if (editingSyllabus) {
      saveSyllabusMutation.mutate({ ...syllabusData, id: editingSyllabus.id });
    } else {
      saveSyllabusMutation.mutate(syllabusData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Subjects Management</CardTitle>
            <CardDescription>Manage course subjects</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSubject(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSubject ? "Edit" : "Create"} Subject</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject_code">Subject Code</Label>
                    <Input
                      id="subject_code"
                      name="subject_code"
                      defaultValue={editingSubject?.subject_code}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject_name">Subject Name</Label>
                    <Input
                      id="subject_name"
                      name="subject_name"
                      defaultValue={editingSubject?.subject_name}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="course_id">Course</Label>
                  <Select name="course_id" defaultValue={editingSubject?.course_id} required>
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
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={editingSubject?.description}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hours">Duration (Hours)</Label>
                    <Input
                      id="hours"
                      name="hours"
                      type="number"
                      defaultValue={editingSubject?.hours}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingSubject?.status || "active"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingSubject ? "Update" : "Create"} Subject
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
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>View</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject: any) => (
              <>
                <TableRow key={subject.id}>
                  <TableCell>{subject.subject_code}</TableCell>
                  <TableCell>{subject.subject_name}</TableCell>
                  <TableCell>{subject.course?.name || "-"}</TableCell>
                  <TableCell>{subject.hours || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={subject.status === "active" ? "default" : "secondary"}>
                      {subject.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSubjectId(expandedSubjectId === subject.id ? null : subject.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSubject(subject);
                          setIsOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(subject.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedSubjectId === subject.id && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/50 p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Syllabus for {subject.subject_name}</h3>
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
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
