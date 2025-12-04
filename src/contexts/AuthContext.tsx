import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface CustomUser {
  id: string;
  email: string;
  role: string;
  userId: string;
}

interface AuthContextType {
  user: User | CustomUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isCustomLogin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCustomLogin, setIsCustomLogin] = useState(false);

  useEffect(() => {
    // Check for custom login session first
    const customSession = localStorage.getItem('userSession');
    if (customSession) {
      try {
        const sessionData = JSON.parse(customSession);
        setUser(sessionData);
        setIsCustomLogin(true);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing custom session:', error);
        localStorage.removeItem('userSession');
      }
    }

    // Set up auth state listener for Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsCustomLogin(false);
        setLoading(false);
      }
    );

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setIsCustomLogin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear custom login session
    localStorage.removeItem('userSession');
    setUser(null);
    setIsCustomLogin(false);

    // Also sign out from Supabase if needed
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, isCustomLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
