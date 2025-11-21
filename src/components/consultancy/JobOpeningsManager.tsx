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
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Plus, Edit, Trash2, Briefcase, Building, MapPin } from "lucide-react";
import { toast } from "sonner";

interface JobOpening {
  id: string;
  client_id: string;
  position: string;
  job_description?: string;
  required_skills?: string[];
  experience?: string;
  salary_range?: string;
  work_type?: string;
  location?: string;
  vacancy_count: number;
  hr_notes?: string;
  status: string;
  created_at: string;
  consultancy_clients?: { company_name: string };
}

const JobOpeningsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [formData, setFormData] = useState({
    client_id: "",
    position: "",
    job_description: "",
    required_skills: [] as string[],
    experience: "",
    salary_range: "",
    work_type: "office",
    location: "",
    vacancy_count: 1,
    hr_notes: "",
    status: "open"
  });

  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["consultancy-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_clients")
        .select("id, company_name")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: jobOpenings = [], isLoading } = useQuery({
    queryKey: ["consultancy-job-openings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_job_openings")
        .select(`
          *,
          consultancy_clients (
            company_name
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobOpening[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("consultancy_job_openings")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-job-openings"] });
      toast.success("Job opening added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add job opening: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("consultancy_job_openings")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-job-openings"] });
      toast.success("Job opening updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update job opening: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("consultancy_job_openings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-job-openings"] });
      toast.success("Job opening deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete job opening: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      client_id: "",
      position: "",
      job_description: "",
      required_skills: [],
      experience: "",
      salary_range: "",
      work_type: "office",
      location: "",
      vacancy_count: 1,
      hr_notes: "",
      status: "open"
    });
    setEditingJob(null);
  };

  const handleSkillsChange = (skillsString: string) => {
    const skills = skillsString.split(',').map(s => s.trim()).filter(s => s);
    setFormData({ ...formData, required_skills: skills });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (job: JobOpening) => {
    setEditingJob(job);
    setFormData({
      client_id: job.client_id,
      position: job.position,
      job_description: job.job_description || "",
      required_skills: job.required_skills || [],
      experience: job.experience || "",
      salary_range: job.salary_range || "",
      work_type: job.work_type || "office",
      location: job.location || "",
      vacancy_count: job.vacancy_count,
      hr_notes: job.hr_notes || "",
      status: job.status
    });
    setIsDialogOpen(true);
  };

  const columns = [
    {
      key: "position",
      label: "Position",
      render: (value: string, row: JobOpening) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.consultancy_clients?.company_name}</div>
        </div>
      )
    },
    { key: "experience", label: "Experience" },
    { key: "location", label: "Location" },
    {
      key: "work_type",
      label: "Work Type",
      render: (value: string) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "open" ? "default" : value === "closed" ? "secondary" : "outline"}>
          {value}
        </Badge>
      )
    },
    {
      key: "vacancy_count",
      label: "Vacancies",
      render: (value: number) => value
    },
    {
      key: "created_at",
      label: "Posted",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: JobOpening) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this job opening?")) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Openings Management</h2>
          <p className="text-muted-foreground">Manage job requirements and positions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Job Opening
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? "Edit Job Opening" : "Add New Job Opening"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_id">Client *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="job_description">Job Description</Label>
                <Textarea
                  id="job_description"
                  value={formData.job_description}
                  onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="required_skills">Required Skills (comma-separated)</Label>
                  <Input
                    id="required_skills"
                    value={formData.required_skills.join(', ')}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder="JavaScript, React, Node.js"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience Required</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="2-5 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_range">Salary Range</Label>
                  <Input
                    id="salary_range"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="₹5-10 LPA"
                  />
                </div>
                <div>
                  <Label htmlFor="vacancy_count">Number of Vacancies</Label>
                  <Input
                    id="vacancy_count"
                    type="number"
                    min="1"
                    value={formData.vacancy_count}
                    onChange={(e) => setFormData({ ...formData, vacancy_count: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="work_type">Work Type</Label>
                  <Select value={formData.work_type} onValueChange={(value) => setFormData({ ...formData, work_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="hr_notes">HR Notes</Label>
                <Textarea
                  id="hr_notes"
                  value={formData.hr_notes}
                  onChange={(e) => setFormData({ ...formData, hr_notes: e.target.value })}
                  rows={2}
                  placeholder="Internal notes for HR team"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingJob ? "Update" : "Add"} Job Opening
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Openings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobOpenings.length}</div>
            <p className="text-xs text-muted-foreground">Job positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Openings</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobOpenings.filter(j => j.status === "open").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently open</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vacancies</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobOpenings.reduce((sum, job) => sum + job.vacancy_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Positions available</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Job Openings"
        description="Manage job requirements and positions for clients"
        columns={columns}
        data={jobOpenings}
        emptyMessage="No job openings found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default JobOpeningsManager;
