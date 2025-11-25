import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { toast } from "sonner";

export default function InternDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Fetch intern details
  const { data: intern } = useQuery({
    queryKey: ["intern", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_candidates")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch course details
  const { data: courseDetails } = useQuery({
    queryKey: ["intern-course", intern?.course_id],
    queryFn: async () => {
      if (!intern?.course_id) return null;
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", intern.course_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!intern?.course_id,
  });

  // Fetch incharge person
  const { data: inchargePerson } = useQuery({
    queryKey: ["incharge-person", intern?.incharge_person_id],
    queryFn: async () => {
      if (!intern?.incharge_person_id) return null;
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          profiles!inner(full_name)
        `)
        .eq("id", intern.incharge_person_id)
        .maybeSingle();
      if (error) throw error;
      return data?.profiles?.full_name || null;
    },
    enabled: !!intern?.incharge_person_id,
  });

  // Fetch payment history
  const { data: payments = [] } = useQuery({
    queryKey: ["intern-payments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_payments")
        .select("*")
        .eq("candidate_id", id)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate totals
  const totalFees = intern?.fees || 0;
  const totalPaidAmount = payments.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);
  const pendingAmount = totalFees - totalPaidAmount;

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const paidAmount = Number(formData.get("paid_amount"));
      const paymentData = {
        candidate_id: id,
        receipt_id: formData.get("receipt_id") as string,
        total_amount: totalFees,
        paid_amount: paidAmount,
        pending_amount: pendingAmount - paidAmount,
        payment_date: formData.get("payment_date") as string,
        payment_mode: formData.get("payment_mode") as string,
        received_by: formData.get("received_by") as string,
        notes: formData.get("notes") as string,
      };
      
      const { data, error } = await supabase
        .from("internship_payments")
        .insert(paymentData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["intern-payments", id] });
      setIsPaymentDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addPaymentMutation.mutate(formData);
  };

  if (!intern) {
    return <div>Loading...</div>;
  }

  const initials = intern.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Profile Section */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
              {/* Left Side - Avatar and Basic Info */}
              <div className="flex flex-col items-center space-y-4 border-r pr-6">
                <Avatar className="h-32 w-32 border-4 border-primary/10">
                  <AvatarImage src={intern.image_url || ""} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold">{intern.name}</h2>
                  {courseDetails && (
                    <Badge variant="secondary" className="text-xs">
                      {courseDetails.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right Side - Details Grid */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{intern.name}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{intern.gender || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{intern.email || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{intern.phone || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{intern.username || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Password</p>
                    <p className="font-medium">{intern.password || "********"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Joining Date</p>
                    <p className="font-medium">{intern.joining_date ? new Date(intern.joining_date).toLocaleDateString() : "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Mode</p>
                    <p className="font-medium capitalize">{intern.mode || "N/A"}</p>
                  </div>
                  
                  {courseDetails && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Course Duration</p>
                        <p className="font-medium">{intern.duration_value} {intern.duration_unit}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Course Fees</p>
                        <p className="font-medium text-primary">₹{intern.fees}</p>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{intern.address || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Incharge Name</p>
                    <p className="font-medium">{inchargePerson || "Not Assigned"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Fees</p>
                    <p className="font-medium text-primary">₹{totalFees.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Paid Amount</p>
                    <p className="font-medium text-green-600">₹{totalPaidAmount.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Balance Amount</p>
                    <p className="font-medium text-red-600">₹{pendingAmount.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={intern.status === "active" ? "default" : "secondary"} className="capitalize">
                      {intern.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History Section */}
        <Card className="shadow-lg mt-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Payment History</h2>
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Payment</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <Label>Intern Name <span className="text-red-500">*</span></Label>
                      <Input value={intern.name} disabled className="bg-muted" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Overall Amount <span className="text-red-500">*</span></Label>
                        <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                          <span className="mr-2">₹</span>
                          <span>{totalFees.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="paid_amount">Paid Amount <span className="text-red-500">*</span></Label>
                        <div className="flex items-center border rounded-md">
                          <span className="pl-3">₹</span>
                          <Input
                            id="paid_amount"
                            name="paid_amount"
                            type="number"
                            step="0.01"
                            min="0"
                            max={pendingAmount}
                            className="border-0"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="receipt_id">Receipt ID <span className="text-red-500">*</span></Label>
                        <Input
                          id="receipt_id"
                          name="receipt_id"
                          defaultValue={`RCP-${Date.now()}`}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="payment_date">Payment Date <span className="text-red-500">*</span></Label>
                        <Input
                          id="payment_date"
                          name="payment_date"
                          type="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="payment_mode">Payment Mode <span className="text-red-500">*</span></Label>
                        <Select name="payment_mode" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="received_by">Received By</Label>
                        <Input
                          id="received_by"
                          name="received_by"
                          placeholder="Name of receiver"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        name="notes"
                        placeholder="Additional notes (optional)"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Submit Payment
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S. No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Received By</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No payment records found</TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment, index) => (
                    <TableRow key={payment.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell>₹{Number(payment.total_amount).toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">₹{Number(payment.paid_amount).toFixed(2)}</TableCell>
                      <TableCell>{payment.received_by || "N/A"}</TableCell>
                      <TableCell className="capitalize">{payment.payment_mode || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={Number(payment.pending_amount) === 0 ? "default" : "secondary"}>
                          {Number(payment.pending_amount) === 0 ? "Paid" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            const receiptInfo = {
                              receipt_id: payment.receipt_id,
                              payment_date: payment.payment_date,
                              paid_amount: payment.paid_amount,
                              payment_mode: payment.payment_mode,
                              candidateName: intern.name,
                              courseName: courseDetails?.name || "N/A",
                              totalFees,
                              balance: Number(payment.pending_amount),
                            };
                            
                            // Store receipt data in localStorage
                            localStorage.setItem('receiptData', JSON.stringify(receiptInfo));
                            
                            // Open receipt in new tab
                            const receiptWindow = window.open('/receipt', '_blank');
                            if (!receiptWindow) {
                              toast.error('Please allow pop-ups to view receipt');
                            }
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          Bill PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
