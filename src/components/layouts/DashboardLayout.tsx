import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LucideIcon, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DashboardLayoutProps {
  children: ReactNode;
  entityName: string;
  entityIcon: LucideIcon;
  entityColor: string;
}

const DashboardLayout = ({ 
  children, 
  entityName, 
  entityIcon: Icon, 
  entityColor 
}: DashboardLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`bg-gradient-to-r ${entityColor} text-white py-6 px-6 shadow-medium`}>
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{entityName}</h1>
                  <p className="text-sm opacity-90">Dashboard & Analytics</p>
                </div>
              </div>
            </div>

            <Button 
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <Home className="mr-2 h-4 w-4" />
              All Entities
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl py-8 px-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
