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
    // Set up auth state listener for Supabase auth FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          // Supabase auth takes priority - merge with custom session data for role
          const customSession = localStorage.getItem('userSession');
          let customUser: CustomUser | null = null;
          if (customSession) {
            try {
              customUser = JSON.parse(customSession);
            } catch (error) {
              console.error('Error parsing custom session:', error);
            }
          }
          
          // Create a merged user object with Supabase user ID and custom role
          setUser({
            ...session.user,
            id: session.user.id,
            role: customUser?.role || 'user',
          } as any);
          setSession(session);
          setIsCustomLogin(false);
          setLoading(false);
        } else {
          // No Supabase session - check for custom login session
          const customSession = localStorage.getItem('userSession');
          if (customSession) {
            try {
              const sessionData = JSON.parse(customSession);
              setUser({ ...sessionData, id: sessionData.userId });
              setIsCustomLogin(true);
            } catch (error) {
              console.error('Error parsing custom session:', error);
              localStorage.removeItem('userSession');
            }
          } else {
            setUser(null);
            setIsCustomLogin(false);
          }
          setSession(null);
          setLoading(false);
        }
      }
    );

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const customSession = localStorage.getItem('userSession');
        let customUser: CustomUser | null = null;
        if (customSession) {
          try {
            customUser = JSON.parse(customSession);
          } catch (error) {
            console.error('Error parsing custom session:', error);
          }
        }
        
        setSession(session);
        setUser({
          ...session.user,
          id: session.user.id,
          role: customUser?.role || 'user',
        } as any);
        setIsCustomLogin(false);
      } else {
        // No Supabase session - check for custom session
        const customSession = localStorage.getItem('userSession');
        if (customSession) {
          try {
            const sessionData = JSON.parse(customSession);
            setUser({ ...sessionData, id: sessionData.userId });
            setIsCustomLogin(true);
          } catch (error) {
            console.error('Error parsing custom session:', error);
            localStorage.removeItem('userSession');
          }
        }
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
