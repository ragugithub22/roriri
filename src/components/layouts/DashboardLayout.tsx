import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, ArrowLeft, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import roririLogo from "@/assets/roriri-round-logo.png";

interface DashboardLayoutProps {
  children: ReactNode;
  entityName: string;
  entityIcon: LucideIcon;
  entityColor: string;
}

export default function DashboardLayout({ 
  children, 
  entityName, 
  entityIcon: Icon, 
  entityColor 
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-6 px-6 shadow-md">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/it-park", { state: { showEntities: true } })}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <img src={roririLogo} alt="RORIRI Logo" className="h-10 w-10 rounded-full" />
                <div>
                  <h1 className="text-2xl font-bold">{entityName}</h1>
                  <p className="text-sm opacity-90">Dashboard & Analytics</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-white/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl py-8 px-6">
        {children}
      </main>
    </div>
  );
}
