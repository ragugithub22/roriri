import { Building2, GraduationCap, Heart, Sprout, Briefcase, ShoppingCart, Factory, Laptop, Plane, ArrowRight, BarChart3, Users, TrendingUp, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EntityCard from "@/components/dashboard/EntityCard";
import StatsOverview from "@/components/dashboard/StatsOverview";
import EntityFlowDiagram from "@/components/dashboard/EntityFlowDiagram";
import DailyUpdateCard from "@/components/dashboard/DailyUpdateCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });
      if (error) return false;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch entities from database
  const { data: dbEntities } = useQuery({
    queryKey: ['entities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch employees count
  const { data: employeesCount } = useQuery({
    queryKey: ['employees-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch departments count
  const { data: departmentsCount } = useQuery({
    queryKey: ['departments-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // Map icon names to components
  const iconMap: Record<string, any> = {
    GraduationCap,
    Heart,
    Sprout,
    Briefcase,
    ShoppingCart,
    Factory,
    Laptop,
    Plane,
    Building2,
  };

  const entities = dbEntities?.map(entity => ({
    id: entity.id,
    name: entity.name,
    icon: iconMap[entity.icon] || Building2,
    description: entity.description || '',
    color: `from-${entity.color}-400 to-${entity.color}-600`,
    stats: {
      primary: entity.code === 'it_academy' ? '7' : '—',
      secondary: 'Active',
      trend: '—'
    }
  })) || [];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">RORIRI ERP</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/roles")}>
              Roles
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/departments")}>
              Department
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/employees")}>
              Employees
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/mou")}>
              MOU
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/hostel")}>
              Hostel
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/asset-management")}>
              Asset Management
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/entities")}>
              Entities
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-6 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <Building2 className="h-12 w-12" />
            <h1 className="text-5xl font-bold">RORIRI ERP</h1>
          </div>
          
          <p className="text-2xl font-medium mb-4 animate-fade-in" style={{
          animationDelay: "0.1s"
        }}>
            One Roof, Many Missions
          </p>
          
          <p className="text-lg opacity-90 max-w-3xl mb-8 animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
            A unified digital ecosystem connecting education, agriculture, social development, business, and technology — 
            enabling RORIRI to drive rural empowerment, innovation, and sustainable growth through a single intelligent platform.
          </p>
          
          <div className="flex gap-4 animate-fade-in" style={{
          animationDelay: "0.3s"
        }}>
            <Button size="lg" variant="secondary" className="shadow-medium">
              Explore Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 hover:bg-white/10 text-stone-200">View Architectures</Button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-12 px-6 border-b">
        <div className="container mx-auto max-w-7xl">
          <StatsOverview />
        </div>
      </section>

      {/* Daily Update Card */}
      <section className="py-12 px-6 border-b bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <DailyUpdateCard />
        </div>
      </section>

      {/* Entity Cards Grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-3">Integrated Business Units</h2>
            <p className="text-muted-foreground text-lg">
              Ten specialized divisions working in harmony through shared infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entities.map((entity, index) => <div key={entity.id} className="animate-fade-in" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <EntityCard {...entity} />
              </div>)}
          </div>
        </div>
      </section>

      {/* Entity Flow Diagram */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-3">Entity Integration Flow</h2>
            <p className="text-muted-foreground text-lg">
              Visualizing cross-functional data flow and collaboration pathways
            </p>
          </div>
          
          <EntityFlowDiagram />
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-3">Platform Capabilities</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enterprise-grade features designed for scalability and operational excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Smart Analytics</CardTitle>
                <CardDescription>
                  AI-powered insights across all business units with predictive modeling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Unified Access Control</CardTitle>
                <CardDescription>
                  Single Sign-On with granular role-based permissions across entities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Cross-Entity Operations</CardTitle>
                <CardDescription>
                  Seamless data flow between divisions for synchronized workflows
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 bg-muted/20">
        <div className="container mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>© 2025 RORIRI ERP. All rights reserved. | Empowering rural transformation through digital innovation.</p>
        </div>
      </footer>
    </div>;
};
export default Index;