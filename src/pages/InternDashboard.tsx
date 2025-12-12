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
  FileText, 
  Calendar, 
  AlertCircle, 
  MessageCircle,
  LogOut,
  Users,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface InternData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  joining_date: string;
  mode: string;
  status: string;
  fees: number;
  duration_value: number;
  duration_unit: string;
  courses?: { name: string } | null;
}

export default function InternDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [internData, setInternData] = useState<InternData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternData();
  }, []);

  const fetchInternData = async () => {
    try {
      // Get original_id from userSession
      const userSession = localStorage.getItem('userSession');
      if (!userSession) {
        setLoading(false);
        return;
      }

      const sessionData = JSON.parse(userSession);
      const originalId = sessionData.originalId || sessionData.userId;

      // Fetch intern data from internship_candidates table
      const { data, error } = await supabase
        .from('internship_candidates')
        .select(`
          *,
          courses(name)
        `)
        .eq('id', originalId)
        .single();

      if (error) {
        console.error('Error fetching intern data:', error);
      } else {
        setInternData(data);
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
                  <CardTitle className="text-sm font-medium text-muted-foreground">Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{internData?.courses?.name || 'Not Assigned'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {internData?.duration_value && internData?.duration_unit 
                      ? `${internData.duration_value} ${internData.duration_unit}`
                      : 'N/A'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold capitalize">{internData?.status || 'Active'}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {internData?.name || 'Intern'}!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Welcome to your Intern Dashboard. Here you can view your internship details, 
                  submit daily updates, and communicate with your mentors and coordinators.
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
                      {internData?.name?.charAt(0) || 'I'}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-xl font-bold">{internData?.name}</h2>
                  <p className="text-muted-foreground capitalize">{internData?.mode || 'Intern'}</p>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {internData?.email || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {internData?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{internData?.gender || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {internData?.address || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="font-medium">{internData?.courses?.name || 'Not Assigned'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Joining Date</p>
                    <p className="font-medium">{internData?.joining_date || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {internData?.duration_value && internData?.duration_unit 
                        ? `${internData.duration_value} ${internData.duration_unit}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Mode</p>
                    <p className="font-medium capitalize">{internData?.mode || 'N/A'}</p>
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
                {activeSection === 'application' && 'Manage your internship applications'}
                {activeSection === 'daily-update' && 'Submit your daily work updates'}
                {activeSection === 'complaint' && 'Submit and track complaints'}
                {activeSection === 'chat-box' && 'Chat with mentors and coordinators'}
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
          <h1 className="text-xl font-bold text-foreground">Intern Portal</h1>
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
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{internData?.name || 'Intern Portal'}</h1>
                  <p className="text-sm opacity-90">{internData?.courses?.name || 'Dashboard & Learning Experience'}</p>
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
