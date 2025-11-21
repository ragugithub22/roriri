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
import { Plus, Edit, Trash2, Trophy, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Placement {
  id: string;
  candidate_id: string;
  job_opening_id: string;
  placement_date: string;
  joining_date?: string;
  offered_salary?: string;
  placement_status: string;
  placement_notes?: string;
  created_at: string;
  consultancy_candidates?: { first_name: string; last_name: string; email: string };
  consultancy_job_openings?: { position: string; consultancy_clients?: { company_name: string } };
}

const PlacementsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);
  const [formData, setFormData] = useState({
    candidate_id: "",
    job_opening_id: "",
    placement_date: "",
    joining_date: "",
    offered_salary: "",
    placement_status: "offered",
    placement_notes: ""
  });

  const queryClient = useQueryClient();

  const { data: candidates = [] } = useQuery({
    queryKey: ["consultancy-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_candidates")
        .select("id, first_name, last_name, email")
        .in("status", ["selected", "interviewed"]);
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

  const { data: placements = [], isLoading } = useQuery({
    queryKey: ["consultancy-placements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_placements")
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
        .order("placement_date", { ascending: false });
      if (error) throw error;
      return data as Placement[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("consultancy_placements")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-placements"] });
      toast.success("Placement recorded successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to record placement: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("consultancy_placements")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-placements"] });
      toast.success("Placement updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update placement: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("consultancy_placements")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-placements"] });
      toast.success("Placement deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete placement: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      candidate_id: "",
      job_opening_id: "",
      placement_date: "",
      joining_date: "",
      offered_salary: "",
      placement_status: "offered",
      placement_notes: ""
    });
    setEditingPlacement(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlacement) {
      updateMutation.mutate({ id: editingPlacement.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (placement: Placement) => {
    setEditingPlacement(placement);
    setFormData({
      candidate_id: placement.candidate_id,
      job_opening_id: placement.job_opening_id,
      placement_date: placement.placement_date.split('T')[0],
      joining_date: placement.joining_date?.split('T')[0] || "",
      offered_salary: placement.offered_salary || "",
      placement_status: placement.placement_status,
      placement_notes: placement.placement_notes || ""
    });
    setIsDialogOpen(true);
  };

  const columns = [
    {
      key: "candidate_id",
      label: "Candidate",
      render: (_: any, row: Placement) => (
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
      label: "Position",
      render: (_: any, row: Placement) => (
        <div>
          <div className="font-medium">{row.consultancy_job_openings?.position}</div>
          <div className="text-sm text-muted-foreground">
            {row.consultancy_job_openings?.consultancy_clients?.company_name}
          </div>
        </div>
      )
    },
    {
      key: "placement_date",
      label: "Placement Date",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "joining_date",
      label: "Joining Date",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "Not set"
    },
    {
      key: "offered_salary",
      label: "Offered Salary",
      render: (value: string) => value || "Not specified"
    },
    {
      key: "placement_status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={
          value === "joined" ? "default" :
          value === "offered" ? "secondary" :
          value === "declined" ? "destructive" : "outline"
        }>
          {value}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Placement) => (
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
              if (confirm("Are you sure you want to delete this placement record?")) {
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
          <h2 className="text-2xl font-bold">Placements Management</h2>
          <p className="text-muted-foreground">Track successful candidate placements and offers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Record Placement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlacement ? "Edit Placement" : "Record New Placement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placement_date">Placement Date *</Label>
                  <Input
                    id="placement_date"
                    type="date"
                    value={formData.placement_date}
                    onChange={(e) => setFormData({ ...formData, placement_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="joining_date">Joining Date</Label>
                  <Input
                    id="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offered_salary">Offered Salary</Label>
                  <Input
                    id="offered_salary"
                    value={formData.offered_salary}
                    onChange={(e) => setFormData({ ...formData, offered_salary: e.target.value })}
                    placeholder="₹5-10 LPA"
                  />
                </div>
                <div>
                  <Label htmlFor="placement_status">Placement Status</Label>
                  <Select value={formData.placement_status} onValueChange={(value) => setFormData({ ...formData, placement_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offered">Offered</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="joined">Joined</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="placement_notes">Placement Notes</Label>
                <Textarea
                  id="placement_notes"
                  value={formData.placement_notes}
                  onChange={(e) => setFormData({ ...formData, placement_notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes about the placement, offer details, etc."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingPlacement ? "Update" : "Record"} Placement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placements.length}</div>
            <p className="text-xs text-muted-foreground">Placement records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successfully Joined</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {placements.filter(p => p.placement_status === "joined").length}
            </div>
            <p className="text-xs text-muted-foreground">Candidates joined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Made</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {placements.filter(p => p.placement_status === "offered" || p.placement_status === "accepted").length}
            </div>
            <p className="text-xs text-muted-foreground">Active offers</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Placements"
        description="Track candidate placements and job offers"
        columns={columns}
        data={placements}
        emptyMessage="No placements recorded"
        isLoading={isLoading}
      />
    </div>
  );
};

export default PlacementsManager;
