import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, Upload, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseFees, setCourseFees] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Fetch student details
  const { data: student } = useQuery({
    queryKey: ["student", id],
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

  // Fetch student enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ["student-enrollments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_payments")
        .select(`
          *,
          course:courses(name, fees)
        `)
        .eq("student_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate totals
  const totalAmount = enrollments.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const paidAmount = enrollments
    .filter(e => e.status === "paid")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

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
    mutationFn: async (formData: FormData) => {
      const courseId = formData.get("course_id") as string;
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
      toast.success("Course added successfully");
      queryClient.invalidateQueries({ queryKey: ["student-enrollments", id] });
      setIsCourseDialogOpen(false);
      setSelectedCourse("");
      setCourseFees(0);
    },
    onError: () => {
      toast.error("Failed to add course");
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
          course_id: formData.get("course_id") as string,
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
      queryClient.invalidateQueries({ queryKey: ["student-enrollments", id] });
      setIsPaymentDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  const handleCourseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addCourseMutation.mutate(formData);
  };

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addPaymentMutation.mutate(formData);
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  const initials = student.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout
      entityName="Student Details"
      entityIcon={GraduationCap}
      entityColor="from-blue-500 to-indigo-600"
    >
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Profile Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="photo-upload"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Student Code</Label>
                  <p className="text-lg font-semibold">{student.student_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="text-lg font-semibold">{student.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-lg">{student.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="text-lg">{student.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date of Birth</Label>
                  <p className="text-lg">{student.date_of_birth || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Enrollment Date</Label>
                  <p className="text-lg">{student.enrollment_date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={student.status === "active" ? "default" : "secondary"}>
                    {student.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="text-lg">{student.address || "-"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Paid Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">₹{paidAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">₹{pendingAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Enrolled Courses</CardTitle>
              <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Course</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCourseSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="course_id">Select Course</Label>
                      <Select
                        name="course_id"
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
                      Save Course
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* Payments Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Payment History</CardTitle>
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <Label>Student Name</Label>
                      <Input value={student.full_name} disabled />
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
                      <Label htmlFor="course_id">Course</Label>
                      <Select name="course_id" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {enrollments.map((enrollment) => (
                            <SelectItem key={enrollment.id} value={enrollment.course_id || ""}>
                              {enrollment.course?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Code</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.payment_code}</TableCell>
                    <TableCell>{payment.payment_date}</TableCell>
                    <TableCell>{payment.course?.name || "-"}</TableCell>
                    <TableCell>₹{Number(payment.amount).toFixed(2)}</TableCell>
                    <TableCell>{payment.payment_method || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
