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
import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";

export default function ComplaintsManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    complaint_from: '',
    complaint_to: '',
    complaint_description: '',
    status: 'pending'
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["academy-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_complaints" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: trainees = [] } = useQuery({
    queryKey: ["academy-trainees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, student_code")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: trainers = [] } = useQuery({
    queryKey: ["academy-trainers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_trainers")
        .select("id, full_name")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("academy_complaints" as any)
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academy-complaints"] });
      toast.success("Complaint submitted successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to submit complaint: " + error.message);
    }
  });

  const handleOpenDialog = () => {
    setFormData({
      complaint_from: '',
      complaint_to: '',
      complaint_description: '',
      status: 'pending'
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      complaint_from: '',
      complaint_to: '',
      complaint_description: '',
      status: 'pending'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  // Check if user is admin (you may need to adjust this logic based on your role system)
  const isAdmin = false; // Temporarily set to false for testing

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complaints Management</CardTitle>
          <CardDescription>View and manage complaints</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdmin && (
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Complaint
              </Button>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Complaint From</TableHead>
                <TableHead>Complaint To</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No complaints found
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((complaint: any, index: number) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(complaint.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{complaint.complaint_from_name || 'N/A'}</TableCell>
                    <TableCell>{complaint.complaint_to_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Complaint</DialogTitle>
            <DialogDescription>Submit a complaint</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="complaint_to">Complaint To</Label>
                <Select
                  value={formData.complaint_to}
                  onValueChange={(value) => setFormData({ ...formData, complaint_to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainees.map((trainee: any) => (
                      <SelectItem key={trainee.id} value={trainee.id}>
                        {trainee.full_name} (Trainee)
                      </SelectItem>
                    ))}
                    {trainers.map((trainer: any) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.full_name} (Trainer)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint_description">Complaint Description</Label>
                <Textarea
                  id="complaint_description"
                  value={formData.complaint_description}
                  onChange={(e) => setFormData({ ...formData, complaint_description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">Submit Complaint</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
