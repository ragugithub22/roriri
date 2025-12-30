import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentReceipt } from '@/components/it-academy/PaymentReceipt';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  FileText, 
  Calendar, 
  AlertCircle,
  MessageCircle,
  LogOut,
  GraduationCap,
  Mail,
  Phone,
  Clock,
  FileIcon,
  Eye
} from 'lucide-react';

interface TraineeData {
  id: string;
  student_code: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  status: string;
  residence_type: string;
  enrollment_date: string;
  gender: string;
  password: string;
  incharge_person_id: string | null;
}

interface CourseData {
  id: string;
  name: string;
  course_code: string;
  description: string;
  duration_weeks: number;
  fees: number;
}

interface PaymentData {
  id: string;
  payment_code: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
}

interface SubjectData {
  id: string;
  subject_code: string;
  subject_name: string;
  description: string;
  hours: number;
  status: string;
}

interface SyllabusData {
  id: string;
  subject_id: string;
  week_number: number;
  topic: string;
  description: string;
  learning_objectives: string;
  resources: string;
  pdf_url: string;
}

interface ApplicationData {
  id: string;
  application_name: string;
  course_name: string;
  duration: string;
  description: string;
  created_at: string;
}

interface ComplaintData {
  id: string;
  date: string;
  complaint_to: string | null;
  complaint_text: string;
  status: string | null;
  reply: string | null;
  recipient_name?: string;
}

interface EmployeeData {
  id: string;
  full_name: string;
}

