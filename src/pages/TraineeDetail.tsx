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
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { toast } from "sonner";

interface TraineeDetailProps {
  traineeId?: string;
  onBack?: () => void;
}

export default function TraineeDetail({ traineeId: propTraineeId, onBack }: TraineeDetailProps) {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const id = propTraineeId || paramId;
  const queryClient = useQueryClient();
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseFees, setCourseFees] = useState(0);
  const [courseDuration, setCourseDuration] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [paidAmount, setPaidAmount] = useState(0);

  const itemsPerPage = 7;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

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

  // Fetch trainer (incharge) for the assigned course
  const { data: trainerInfo } = useQuery({
    queryKey: ["course-trainer", assignedCourse?.id],
    queryFn: async () => {
      if (!assignedCourse?.id) return null;
      
      const { data: batch } = await supabase
        .from("batches")
        .select(`
          trainer_id,
          it_trainers!inner(
            full_name
          )
        `)
        .eq("course_id", assignedCourse.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      
      return batch?.it_trainers?.full_name || null;
    },
    enabled: !!assignedCourse?.id,
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
  const totalPaidAmount = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingAmount = totalFees - totalPaidAmount;
  const balanceAmount = totalFees - totalPaidAmount - paidAmount;

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setCourseFees(Number(course.fees || 0));
      setCourseDuration(course.duration_weeks || 0);
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
      const paymentData = {
        student_id: id,
        payment_code: formData.get("receipt_id") as string,
        course_id: assignedCourse?.id,
        amount: Number(formData.get("paid_amount")),
        payment_date: formData.get("payment_date") as string,
        payment_method: formData.get("payment_method") as string,
        status: "paid" as const,
      };
      
      const { data, error } = await supabase
        .from("academy_payments")
        .insert(paymentData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["trainee-payments", id] });
      setIsPaymentDialogOpen(false);
      setPaidAmount(0);
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
        {/* Header with Back Button and Assign Course Button */}
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          {/* Assign Course Button */}
          {!hasCourseAssigned && (
            <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Assign Course
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
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedCourse && (
                    <>
                      <div>
                        <Label>Course Fees</Label>
                        <p className="text-2xl font-bold text-primary">₹{courseFees.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <p className="text-lg font-medium">{courseDuration} Months</p>
                      </div>
                    </>
                  )}
                  <Button type="submit" className="w-full">
                    Assign Course
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
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
                  {hasCourseAssigned && (
                    <Badge variant="secondary" className="text-xs">
                      {assignedCourse.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right Side - Details Grid */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{trainee.full_name}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{trainee.gender || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{trainee.email || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{trainee.date_of_birth ? new Date(trainee.date_of_birth).toLocaleDateString() : "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{trainee.phone || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{trainee.student_code}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Password</p>
                    <p className="font-medium">{trainee.password || "********"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Enrollment Date</p>
                    <p className="font-medium">{trainee.enrollment_date ? new Date(trainee.enrollment_date).toLocaleDateString() : "N/A"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={trainee.status === "active" ? "default" : "secondary"} className="capitalize">
                      {trainee.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Residence Type</p>
                    <p className="font-medium capitalize">{trainee.residence_type || "N/A"}</p>
                  </div>
                  
                  {hasCourseAssigned && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Course Duration</p>
                        <p className="font-medium">{courses.find(c => c.id === assignedCourse.id)?.duration_weeks || 0} Months</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Course Fees</p>
                        <p className="font-medium text-primary">₹{assignedCourse.fees}</p>
                      </div>
                    </>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{trainee.address || "N/A"}</p>
                  </div>
                  
                  {hasCourseAssigned && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Incharge Name</p>
                        <p className="font-medium">{trainerInfo || "Not Assigned"}</p>
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
                        <Label>Trainee Name <span className="text-red-500">*</span></Label>
                        <Input value={trainee.full_name} disabled className="bg-muted" />
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
                          <Label>Amount Received <span className="text-red-500">*</span></Label>
                          <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                            <span className="mr-2">₹</span>
                            <span>{totalPaidAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="paid_amount">Amount Paid <span className="text-red-500">*</span></Label>
                          <div className="flex items-center border rounded-md">
                            <span className="px-3 text-muted-foreground">₹</span>
                            <Input
                              id="paid_amount"
                              name="paid_amount"
                              type="number"
                              step="0.01"
                              placeholder="Enter the Amount"
                              className="border-0 focus-visible:ring-0"
                              value={paidAmount || ""}
                              onChange={(e) => setPaidAmount(Number(e.target.value))}
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Balance Amount <span className="text-red-500">*</span></Label>
                          <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                            <span className="mr-2">₹</span>
                            <span>{balanceAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
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
                        
                        <div>
                          <Label htmlFor="payment_method">Payment Mode <span className="text-red-500">*</span></Label>
                          <Select name="payment_method" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose...." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="receipt_id">Receipt/Transaction Id</Label>
                        <div className="flex items-center border rounded-md">
                          <span className="px-3 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                          </span>
                          <Input
                            id="receipt_id"
                            name="receipt_id"
                            placeholder="Receipt/Transaction ID"
                            className="border-0 focus-visible:ring-0"
                            defaultValue={`TXN-${Date.now()}`}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="flex-1"
                          onClick={() => {
                            setIsPaymentDialogOpen(false);
                            setPaidAmount(0);
                          }}
                        >
                          Close
                        </Button>
                        <Button type="submit" className="flex-1">
                          Save changes
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No payment records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments
                        .filter(payment => payment.status === "paid")
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-semibold">₹{Number(payment.amount).toFixed(2)}</TableCell>
                          <TableCell className="capitalize">{payment.payment_method || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                const receiptInfo = {
                                  payment_code: payment.payment_code,
                                  payment_date: payment.payment_date,
                                  amount: payment.amount,
                                  payment_method: payment.payment_method,
                                  studentName: trainee.full_name,
                                  courseName: assignedCourse?.name || "All",
                                  totalFees,
                                  balance: totalFees - totalPaidAmount,
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
              </div>

              {payments.filter(p => p.status === "paid").length > itemsPerPage && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.ceil(payments.filter(p => p.status === "paid").length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
                          onClick={() => currentPage < Math.ceil(payments.filter(p => p.status === "paid").length / itemsPerPage) && setCurrentPage(currentPage + 1)}
                          className={currentPage === Math.ceil(payments.filter(p => p.status === "paid").length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
