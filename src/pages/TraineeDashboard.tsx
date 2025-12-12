import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Phone
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

export default function TraineeDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [traineeData, setTraineeData] = useState<TraineeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTraineeData();
  }, []);

  const fetchTraineeData = async () => {
    try {
      // Get original_id from userSession
      const userSession = localStorage.getItem('userSession');
      if (!userSession) {
        setLoading(false);
        return;
      }

      const sessionData = JSON.parse(userSession);
      const originalId = sessionData.originalId || sessionData.userId;

      // Fetch trainee data from students table
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', originalId)
        .single();

      if (error) {
        console.error('Error fetching trainee data:', error);
      } else {
        setTraineeData(data as TraineeData);
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
      return <p className="text-muted-foreground">Loading...</p>;
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">Enrollment Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{traineeData?.enrollment_date || 'N/A'}</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {traineeData?.full_name || 'Trainee'}!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Welcome to your Trainee Dashboard. Here you can view your course details, 
                  subjects, submit daily updates, and communicate with your instructors.
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

      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                {activeSection === 'subject' && 'View your subjects and curriculum'}
                {activeSection === 'application' && 'Manage your applications'}
                {activeSection === 'daily-update' && 'Submit your daily work updates'}
                {activeSection === 'complaint' && 'Submit and track complaints'}
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
                  <p className="text-sm opacity-90">Dashboard & Learning</p>
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
