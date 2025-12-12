import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
const authSchema = z.object({
  email: z.string().trim().min(1, {
    message: "Email or username is required"
  }).max(255),
  password: z.string().min(1, {
    message: "Password is required"
  }).max(100),
  fullName: z.string().trim().min(2).max(100).optional()
});
export default function Auth() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // First check if this is the super admin by email or username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', user.id)
        .single();
      
      if (profile && (profile.username === 'admin' || profile.email === 'admin@roririsoft.com')) {
        return true;
      }
      
      // Otherwise check role-based admin status
      const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });
      if (error) return false;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user || isAdminLoading || typeof isAdmin === "undefined") {
      return;
    }

    if (user) {
      // Redirect Admin users to IT Park, regular users to user dashboard
      if (isAdmin) {
        navigate('/it-park', {
          replace: true
        });
      } else {
        navigate('/user-dashboard', {
          replace: true
        });
      }
    }
  }, [user, isAdmin, navigate, isAdminLoading]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = authSchema.parse({
        email,
        password
      });
      setLoading(true);
      
      console.log('Attempting login with:', validated.email);

      // Verify credentials using edge function
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-login', {
        body: {
          emailOrUsername: validated.email,
          password: validated.password
        }
      });

      console.log('Verify login response:', { verifyData, verifyError });

      if (verifyError || !verifyData?.success) {
        toast.error('Invalid credentials');
        setLoading(false);
        return;
      }

      console.log('Login verified successfully, role:', verifyData.role);
      
      // Try to sign in with Supabase Auth using email and password
      // This creates a proper session for RLS policies to work
      if (verifyData.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: verifyData.email,
          password: validated.password
        });
        
        if (signInError) {
          console.log('Supabase Auth sign-in failed, using custom session:', signInError.message);
          // Fall back to custom session if Supabase Auth fails
          // This might happen if the user doesn't exist in auth.users
        } else {
          console.log('Supabase Auth sign-in successful');
        }
      }
      
      // Store session info (role-based routing info)
      localStorage.setItem('userSession', JSON.stringify({
        email: verifyData.email,
        role: verifyData.role,
        userId: verifyData.userId
      }));

      toast.success('Logged in successfully');
      
      // Route based on role from user_type in user_login table
      // Use window.location.href to force page reload so AuthContext can read localStorage
      switch (verifyData.role) {
        case 'super_admin':
        case 'admin':
          window.location.href = '/it-park';
          break;
        case 'trainee':
          window.location.href = '/trainee-dashboard';
          break;
        case 'employee':
          window.location.href = '/employee-dashboard';
          break;
        case 'intern':
          window.location.href = '/intern-dashboard';
          break;
        default:
          window.location.href = '/user-dashboard';
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('An error occurred during login');
        console.error('Login error:', error);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = authSchema.parse({
        email,
        password,
        fullName
      });
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      const {
        error
      } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: validated.fullName
          }
        }
      });
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please login instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created! Please check your email to confirm.');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('An error occurred during signup');
      }
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center auth-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary-foreground " />
            </div>
          </div>
          <CardTitle className="text-2xl">RORIRI ERP System</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email or Username</Label>
                  <Input id="login-email" type="text" placeholder="Enter email or username" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="your.email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
}