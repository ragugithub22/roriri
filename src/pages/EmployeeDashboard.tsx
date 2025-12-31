import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmployeeProjectDetails from '@/components/employee/EmployeeProjectDetails';
import { 
  LayoutDashboard, 
  User, 
  FolderKanban, 
  Wallet, 
  Calendar, 
  AlertCircle, 
  MessageCircle,
  LogOut,
  Briefcase,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface EmployeeData {
  id: string;
  employee_code: string;
  hire_date: string;
  status: string;
  residence_type: string;
  profile_id: string;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    dob: string;
    username: string;
    password: string;
  } | null;
  departments?: { name: string } | null;
  positions?: { title: string } | null;
  user_role?: string | null;
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      // Get original_id from userSession
      const userSession = localStorage.getItem('userSession');
      if (!userSession) {
        setLoading(false);
        return;
      }

      const sessionData = JSON.parse(userSession);
      const originalId = sessionData.originalId || sessionData.userId;

      // Fetch employee data
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          profiles(full_name, email, phone, address, dob, username, password),
          departments(name),
          positions(title)
        `)
        .eq('profile_id', originalId)
        .single();

      if (error) {
        console.error('Error fetching employee data:', error);
      } else {
        // Fetch user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', originalId)
          .maybeSingle();

        setEmployeeData({ ...data, user_role: roleData?.role || null });
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
    { id: 'project-details', label: 'Project Details', icon: FolderKanban },
    { id: 'payroll', label: 'Payroll', icon: Wallet },
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{employeeData?.departments?.name || 'Not Assigned'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{employeeData?.positions?.title || 'Not Assigned'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Residence Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold capitalize">{employeeData?.residence_type || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {employeeData?.profiles?.full_name || 'Employee'}!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Welcome to your Employee Dashboard. Here you can view your projects, 
                  payroll details, submit daily updates, and communicate with your team.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'profile':
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
                        {employeeData?.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold text-center">{employeeData?.profiles?.full_name}</h2>
                    {employeeData?.user_role && (
                      <span className="mt-2 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full capitalize">
                        {employeeData?.user_role}
                      </span>
                    )}
                  </div>

                  {/* Right side - Details Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Full Name</p>
                      <p className="font-medium">{employeeData?.profiles?.full_name || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Employee Code</p>
                      <p className="font-medium">{employeeData?.employee_code || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Email</p>
                      <p className="font-medium">{employeeData?.profiles?.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Phone</p>
                      <p className="font-medium">{employeeData?.profiles?.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Date of Birth</p>
                      <p className="font-medium">{employeeData?.profiles?.dob || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Address</p>
                      <p className="font-medium">{employeeData?.profiles?.address || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Department</p>
                      <p className="font-medium">{employeeData?.departments?.name || 'Not Assigned'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Position</p>
                      <p className="font-medium capitalize">{employeeData?.user_role || 'Not Assigned'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Hire Date</p>
                      <p className="font-medium">{employeeData?.hire_date || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Residence Type</p>
                      <p className="font-medium capitalize">{employeeData?.residence_type || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Username</p>
                      <p className="font-medium">{employeeData?.profiles?.username || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-primary">Password</p>
                      <p className="font-medium">{employeeData?.profiles?.password || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'project-details':
        return employeeData?.id ? (
          <EmployeeProjectDetails employeeId={employeeData.id} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Unable to load projects. Employee data not found.</p>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                {activeSection === 'payroll' && 'View your salary and payment details'}
                {activeSection === 'daily-update' && 'Submit your daily work updates'}
                {activeSection === 'complaint' && 'Submit and track complaints'}
                {activeSection === 'chat-box' && 'Chat with colleagues and managers'}
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
          <h1 className="text-xl font-bold text-foreground">Employee Portal</h1>
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
                  <Briefcase className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{employeeData?.profiles?.full_name || 'Employee Portal'}</h1>
                  <p className="text-sm opacity-90">{employeeData?.positions?.title || 'Dashboard & Work Management'}</p>
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
