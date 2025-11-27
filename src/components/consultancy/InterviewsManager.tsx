// @ts-nocheck
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
import { Plus, Edit, Trash2, Calendar, Clock, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Interview {
  id: string;
  candidate_id: string;
  job_opening_id: string;
  interview_type: string;
  scheduled_date: string;
  duration_minutes: number;
  interviewer_name?: string;
  interview_mode: string;
  location?: string;
  meeting_link?: string;
  status: string;
  feedback?: string;
  rating?: number;
  created_at: string;
  consultancy_candidates?: { first_name: string; last_name: string; email: string };
  consultancy_job_openings?: { position: string; consultancy_clients?: { company_name: string } };
}

const InterviewsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [formData, setFormData] = useState({
    candidate_id: "",
    job_opening_id: "",
    interview_type: "technical",
    scheduled_date: "",
    duration_minutes: 60,
    interviewer_name: "",
    interview_mode: "online",
    location: "",
    meeting_link: "",
    status: "scheduled",
    feedback: "",
    rating: 0
  });

  const queryClient = useQueryClient();
  const supabaseClient = supabase as any;

  const { data: candidates = [] } = useQuery<any[]>({
    queryKey: ["consultancy-candidates"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("consultancy_candidates")
        .select("id, first_name, last_name, email")
        .in("status", ["shortlisted", "interviewed"]);
      if (error) throw error;
      return data;
    },
  });

  const { data: jobOpenings = [] } = useQuery<any[]>({
    queryKey: ["consultancy-job-openings"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("consultancy_job_openings")
        .select("id, position, consultancy_clients(company_name)")
        .eq("status", "open");
      if (error) throw error;
      return data;
    },
  });

  const { data: interviews = [], isLoading } = useQuery<any[]>({
    queryKey: ["consultancy-interviews"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("consultancy_interviews")
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
        .order("scheduled_date", { ascending: false });
      if (error) throw error;
      return data as Interview[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabaseClient
        .from("consultancy_interviews")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-interviews"] });
      toast.success("Interview scheduled successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to schedule interview: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabaseClient
        .from("consultancy_interviews")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-interviews"] });
      toast.success("Interview updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update interview: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("consultancy_interviews")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-interviews"] });
      toast.success("Interview deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete interview: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      candidate_id: "",
      job_opening_id: "",
      interview_type: "technical",
      scheduled_date: "",
      duration_minutes: 60,
      interviewer_name: "",
      interview_mode: "online",
      location: "",
      meeting_link: "",
      status: "scheduled",
      feedback: "",
      rating: 0
    });
    setEditingInterview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInterview) {
      updateMutation.mutate({ id: editingInterview.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview);
    setFormData({
      candidate_id: interview.candidate_id,
      job_opening_id: interview.job_opening_id,
      interview_type: interview.interview_type,
      scheduled_date: interview.scheduled_date.split('T')[0], // Format for date input
      duration_minutes: interview.duration_minutes,
      interviewer_name: interview.interviewer_name || "",
      interview_mode: interview.interview_mode,
      location: interview.location || "",
      meeting_link: interview.meeting_link || "",
      status: interview.status,
      feedback: interview.feedback || "",
      rating: interview.rating || 0
    });
    setIsDialogOpen(true);
  };

  const columns = [
    {
      key: "candidate_id",
      label: "Candidate",
      render: (_: any, row: Interview) => (
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
      render: (_: any, row: Interview) => (
        <div>
          <div className="font-medium">{row.consultancy_job_openings?.position}</div>
          <div className="text-sm text-muted-foreground">
            {row.consultancy_job_openings?.consultancy_clients?.company_name}
          </div>
        </div>
      )
    },
    {
      key: "scheduled_date",
      label: "Date & Time",
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      key: "interview_type",
      label: "Type",
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
        <Badge variant={
          value === "completed" ? "default" :
          value === "cancelled" ? "destructive" :
          value === "scheduled" ? "secondary" : "outline"
        }>
          {value}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Interview) => (
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
              if (confirm("Are you sure you want to delete this interview?")) {
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
          <h2 className="text-2xl font-bold">Interviews Management</h2>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInterview ? "Edit Interview" : "Schedule New Interview"}
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
                  <Label htmlFor="interview_type">Interview Type</Label>
                  <Select value={formData.interview_type} onValueChange={(value) => setFormData({ ...formData, interview_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="final">Final Round</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled_date">Scheduled Date & Time *</Label>
                  <Input
                    id="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div>
                  <Label htmlFor="interviewer_name">Interviewer Name</Label>
                  <Input
                    id="interviewer_name"
                    value={formData.interviewer_name}
                    onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
                    placeholder="Name of the interviewer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interview_mode">Interview Mode</Label>
                  <Select value={formData.interview_mode} onValueChange={(value) => setFormData({ ...formData, interview_mode: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
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
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.interview_mode === "offline" && (
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Office address or meeting location"
                  />
                </div>
              )}

              {formData.interview_mode === "online" && (
                <div>
                  <Label htmlFor="meeting_link">Meeting Link</Label>
                  <Input
                    id="meeting_link"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    placeholder="Zoom/Meet link"
                  />
                </div>
              )}

              {formData.status === "completed" && (
                <>
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedback">Interview Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={formData.feedback}
                      onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      rows={3}
                      placeholder="Detailed feedback about the candidate's performance"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingInterview ? "Update" : "Schedule"} Interview
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter(i => i.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Finished interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter(i => i.status === "scheduled" && new Date(i.scheduled_date) > new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled for future</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Interviews"
        description="Manage interview schedules and track candidate evaluations"
        columns={columns}
        data={interviews}
        emptyMessage="No interviews scheduled"
        isLoading={isLoading}
      />
    </div>
  );
};

export default InterviewsManager;
