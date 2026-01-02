import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Complaint {
  id: string;
  complaint_text: string;
  complaint_from: string | null;
  complaint_to: string | null;
  status: string | null;
  reply: string | null;
  date: string;
  sender_name: string;
  sender_type: string;
  recipient_name: string;
}

const ITComplaintsManager = () => {
  const queryClient = useQueryClient();
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch complaints raised by Interns and Employees only (not trainees/students)
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["it-company-complaints-interns-employees"],
    queryFn: async () => {
      // First get all complaints
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("academy_complaints")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (complaintsError) throw complaintsError;
      if (!complaintsData || complaintsData.length === 0) return [];

      // Get all sender IDs from complaints
      const senderIds = complaintsData
        .map((c: any) => c.complaint_from)
        .filter((id: string | null) => id !== null);

      // Get all recipient IDs from complaints
      const recipientIds = complaintsData
        .map((c: any) => c.complaint_to)
        .filter((id: string | null) => id !== null);

      const placeholderId = '00000000-0000-0000-0000-000000000000';

      // Fetch internship candidates (interns)
      const { data: interns } = await supabase
        .from("internship_candidates")
        .select("id, name")
        .in("id", senderIds.length > 0 ? senderIds : [placeholderId]);

      // Fetch employees - employees use profile_id as complaint_from
      const { data: employees } = await supabase
        .from("employees")
        .select("id, profile_id")
        .in("profile_id", senderIds.length > 0 ? senderIds : [placeholderId]);

      // Get profile IDs for employee senders
      const senderProfileIds = employees?.map((e: any) => e.profile_id).filter(Boolean) || [];

      // Fetch profiles for employee senders
      const { data: senderProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", senderProfileIds.length > 0 ? senderProfileIds : [placeholderId]);

      // Fetch recipient employees
      const { data: recipientEmployees } = await supabase
        .from("employees")
        .select("id, profile_id")
        .in("id", recipientIds.length > 0 ? recipientIds : [placeholderId]);

      // Get profile IDs for recipients
      const recipientProfileIds = recipientEmployees?.map((e: any) => e.profile_id).filter(Boolean) || [];

      // Fetch profiles for recipients
      const { data: recipientProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", recipientProfileIds.length > 0 ? recipientProfileIds : [placeholderId]);

      // Create lookup maps
      const internMap = new Map(interns?.map((i: any) => [i.id, i.name]) || []);
      // Map profile_id to employee info for matching complaint_from
      const employeeByProfileId = new Map(employees?.map((e: any) => [e.profile_id, e]) || []);
      const senderProfileMap = new Map(senderProfiles?.map((p: any) => [p.id, p.full_name]) || []);
      const recipientEmployeeProfileMap = new Map(recipientEmployees?.map((e: any) => [e.id, e.profile_id]) || []);
      const recipientProfileMap = new Map(recipientProfiles?.map((p: any) => [p.id, p.full_name]) || []);

      // Enrich complaints with names - include only complaints from interns OR employees
      const enrichedComplaints = complaintsData
        .filter((complaint: any) => {
          const isIntern = internMap.has(complaint.complaint_from);
          const isEmployee = employeeByProfileId.has(complaint.complaint_from);
          return isIntern || isEmployee;
        })
        .map((complaint: any) => {
          const isIntern = internMap.has(complaint.complaint_from);
          const isEmployee = employeeByProfileId.has(complaint.complaint_from);
          
          let senderName = 'Unknown';
          let senderType = 'Unknown';
          
          if (isIntern) {
            senderName = internMap.get(complaint.complaint_from) || 'Unknown';
            senderType = 'Intern';
          } else if (isEmployee) {
            senderName = senderProfileMap.get(complaint.complaint_from) || 'Unknown';
            senderType = 'Employee';
          }
          
          const recipientProfileId = recipientEmployeeProfileMap.get(complaint.complaint_to);
          const recipientName = recipientProfileMap.get(recipientProfileId) || 'Unknown';
          
          return {
            ...complaint,
            sender_name: senderName,
            sender_type: senderType,
            recipient_name: recipientName
          };
        });

      return enrichedComplaints as Complaint[];
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const { error } = await supabase
        .from("academy_complaints")
        .update({ reply, status: "resolved" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reply sent successfully");
      queryClient.invalidateQueries({ queryKey: ["it-company-complaints-interns-employees"] });
      setIsReplyDialogOpen(false);
      setReplyText("");
      setSelectedComplaint(null);
    },
    onError: () => {
      toast.error("Failed to send reply");
    },
  });

  const handleOpenReplyDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.reply || "");
    setIsReplyDialogOpen(true);
  };

  const handleOpenViewDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsViewDialogOpen(true);
  };

  const handleSubmitReply = () => {
    if (!selectedComplaint || !replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    replyMutation.mutate({ id: selectedComplaint.id, reply: replyText });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Intern & Employee Complaints</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No complaints found from interns or employees.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>
                    {format(new Date(complaint.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{complaint.sender_name}</TableCell>
                  <TableCell>
                    <Badge variant={complaint.sender_type === 'Intern' ? 'secondary' : 'outline'}>
                      {complaint.sender_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{complaint.recipient_name}</TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenViewDialog(complaint)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReplyDialog(complaint)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* View Complaint Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complaint Details</DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">From ({selectedComplaint.sender_type})</p>
                  <p>{selectedComplaint.sender_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">To</p>
                  <p>{selectedComplaint.recipient_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p>{format(new Date(selectedComplaint.date), "dd MMM yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Complaint</p>
                  <p className="whitespace-pre-wrap">{selectedComplaint.complaint_text}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                {selectedComplaint.reply && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reply</p>
                    <p className="whitespace-pre-wrap">{selectedComplaint.reply}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to Complaint</DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">From ({selectedComplaint.sender_type})</p>
                  <p>{selectedComplaint.sender_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Complaint</p>
                  <p className="text-sm">{selectedComplaint.complaint_text}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Your Reply</p>
                  <Input
                    placeholder="Enter your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReply} disabled={replyMutation.isPending}>
                {replyMutation.isPending ? "Sending..." : "Send Reply"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ITComplaintsManager;
