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

      // Try to find user credentials across multiple tables
      let userEmail = null;
      let userPassword = null;

      // Check profiles table first
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, username, password')
        .or(`email.eq.${validated.email},username.eq.${validated.email}`)
        .maybeSingle();

      if (profile && profile.password === validated.password) {
        userEmail = profile.email;
        userPassword = profile.password;
      }

      // If not found, check students (trainees) table
      if (!userEmail) {
        const { data: student } = await supabase
          .from('students')
          .select('profile_id, profiles!inner(email, username, password)')
          .or(`profiles.email.eq.${validated.email},profiles.username.eq.${validated.email}`)
          .maybeSingle();

        if (student?.profiles && student.profiles.password === validated.password) {
          userEmail = student.profiles.email;
          userPassword = student.profiles.password;
        }
      }

      // If not found, check employees table
      if (!userEmail) {
        const { data: employee } = await supabase
          .from('employees')
          .select('profile_id, profiles!inner(email, username, password)')
          .or(`profiles.email.eq.${validated.email},profiles.username.eq.${validated.email}`)
          .maybeSingle();

        if (employee?.profiles && employee.profiles.password === validated.password) {
          userEmail = employee.profiles.email;
          userPassword = employee.profiles.password;
        }
      }

      // If not found, check internship_candidates table
      if (!userEmail) {
        const { data: intern } = await supabase
          .from('internship_candidates')
          .select('email, username, password')
          .or(`email.eq.${validated.email},username.eq.${validated.email}`)
          .maybeSingle();

        if (intern && intern.password === validated.password) {
          userEmail = intern.email;
          userPassword = intern.password;
        }
      }

      // If no matching credentials found
      if (!userEmail || !userPassword) {
        toast.error('Invalid credentials');
        setLoading(false);
        return;
      }

      // Authenticate with Supabase Auth using the found email
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
      });

      if (signInError) {
        toast.error('Login failed. Please contact administrator.');
        console.error('Sign in error:', signInError);
      } else {
        toast.success('Logged in successfully');
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