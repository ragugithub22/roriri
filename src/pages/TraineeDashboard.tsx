import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
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
}

interface CourseData {
  id: string;
  name: string;
  course_code: string;
  description: string;
  duration_weeks: number;
  fees: number;
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

export default function TraineeDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [traineeData, setTraineeData] = useState<TraineeData | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [syllabus, setSyllabus] = useState<Record<string, SyllabusData[]>>({});
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

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
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                      {traineeData?.full_name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-xl font-bold">{traineeData?.full_name}</h2>
                  <p className="text-muted-foreground">{traineeData?.student_code}</p>
                  {courseData && (
                    <p className="text-sm text-primary mt-1">{courseData.name}</p>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {traineeData?.email || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {traineeData?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{traineeData?.date_of_birth || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{traineeData?.address || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Enrollment Date</p>
                    <p className="font-medium">{traineeData?.enrollment_date || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Residence Type</p>
                    <p className="font-medium capitalize">{traineeData?.residence_type || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{traineeData?.status || 'Active'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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

      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                {activeSection === 'daily-update' && 'View your daily work updates'}
                {activeSection === 'complaint' && 'View your complaints'}
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
