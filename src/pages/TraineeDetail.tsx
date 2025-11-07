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
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

export default function TraineeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseFees, setCourseFees] = useState(0);

  // Fetch trainee details
  const { data: trainee } = useQuery({
    queryKey: ["trainee", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .maybeSingle();
      
      if (!entity) return [];
      
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("entity_id", entity.id)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  // Fetch assigned course (single course assignment)
  const { data: assignedCourse } = useQuery({
    queryKey: ["assigned-course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_payments")
        .select(`
          course_id,
          courses!inner(
            id,
            name,
            fees
          )
        `)
        .eq("student_id", id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.courses || null;
    },
  });

  // Fetch payment history
  const { data: payments = [] } = useQuery({
    queryKey: ["trainee-payments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_payments")
        .select(`
          *,
          courses(name, fees)
        `)
        .eq("student_id", id)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate totals
  const totalFees = assignedCourse ? Number(assignedCourse.fees || 0) : 0;
  const paidAmount = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingAmount = totalFees - paidAmount;

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setCourseFees(Number(course.fees || 0));
    }
  };

  // Add course mutation
  const addCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from("academy_payments")
        .insert({
          student_id: id,
          course_id: courseId,
          amount: courseFees,
          payment_date: new Date().toISOString().split('T')[0],
          payment_code: `PAY-${Date.now()}`,
          status: "pending",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Course assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["assigned-course", id] });
      queryClient.invalidateQueries({ queryKey: ["trainee-payments", id] });
      setIsCourseDialogOpen(false);
      setSelectedCourse("");
      setCourseFees(0);
    },
    onError: () => {
      toast.error("Failed to assign course");
    },
  });

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase
        .from("academy_payments")
        .insert({
          student_id: id,
          payment_code: formData.get("payment_code") as string,
          course_id: assignedCourse?.id,
          amount: Number(formData.get("paid_amount")),
          payment_date: formData.get("payment_date") as string,
          payment_method: formData.get("payment_method") as string,
          notes: `Received by: ${formData.get("received_by")}`,
          status: "paid" as const,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["trainee-payments", id] });
      setIsPaymentDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  const handleCourseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addCourseMutation.mutate(selectedCourse);
  };

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addPaymentMutation.mutate(formData);
  };

  if (!trainee) {
    return <div>Loading...</div>;
  }

  const initials = trainee.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const hasCourseAssigned = !!assignedCourse;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={hasCourseAssigned} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {hasCourseAssigned ? "Course Already Assigned" : "Add Course"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCourseSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="course_id">Select Course</Label>
                    <Select
                      value={selectedCourse}
                      onValueChange={handleCourseChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} - {course.duration_weeks} weeks
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedCourse && (
                    <div>
                      <Label>Course Fees</Label>
                      <p className="text-2xl font-bold">₹{courseFees.toFixed(2)}</p>
                    </div>
                  )}
                  <Button type="submit" className="w-full">
                    Assign Course
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <h1 className="text-4xl font-bold text-center">Trainee Profile</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Profile Section */}
        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
              {/* Left Side - Avatar and Basic Info */}
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-40 w-40">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{trainee.full_name}</h2>
                  {hasCourseAssigned && (
                    <>
                      <p className="text-lg text-muted-foreground">{assignedCourse.name}</p>
                      <p className="text-base text-muted-foreground">
                        {courses.find(c => c.id === assignedCourse.id)?.duration_weeks || 0} Months
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side - Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Full Name</span>
                  <span className="text-muted-foreground">{trainee.full_name}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Gender</span>
                  <span className="text-muted-foreground">{trainee.gender || "N/A"}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Email</span>
                  <span className="text-muted-foreground">{trainee.email || "N/A"}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Username</span>
                  <span className="text-muted-foreground">{trainee.student_code}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Date of Birth</span>
                  <span className="text-muted-foreground">{trainee.date_of_birth || "N/A"}</span>
                </div>
                
                {hasCourseAssigned && (
                  <>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">Role</span>
                      <span className="text-muted-foreground">Trainee</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">Fee</span>
                      <span className="text-muted-foreground">₹{totalFees.toFixed(0)}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Mode</span>
                  <span className="text-muted-foreground">Online</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Phone</span>
                  <span className="text-muted-foreground">{trainee.phone || "N/A"}</span>
                </div>

                {hasCourseAssigned && (
                  <>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">Amount Paid</span>
                      <span className="text-green-600 font-semibold">₹{paidAmount.toFixed(0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">Pending Amount</span>
                      <span className="text-red-600 font-semibold">₹{pendingAmount.toFixed(0)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History Section */}
        {hasCourseAssigned && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Payment History</h2>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div>
                        <Label>Trainee Name</Label>
                        <Input value={trainee.full_name} disabled />
                      </div>
                      <div>
                        <Label>Course</Label>
                        <Input value={assignedCourse?.name} disabled />
                      </div>
                      <div>
                        <Label htmlFor="payment_code">Payment Code</Label>
                        <Input
                          id="payment_code"
                          name="payment_code"
                          defaultValue={`PAY-${Date.now()}`}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment_date">Date</Label>
                        <Input
                          id="payment_date"
                          name="payment_date"
                          type="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="paid_amount">Paid Amount</Label>
                        <Input
                          id="paid_amount"
                          name="paid_amount"
                          type="number"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment_method">Payment Mode</Label>
                        <Select name="payment_method" required>
                          <SelectTrigger>
                            <SelectValue />
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
                        <Input id="received_by" name="received_by" required />
                      </div>
                      <Button type="submit" className="w-full">
                        Save Payment
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Code</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No payment records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.payment_code}</TableCell>
                          <TableCell>{payment.payment_date}</TableCell>
                          <TableCell className="font-semibold">₹{Number(payment.amount).toFixed(2)}</TableCell>
                          <TableCell className="capitalize">{payment.payment_method || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{payment.notes || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
