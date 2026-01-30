import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/table-pagination";

export default function ApplicationsManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<any>(null);
  const [formData, setFormData] = useState({
    course_id: '',
    application_name: '',
    duration: '',
    description: '',
    created_by: ''
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["academy-applications"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("academy_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
  });

  // Get unique user IDs from applications
  const userIds = [...new Set(applications.map((app: any) => app.created_by).filter(Boolean))] as string[];

  const { data: profiles = [] } = useQuery({
    queryKey: ["academy-application-profiles", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      if (error) return [];
      return data || [];
    },
    enabled: userIds.length > 0,
  });

  // Create a map of user ID to full name
  const profileMap = profiles.reduce((acc: Record<string, string>, profile: any) => {
    acc[profile.id] = profile.full_name;
    return acc;
  }, {} as Record<string, string>);

  const { data: courses = [] } = useQuery({
    queryKey: ["academy-courses"],
    queryFn: async () => {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .maybeSingle();

      if (!entity) return [];

      const { data, error } = await supabase
        .from("courses")
        .select("id, name")
        .eq("entity_id", entity.id);
      if (error) return [];
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await (supabase as any)
        .from("academy_applications")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-applications"] });
      toast.success("Application created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to create application: " + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!editingApplication?.id) throw new Error('No application selected for update');
      const { error } = await (supabase as any)
        .from("academy_applications")
        .update(data)
        .eq('id', editingApplication.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-applications"] });
      toast.success("Application updated successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to update application: " + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("academy_applications")
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-applications"] });
      toast.success('Application deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete application: ' + error.message);
    }
  });

  const handleOpenDialog = (application?: any) => {
    if (application) {
      setEditingApplication(application);
      setFormData({
        course_id: application.course_id || '',
        application_name: application.application_name || '',
        duration: application.duration || '',
        description: application.description || '',
        created_by: application.created_by || ''
      });
    } else {
      setEditingApplication(null);
      setFormData({
        course_id: '',
        application_name: '',
        duration: '',
        description: '',
        created_by: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingApplication(null);
    setFormData({
      course_id: '',
      application_name: '',
      duration: '',
      description: '',
      created_by: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    const selectedCourse = courses.find((c: any) => c.id === formData.course_id);
    if (!selectedCourse) {
      toast.error("Please select a valid course");
      return;
    }

    const dataToSubmit = {
      ...formData,
      course_name: selectedCourse.name,
      created_by: user.id
    };

    if (!editingApplication) {
      createMutation.mutate(dataToSubmit);
    } else {
      updateMutation.mutate(dataToSubmit);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Applications Management</CardTitle>
          <CardDescription>Manage academy applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </div>

          <ApplicationsTable 
            applications={applications}
            handleOpenDialog={handleOpenDialog}
            handleDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingApplication ? 'Edit Application' : 'Add New Application'}</DialogTitle>
            <DialogDescription>
              {editingApplication ? 'Update application information' : 'Enter application details'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course_id">Course Name</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="application_name">Application Name</Label>
                <Input
                  id="application_name"
                  value={formData.application_name}
                  onChange={(e) => setFormData({ ...formData, application_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 3 months"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="created_by">Created By</Label>
                <Input
                  id="created_by"
                  value={formData.created_by}
                  onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingApplication ? 'Update' : 'Add'} Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationsTable({ 
  applications, 
  handleOpenDialog, 
  handleDelete 
}: { 
  applications: any[];
  handleOpenDialog: (app?: any) => void;
  handleDelete: (id: string) => void;
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
  } = usePagination({ data: applications, itemsPerPage: 10 });

  if (applications.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Name</TableHead>
            <TableHead>Application Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No applications found
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Name</TableHead>
            <TableHead>Application Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((application: any) => (
            <TableRow key={application.id}>
              <TableCell>{application.course_name}</TableCell>
              <TableCell>{application.application_name}</TableCell>
              <TableCell>{application.duration}</TableCell>
              <TableCell>{application.description}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(application)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(application.id)}>
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