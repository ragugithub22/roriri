import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/table-pagination";

export default function CoursesManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
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
      
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("entity_id", entity.id)
        .order("created_at", { ascending: false });
      
      if (coursesError) throw coursesError;
      if (!coursesData) return [];
      
      // Fetch all subjects for these courses
      const courseIds = coursesData.map(c => c.id);
      const { data: subjectsData } = await supabase
        .from("subjects" as any)
        .select("id, subject_name, subject_code, course_id")
        .in("course_id", courseIds);
      
      // Group subjects by course_id
      const subjectsByCourse = new Map<string, any[]>();
      (subjectsData || []).forEach((subject: any) => {
        if (!subjectsByCourse.has(subject.course_id)) {
          subjectsByCourse.set(subject.course_id, []);
        }
        subjectsByCourse.get(subject.course_id)?.push(subject);
      });
      
      // Add subjects to courses
      return coursesData.map(course => ({
        ...course,
        subjects: subjectsByCourse.get(course.id) || []
      }));
    },
    enabled: !!entity?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async (courseData: any) => {
      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", editingCourse.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("courses")
          .insert({ ...courseData, entity_id: entity?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingCourse ? "Course updated" : "Course created");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsOpen(false);
      setEditingCourse(null);
    },
    onError: () => {
      toast.error("Failed to save course");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Course deleted");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => {
      toast.error("Failed to delete course");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const courseData = {
      course_code: formData.get("course_code"),
      name: formData.get("name"),
      description: formData.get("description"),
      course_level: formData.get("course_level"),
      duration_weeks: parseInt(formData.get("duration_weeks") as string),
      fees: parseFloat(formData.get("fees") as string),
      certification_available: formData.get("certification_available") === "on",
      status: formData.get("status"),
    };
    saveMutation.mutate(courseData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Courses Management</CardTitle>
            <CardDescription>Create and manage IT courses</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCourse(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Edit" : "Add"} Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course_code">Course Code</Label>
                    <Input
                      id="course_code"
                      name="course_code"
                      defaultValue={editingCourse?.course_code}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingCourse?.name}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingCourse?.description}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course_level">Level</Label>
                    <Select name="course_level" defaultValue={editingCourse?.course_level || "Beginner"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration_weeks">Duration (months)</Label>
                    <Input
                      id="duration_weeks"
                      name="duration_weeks"
                      type="number"
                      defaultValue={editingCourse?.duration_weeks}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fees">Fees (₹)</Label>
                    <Input
                      id="fees"
                      name="fees"
                      type="number"
                      step="0.01"
                      defaultValue={editingCourse?.fees}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingCourse?.status || "active"}>
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="certification_available"
                    name="certification_available"
                    defaultChecked={editingCourse?.certification_available}
                  />
                  <Label htmlFor="certification_available">Certification Available</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingCourse ? "Update" : "Create"} Course
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <CoursesTable 
          courses={courses}
          setEditingCourse={setEditingCourse}
          setIsOpen={setIsOpen}
          deleteMutation={deleteMutation}
        />
      </CardContent>
    </Card>
  );
}

function CoursesTable({ 
  courses, 
  setEditingCourse, 
  setIsOpen, 
  deleteMutation 
}: { 
  courses: any[]; 
  setEditingCourse: (course: any) => void;
  setIsOpen: (open: boolean) => void;
  deleteMutation: any;
}) {
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ data: courses, itemsPerPage: 10 });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Fees</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((course: any) => (
            <TableRow key={course.id}>
              <TableCell>{course.course_code}</TableCell>
              <TableCell>{course.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {course.subjects && course.subjects.length > 0 ? (
                    course.subjects.map((subject: any) => (
                      <Badge key={subject.id} variant="outline" className="text-xs">
                        {subject.subject_name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No subjects</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{course.duration_weeks} months</TableCell>
              <TableCell>₹{course.fees?.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCourse(course);
                      setIsOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        onPrevPage={prevPage}
        onNextPage={nextPage}
        onGoToPage={goToPage}
      />
    </>
  );
}
