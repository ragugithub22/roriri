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
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Shortlisting {
  id: string;
  candidate_id: string;
  job_opening_id: string;
  status: string;
  feedback?: string;
  assigned_by?: string;
  assigned_at: string;
  reviewed_at?: string;
  consultancy_candidates?: { first_name: string; last_name: string; email: string };
  consultancy_job_openings?: { position: string; consultancy_clients?: { company_name: string } };
}

const ShortlistingManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShortlisting, setEditingShortlisting] = useState<Shortlisting | null>(null);
  const [formData, setFormData] = useState({
    candidate_id: "",
    job_opening_id: "",
    status: "pending",
    feedback: "",
    assigned_by: ""
  });

  const queryClient = useQueryClient();

  const { data: candidates = [] } = useQuery({
    queryKey: ["consultancy-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_candidates")
        .select("id, first_name, last_name, email")
        .eq("status", "new");
      if (error) throw error;
      return data;
    },
  });

  const { data: jobOpenings = [] } = useQuery({
    queryKey: ["consultancy-job-openings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_job_openings")
        .select("id, position, consultancy_clients(company_name)")
        .eq("status", "open");
      if (error) throw error;
      return data;
    },
  });

  const { data: shortlistings = [], isLoading } = useQuery({
    queryKey: ["consultancy-shortlistings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_shortlistings")
        .select(`
          *,
          consultancy_candidates (
            first_name,
            last_name,
            email
          ),
          consultancy_job_openings (
            position,
            consultancy_clients (
              company_name
            )
          )
        `)
        .order("assigned_at", { ascending: false });
      if (error) throw error;
      return data as Shortlisting[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("consultancy_shortlistings")
        .insert([{
          ...data,
          assigned_at: new Date().toISOString()
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-shortlistings"] });
      toast.success("Shortlisting assignment created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create shortlisting assignment: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const updateData = {
        ...data,
        reviewed_at: data.status !== "pending" ? new Date().toISOString() : null
      };
      const { error } = await supabase
        .from("consultancy_shortlistings")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-shortlistings"] });
      toast.success("Shortlisting updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update shortlisting: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("consultancy_shortlistings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-shortlistings"] });
      toast.success("Shortlisting deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete shortlisting: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      candidate_id: "",
      job_opening_id: "",
      status: "pending",
      feedback: "",
      assigned_by: ""
    });
    setEditingShortlisting(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShortlisting) {
      updateMutation.mutate({ id: editingShortlisting.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (shortlisting: Shortlisting) => {
    setEditingShortlisting(shortlisting);
    setFormData({
      candidate_id: shortlisting.candidate_id,
      job_opening_id: shortlisting.job_opening_id,
      status: shortlisting.status,
      feedback: shortlisting.feedback || "",
      assigned_by: shortlisting.assigned_by || ""
    });
    setIsDialogOpen(true);
  };

  const columns = [
    {
      key: "candidate_id",
      label: "Candidate",
      render: (_: any, row: Shortlisting) => (
        <div>
          <div className="font-medium">
            {row.consultancy_candidates?.first_name} {row.consultancy_candidates?.last_name}
          </div>
          <div className="text-sm text-muted-foreground">{row.consultancy_candidates?.email}</div>
        </div>
      )
    },
    {
      key: "job_opening_id",
      label: "Job Position",
      render: (_: any, row: Shortlisting) => (
        <div>
          <div className="font-medium">{row.consultancy_job_openings?.position}</div>
          <div className="text-sm text-muted-foreground">
            {row.consultancy_job_openings?.consultancy_clients?.company_name}
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={
          value === "shortlisted" ? "default" :
          value === "rejected" ? "destructive" :
          value === "pending" ? "secondary" : "outline"
        }>
          {value}
        </Badge>
      )
    },
    {
      key: "assigned_at",
      label: "Assigned",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Shortlisting) => (
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
              if (confirm("Are you sure you want to delete this shortlisting?")) {
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
          <h2 className="text-2xl font-bold">Shortlisting Management</h2>
          <p className="text-muted-foreground">Screen candidates and assign them to job openings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingShortlisting ? "Edit Shortlisting" : "Assign Candidate to Job"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="candidate_id">Candidate *</Label>
                <Select value={formData.candidate_id} onValueChange={(value) => setFormData({ ...formData, candidate_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.first_name} {candidate.last_name} - {candidate.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="job_opening_id">Job Opening *</Label>
                <Select value={formData.job_opening_id} onValueChange={(value) => setFormData({ ...formData, job_opening_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job opening" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobOpenings.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.position} - {job.consultancy_clients?.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigned_by">Assigned By</Label>
                <Input
                  id="assigned_by"
                  value={formData.assigned_by}
                  onChange={(e) => setFormData({ ...formData, assigned_by: e.target.value })}
                  placeholder="Your name or HR representative"
                />
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  rows={3}
                  placeholder="Review notes and feedback about the candidate"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingShortlisting ? "Update" : "Assign"} Shortlisting
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortlistings.length}</div>
            <p className="text-xs text-muted-foreground">Candidates assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shortlistings.filter(s => s.status === "shortlisted").length}
            </div>
            <p className="text-xs text-muted-foreground">Passed screening</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shortlistings.filter(s => s.status === "rejected").length}
            </div>
            <p className="text-xs text-muted-foreground">Did not qualify</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Shortlisting Assignments"
        description="Track candidate screening and job matching process"
        columns={columns}
        data={shortlistings}
        emptyMessage="No shortlisting assignments found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default ShortlistingManager;