interface DailyUpdateData {
  id: string;
  date: string;
  work_description: string;
  hours_spent: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

export default function TraineeDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [traineeData, setTraineeData] = useState<TraineeData | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [syllabus, setSyllabus] = useState<Record<string, SyllabusData[]>>({});
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdateData[]>([]);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [totalFees, setTotalFees] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    work_description: '',
    hours_spent: '',
    status: 'in_progress' as 'pending' | 'in_progress' | 'completed'
  });
  const [complaintFormData, setComplaintFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    complaint_to: '',
    complaint_text: ''
  });
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [savingComplaint, setSavingComplaint] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const userSession = localStorage.getItem('userSession');
      if (!userSession) {
        setLoading(false);
        return;
      }

      const sessionData = JSON.parse(userSession);
      const originalId = sessionData.originalId || sessionData.userId;
      setUserId(originalId);

      // Fetch trainee data
      const { data: trainee, error: traineeError } = await supabase
        .from('students')
        .select('*')
        .eq('id', originalId)
        .single();

      if (traineeError) {
        console.error('Error fetching trainee data:', traineeError);
      } else {
        setTraineeData(trainee as TraineeData);
      }

      // Fetch course from academy_payments
      const { data: payment, error: paymentError } = await supabase
        .from('academy_payments')
        .select('course_id, courses(id, name, course_code, description, duration_weeks, fees)')
        .eq('student_id', originalId)
        .limit(1)
        .single();

      if (!paymentError && payment?.courses) {
        const course = payment.courses as unknown as CourseData;
        setCourseData(course);

        // Fetch subjects for this course
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('course_id', course.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true });

        if (!subjectsError && subjectsData) {
          setSubjects(subjectsData as SubjectData[]);

          // Fetch syllabus for all subjects
          const subjectIds = subjectsData.map(s => s.id);
          if (subjectIds.length > 0) {
            const { data: syllabusData, error: syllabusError } = await supabase
              .from('syllabus')
              .select('*')
              .in('subject_id', subjectIds)
              .order('week_number', { ascending: true });

            if (!syllabusError && syllabusData) {
              // Group syllabus by subject_id
              const grouped: Record<string, SyllabusData[]> = {};
              syllabusData.forEach((item: SyllabusData) => {
                if (!grouped[item.subject_id]) {
                  grouped[item.subject_id] = [];
                }
                grouped[item.subject_id].push(item);
              });
              setSyllabus(grouped);
            }
          }
        }
      }

      // Fetch applications for this trainee's course
      if (payment?.course_id) {
        const { data: apps, error: appsError } = await supabase
          .from('academy_applications')
          .select('*')
          .eq('course_id', payment.course_id)
          .order('created_at', { ascending: false });

        if (!appsError && apps) {
          setApplications(apps as ApplicationData[]);
        }
      }

      // Fetch all payments for this trainee
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('academy_payments')
        .select('id, payment_code, amount, payment_date, payment_method, status')
        .eq('student_id', originalId)
        .order('payment_date', { ascending: false });

      if (!paymentsError && paymentsData) {
        setPayments(paymentsData as PaymentData[]);
        // Calculate total fees from first payment (course enrollment)
        if (paymentsData.length > 0) {
          setTotalFees(paymentsData[0].amount || 0);
        }
      }

      // Fetch daily work updates for this trainee
      const { data: updatesData, error: updatesError } = await supabase
        .from('daily_work_updates')
        .select('id, date, work_description, hours_spent, status, created_at')
        .eq('user_id', originalId)
        .order('date', { ascending: false });

      if (!updatesError && updatesData) {
        setDailyUpdates(updatesData as DailyUpdateData[]);
      }

      // Fetch complaints for this trainee
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('academy_complaints')
        .select('id, date, complaint_to, complaint_text, status, reply')
        .eq('complaint_from', originalId)
        .order('date', { ascending: false });

      if (!complaintsError && complaintsData) {
        setComplaints(complaintsData as ComplaintData[]);
      }

      // Fetch employees for complaint recipient dropdown
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, profile_id, profiles(full_name)')
        .eq('status', 'active');

      if (!employeesError && employeesData) {
        const mappedEmployees = employeesData.map((emp: any) => ({
          id: emp.id,
          full_name: emp.profiles?.full_name || 'Unknown'
        }));
        setEmployees(mappedEmployees);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSaveDailyUpdate = async () => {
    if (!userId) {
      toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
      return;
    }

    if (!updateFormData.work_description.trim()) {
      toast({ title: 'Error', description: 'Please enter work description', variant: 'destructive' });
      return;
    }

    if (!updateFormData.hours_spent || parseFloat(updateFormData.hours_spent) <= 0) {
      toast({ title: 'Error', description: 'Please enter valid hours spent', variant: 'destructive' });
      return;
    }

    setSavingUpdate(true);
    try {
      const { data, error } = await supabase
        .from('daily_work_updates')
        .insert({
          user_id: userId,
          date: updateFormData.date,
          work_description: updateFormData.work_description,
          hours_spent: parseFloat(updateFormData.hours_spent),
          status: updateFormData.status
        })
        .select()
        .single();

      if (error) throw error;

      setDailyUpdates(prev => [data as DailyUpdateData, ...prev]);
      setShowUpdateModal(false);
      setUpdateFormData({
        date: new Date().toISOString().split('T')[0],
        work_description: '',
        hours_spent: '',
        status: 'in_progress'
      });
      toast({ title: 'Success', description: 'Daily update saved successfully' });
    } catch (error: any) {
      console.error('Error saving update:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save update', variant: 'destructive' });
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleSaveComplaint = async () => {
    if (!userId) {
      toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
      return;
    }

    if (!complaintFormData.complaint_to) {
      toast({ title: 'Error', description: 'Please select complaint recipient', variant: 'destructive' });
      return;
    }

    if (!complaintFormData.complaint_text.trim()) {
      toast({ title: 'Error', description: 'Please enter complaint details', variant: 'destructive' });
      return;
    }

    setSavingComplaint(true);
    try {
      const { data, error } = await supabase
        .from('academy_complaints')
        .insert({
          complaint_from: userId,
          complaint_to: complaintFormData.complaint_to,
          complaint_text: complaintFormData.complaint_text,
          date: complaintFormData.date,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      const recipientName = employees.find(e => e.id === complaintFormData.complaint_to)?.full_name || 'Unknown';
      setComplaints(prev => [{ ...data, recipient_name: recipientName } as ComplaintData, ...prev]);
      setShowComplaintModal(false);
      setComplaintFormData({
        date: new Date().toISOString().split('T')[0],
        complaint_to: '',
        complaint_text: ''
      });
      toast({ title: 'Success', description: 'Complaint submitted successfully' });
    } catch (error: any) {
      console.error('Error saving complaint:', error);
      toast({ title: 'Error', description: error.message || 'Failed to submit complaint', variant: 'destructive' });
    } finally {
      setSavingComplaint(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subject', label: 'Subject', icon: BookOpen },
    { id: 'application', label: 'Application', icon: FileText },
    { id: 'daily-update', label: 'Daily Update', icon: Calendar },
    { id: 'complaint', label: 'Complaint', icon: AlertCircle },
    { id: 'chat-box', label: 'Chat Box', icon: MessageCircle },
  ];

  const renderContent = () => {
    if (loading) {
      return <Skeleton className="h-96 w-full" />;
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Student Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{traineeData?.student_code || 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{courseData?.name || 'Not Assigned'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold capitalize">{traineeData?.status || 'Active'}</p>
                </CardContent>
              </Card>
            </div>
            
            {courseData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Course Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Course Name</p>
                      <p className="font-medium">{courseData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Course Code</p>
                      <p className="font-medium">{courseData.course_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{courseData.duration_weeks} Weeks</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Subjects</p>
                      <p className="font-medium">{subjects.length}</p>
                    </div>
                  </div>
                  {courseData.description && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{courseData.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Welcome, {traineeData?.full_name || 'Trainee'}!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Welcome to your Trainee Dashboard. Here you can view your course details, 
                  subjects, syllabus, and track your learning progress.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'profile':
        const totalPaid = payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0);
        const balanceAmount = totalFees - totalPaid;
        
        return (
          <div className="space-y-6">
            {/* Profile Details Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left side - Avatar */}
                  <div className="flex flex-col items-center min-w-[180px]">
                    <Avatar className="h-32 w-32 border-4 border-muted">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                        {traineeData?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold text-center">{traineeData?.full_name}</h2>
                    {courseData && (
                      <span className="mt-2 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                        {courseData.name}
                      </span>
                    )}
                  </div>

                  {/* Right side - Details Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Full Name</p>
                      <p className="font-medium">{traineeData?.full_name || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Gender</p>
                      <p className="font-medium capitalize">{traineeData?.gender || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Email</p>
                      <p className="font-medium">{traineeData?.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Date of Birth</p>
                      <p className="font-medium">{traineeData?.date_of_birth || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Phone</p>
                      <p className="font-medium">{traineeData?.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Username</p>
                      <p className="font-medium">{traineeData?.student_code || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Password</p>
                      <p className="font-medium">{traineeData?.password || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Enrollment Date</p>
                      <p className="font-medium">{traineeData?.enrollment_date || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Status</p>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        traineeData?.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {traineeData?.status || 'Active'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Residence Type</p>
                      <p className="font-medium capitalize">{traineeData?.residence_type || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Course Duration</p>
                      <p className="font-medium">{courseData ? `${courseData.duration_weeks} Weeks` : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Course Fees</p>
                      <p className="font-medium text-primary">₹{courseData?.fees?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Address</p>
                      <p className="font-medium">{traineeData?.address || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">In-charge Name</p>
                      <p className="font-medium">{traineeData?.incharge_person_id ? 'Assigned' : 'Not Assigned'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Course Trainer</p>
                      <p className="font-medium">Not Assigned</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Total Fees</p>
                      <p className="font-medium text-primary">₹{totalFees.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Total Paid Amount</p>
                      <p className="font-medium text-green-600">₹{totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Balance Amount</p>
                      <p className="font-medium text-red-500">₹{balanceAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Payment History</CardTitle>
                  {/* Add Payment button hidden for trainees */}
                </div>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
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
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                          <TableCell className="capitalize">{payment.payment_method || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              payment.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                  <FileIcon className="h-4 w-4" />
                                  Bill PDF
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                                <PaymentReceipt
                                  receiptData={{
                                    payment_code: payment.payment_code,
                                    payment_date: payment.payment_date,
                                    amount: payment.amount,
                                    payment_method: payment.payment_method,
                                    studentName: traineeData?.full_name || 'N/A',
                                    courseName: courseData?.name || 'N/A',
                                    totalFees: totalFees,
                                    balance: totalFees - payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0),
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No payment history found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'subject':
        return (
          <div className="space-y-6">
            {courseData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {courseData.name} - Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subjects.length > 0 ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">S. No</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-24">Syllabus</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subjects.map((subject, index) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell className="font-medium">{subject.subject_name}</TableCell>
                              <TableCell>{subject.hours} Hours</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {subject.description || '-'}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant={selectedSubjectId === subject.id ? "default" : "ghost"} 
                                  size="sm" 
                                  className="flex items-center gap-1"
                                  onClick={() => setSelectedSubjectId(
                                    selectedSubjectId === subject.id ? null : subject.id
                                  )}
                                >
                                  <Eye className="h-4 w-4" />
                                  {selectedSubjectId === subject.id ? 'Hide' : 'View'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Inline Syllabus Table */}
                      {selectedSubjectId && (
                        <Card className="border-primary/20">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                              {subjects.find(s => s.id === selectedSubjectId)?.subject_name} - Syllabus
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {syllabus[selectedSubjectId]?.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-20">Week</TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-20">PDF</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {syllabus[selectedSubjectId].map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">
                                        Week {item.week_number}
                                      </TableCell>
                                      <TableCell>{item.topic}</TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {item.description || '-'}
                                      </TableCell>
                                      <TableCell>
                                        {item.pdf_url ? (
                                          <a 
                                            href={item.pdf_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                          >
                                            <FileIcon className="h-4 w-4" />
                                            View
                                          </a>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-muted-foreground text-center py-4">
                                No syllabus available for this subject
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No subjects available for this course
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {!courseData && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center py-8">
                    No course assigned yet. Please contact your administrator.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'application':
        return (
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S. No</TableHead>
                      <TableHead>Application Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app, index) => (
                      <TableRow key={app.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{app.application_name}</TableCell>
                        <TableCell>{app.course_name}</TableCell>
                        <TableCell>{app.duration}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {app.description || '-'}
                        </TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No applications found
                </p>
              )}
            </CardContent>
          </Card>
        );

      case 'daily-update':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daily Work Updates</CardTitle>
                <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Update
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Daily Update</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="update-date">Date</Label>
                        <Input
                          id="update-date"
                          type="date"
                          value={updateFormData.date}
                          onChange={(e) => setUpdateFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work-description">Work Description</Label>
                        <Textarea
                          id="work-description"
                          placeholder="Describe the work you did today..."
                          value={updateFormData.work_description}
                          onChange={(e) => setUpdateFormData(prev => ({ ...prev, work_description: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hours-spent">Hours Spent</Label>
                        <Input
                          id="hours-spent"
                          type="number"
                          min="0.5"
                          step="0.5"
                          placeholder="e.g., 8"
                          value={updateFormData.hours_spent}
                          onChange={(e) => setUpdateFormData(prev => ({ ...prev, hours_spent: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={updateFormData.status}
                          onValueChange={(value: 'pending' | 'in_progress' | 'completed') => 
                            setUpdateFormData(prev => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveDailyUpdate} disabled={savingUpdate}>
                          {savingUpdate ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {dailyUpdates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S. No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Work Description</TableHead>
                      <TableHead>Hours Spent</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyUpdates.map((update, index) => (
                      <TableRow key={update.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{new Date(update.date).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-md">
                          <p className="truncate">{update.work_description}</p>
                        </TableCell>
                        <TableCell>{update.hours_spent} hrs</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            update.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : update.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {update.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No daily updates found. Click "Update" to add your first entry.
                </p>
              )}
            </CardContent>
          </Card>
        );

      case 'complaint':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Complaints</CardTitle>
                <Dialog open={showComplaintModal} onOpenChange={setShowComplaintModal}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Complaint
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Complaint</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="complaint-date">Date</Label>
                        <Input
                          id="complaint-date"
                          type="date"
                          value={complaintFormData.date}
                          onChange={(e) => setComplaintFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaint-to">Complaint To</Label>
                        <Select
                          value={complaintFormData.complaint_to}
                          onValueChange={(value) => setComplaintFormData(prev => ({ ...prev, complaint_to: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaint-text">Complaint</Label>
                        <Textarea
                          id="complaint-text"
                          placeholder="Describe your complaint..."
                          value={complaintFormData.complaint_text}
                          onChange={(e) => setComplaintFormData(prev => ({ ...prev, complaint_text: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowComplaintModal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveComplaint} disabled={savingComplaint}>
                          {savingComplaint ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {complaints.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S. No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Complaint To</TableHead>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reply</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint, index) => (
                      <TableRow key={complaint.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{complaint.date}</TableCell>
                        <TableCell>
                          {employees.find(e => e.id === complaint.complaint_to)?.full_name || 'Unknown'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{complaint.complaint_text}</TableCell>
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
                        <TableCell className="max-w-xs truncate">
                          {complaint.reply || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No complaints found. Click "Add Complaint" to submit one.
                </p>
              )}
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                {activeSection === 'chat-box' && 'Chat with instructors and peers'}
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Trainee Portal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-primary text-primary-foreground py-6 px-6 shadow-medium">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-foreground/20">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{traineeData?.full_name || 'Trainee Portal'}</h1>
                  <p className="text-sm opacity-90">{courseData?.name || 'Dashboard & Learning'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            {menuItems.find(item => item.id === activeSection)?.label}
          </h2>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
