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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 7;

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
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-4">
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
                  <AvatarImage src="" />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold">{trainee.full_name}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {trainee.student_code}
                  </Badge>
                  {hasCourseAssigned && (
                    <>
                      <p className="text-sm font-medium text-primary pt-2">{assignedCourse.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {courses.find(c => c.id === assignedCourse.id)?.duration_weeks || 0} Months
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side - Details Grid */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Company Email</p>
                    <p className="font-medium">{trainee.email || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{trainee.phone || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{trainee.address || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-medium">{trainee.student_code}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Password</p>
                    <p className="font-medium">{trainee.password || "********"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date Of Joining</p>
                    <p className="font-medium">{trainee.created_at ? new Date(trainee.created_at).toLocaleDateString() : "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{trainee.date_of_birth || "N/A"}</p>
                  </div>
                  
                  {hasCourseAssigned && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Course Name</p>
                        <p className="font-medium">{assignedCourse.name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Course Duration</p>
                        <p className="font-medium">{courses.find(c => c.id === assignedCourse.id)?.duration_weeks || 0} Months</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Slot Timing</p>
                        <p className="font-medium">9:30 - 1:00</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Batch</p>
                        <p className="font-medium">-</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Incharge Name</p>
                        <p className="font-medium">-</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Fees</p>
                        <p className="font-medium text-primary">₹{totalFees.toFixed(2)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Paid Amount</p>
                        <p className="font-medium text-green-600">₹{paidAmount.toFixed(2)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Balance Amount</p>
                        <p className="font-medium text-red-600">₹{pendingAmount.toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History Section */}
        {hasCourseAssigned && (
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Payment History</h2>
                <div className="flex gap-2">
                  <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" className="gap-2 bg-primary">
                        <Plus className="h-4 w-4" />
                        Add Course
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
                      payments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((payment) => (
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

              {payments.length > itemsPerPage && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.ceil(payments.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < Math.ceil(payments.length / itemsPerPage) && setCurrentPage(currentPage + 1)}
                          className={currentPage === Math.ceil(payments.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
