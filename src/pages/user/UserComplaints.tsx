import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const UserComplaints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    complaint_to: '',
    complaint_text: '',
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['user-complaints', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academy_complaints')
        .select('*, employees!academy_complaints_complaint_to_fkey(profile_id, profiles(full_name))')
        .eq('complaint_from', user?.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, profile_id, profiles(full_name)')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('academy_complaints')
        .insert({
          ...data,
          complaint_from: user?.id,
          date: new Date().toISOString().split('T')[0],
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-complaints'] });
      toast.success('Complaint submitted successfully');
      setOpen(false);
      setFormData({ complaint_to: '', complaint_text: '' });
    },
    onError: () => {
      toast.error('Failed to submit complaint');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.complaint_text.trim()) {
      toast.error('Please enter complaint details');
      return;
    }
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Complaints</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Complaint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Complaint To</Label>
                <Select 
                  onValueChange={(value) => setFormData({ ...formData, complaint_to: value })} 
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.profiles?.full_name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Complaint Details</Label>
                <Textarea
                  value={formData.complaint_text}
                  onChange={(e) => setFormData({ ...formData, complaint_text: e.target.value })}
                  placeholder="Describe your complaint..."
                  rows={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S. No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Complaint To</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints && complaints.length > 0 ? (
              complaints.map((complaint, index) => (
                <TableRow key={complaint.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                  <TableCell>{complaint.employees?.profiles?.full_name || 'Unknown'}</TableCell>
                  <TableCell className="max-w-xs truncate">{complaint.complaint_text}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      complaint.status === 'resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No complaints found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserComplaints;
