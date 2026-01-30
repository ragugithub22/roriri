import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquareReply, Eye } from "lucide-react";
import { toast } from "sonner";

interface Complaint {
  id: string;
  date: string;
  complaint_from: string | null;
  complaint_to: string | null;
  complaint_text: string;
  status: string | null;
  reply: string | null;
  created_at: string;
  sender_name?: string;
  sender_type?: 'trainee' | 'intern';
}

interface OtherComplaintsManagerProps {
  employeeId: string;
}

export default function OtherComplaintsManager({ employeeId }: OtherComplaintsManagerProps) {
  const queryClient = useQueryClient();
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch complaints addressed to this employee from trainees/interns
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["other-complaints", employeeId],
    queryFn: async () => {
      // First get all complaints addressed to this employee
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("academy_complaints")
        .select("*")
        .eq("complaint_to", employeeId)
        .order("created_at", { ascending: false });
      
      if (complaintsError) throw complaintsError;
      if (!complaintsData || complaintsData.length === 0) return [];

      // Get all sender IDs from complaints
      const senderIds = complaintsData
        .map((c: any) => c.complaint_from)
        .filter((id: string | null) => id !== null);

      const placeholderId = '00000000-0000-0000-0000-000000000000';

      // Fetch students (IT Academy trainees)
      const { data: students } = await supabase
        .from("students")
        .select("id, full_name")
        .in("id", senderIds.length > 0 ? senderIds : [placeholderId]);

      // Fetch internship candidates (interns)
      const { data: interns } = await supabase
        .from("internship_candidates")
        .select("id, name")
        .in("id", senderIds.length > 0 ? senderIds : [placeholderId]);

      // Create lookup maps
      const studentMap = new Map(students?.map((s: any) => [s.id, s.full_name]) || []);
      const internMap = new Map(interns?.map((i: any) => [i.id, i.name]) || []);

      // Enrich complaints with names - include complaints from students OR interns
      const enrichedComplaints = complaintsData
        .filter((complaint: any) => 
          studentMap.has(complaint.complaint_from) || internMap.has(complaint.complaint_from)
        )
        .map((complaint: any) => {
          const isStudent = studentMap.has(complaint.complaint_from);
          return {
            ...complaint,
            sender_name: isStudent 
              ? studentMap.get(complaint.complaint_from) 
              : internMap.get(complaint.complaint_from) || 'Unknown',
            sender_type: isStudent ? 'trainee' : 'intern'
          };
        });

      return enrichedComplaints as Complaint[];
    },
    enabled: !!employeeId
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const { error } = await supabase
        .from("academy_complaints")
        .update({ 
          reply, 
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["other-complaints", employeeId] });
      toast.success("Reply sent successfully");
      handleCloseReplyDialog();
    },
    onError: (error) => {
      toast.error("Failed to send reply: " + error.message);
    }
  });

  const handleOpenReplyDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.reply || "");
    setIsReplyDialogOpen(true);
  };

  const handleCloseReplyDialog = () => {
    setIsReplyDialogOpen(false);
    setSelectedComplaint(null);
    setReplyText("");
  };

  const handleOpenViewDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedComplaint(null);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    replyMutation.mutate({ id: selectedComplaint.id, reply: replyText.trim() });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complaints from Trainees & Interns</CardTitle>
          <CardDescription>View and respond to complaints addressed to you</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Loading complaints...
                  </TableCell>
                </TableRow>
              ) : complaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No complaints from trainees or interns
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((complaint, index) => (
                  <TableRow key={complaint.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{complaint.sender_name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        complaint.sender_type === 'trainee' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {complaint.sender_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        complaint.status === 'resolved' 
                          ? 'bg-green-100 text-green-800'
                          : complaint.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.status || 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          title="View Details"
                          onClick={() => handleOpenViewDialog(complaint)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          title="Reply"
                          onClick={() => handleOpenReplyDialog(complaint)}
                        >
                          <MessageSquareReply className="h-4 w-4" />
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

      {/* View Complaint Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              Complaint from {selectedComplaint?.sender_name} ({selectedComplaint?.sender_type})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground text-sm">Date</Label>
              <p className="font-medium">{selectedComplaint?.date && new Date(selectedComplaint.date).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Complaint</Label>
              <p className="font-medium whitespace-pre-wrap">{selectedComplaint?.complaint_text}</p>
            </div>
            {selectedComplaint?.reply && (
              <div>
                <Label className="text-muted-foreground text-sm">Your Reply</Label>
                <p className="font-medium whitespace-pre-wrap">{selectedComplaint.reply}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseViewDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to Complaint</DialogTitle>
            <DialogDescription>
              Responding to {selectedComplaint?.sender_name}'s complaint
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitReply}>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground text-sm">Original Complaint</Label>
                <p className="text-sm bg-muted p-3 rounded-md mt-1">{selectedComplaint?.complaint_text}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter your reply..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseReplyDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={replyMutation.isPending}>
                {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
