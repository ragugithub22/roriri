import { Building2, GraduationCap, Heart, Sprout, Briefcase, ShoppingCart, Factory, Laptop, Plane, ArrowRight, BarChart3, Users, TrendingUp, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EntityCard from "@/components/dashboard/EntityCard";
import StatsOverview from "@/components/dashboard/StatsOverview";
import EntityFlowDiagram from "@/components/dashboard/EntityFlowDiagram";
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

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const entities = [{
    id: "academy",
    name: "RORIRI Academy",
    icon: GraduationCap,
    description: "Education & Sports Management",
    color: "from-blue-500 to-cyan-500",
    stats: {
      primary: "2,450",
      secondary: "Students",
      trend: "+12%"
    }
  }, {
    id: "it-academy",
    name: "RORIRI IT Academy",
    icon: Laptop,
    description: "IT Training & Certification",
    color: "from-blue-600 to-indigo-600",
    stats: {
      primary: "7",
      secondary: "IT Courses",
      trend: "+20%"
    }
  }, {
    id: "foundation",
    name: "RORIRI Foundation",
    icon: Heart,
    description: "Social Development & Charity",
    color: "from-pink-500 to-rose-500",
    stats: {
      primary: "156",
      secondary: "Projects",
      trend: "+8%"
    }
  }, {
    id: "farm",
    name: "Rithish Farms",
    icon: Sprout,
    description: "Agriculture & Livestock",
    color: "from-green-500 to-emerald-500",
    stats: {
      primary: "850",
      secondary: "Acres",
      trend: "+15%"
    }
  }, {
    id: "consultancy",
    name: "RIYA Consultancy",
    icon: Briefcase,
    description: "Professional Services",
    color: "from-purple-500 to-violet-500",
    stats: {
      primary: "89",
      secondary: "Clients",
      trend: "+22%"
    }
  }, {
    id: "trading",
    name: "ROSHAN Traders",
    icon: ShoppingCart,
    description: "Retail & Wholesale",
    color: "from-orange-500 to-amber-500",
    stats: {
      primary: "₹45.2M",
      secondary: "Revenue",
      trend: "+18%"
    }
  }, {
    id: "automation",
    name: "RORIRI Automation",
    icon: Factory,
    description: "Manufacturing & Industry",
    color: "from-slate-500 to-zinc-500",
    stats: {
      primary: "12K",
      secondary: "Units/Mo",
      trend: "+9%"
    }
  }, {
    id: "it",
    name: "RORIRI IT Company",
    icon: Laptop,
    description: "Technology & Software",
    color: "from-indigo-500 to-blue-500",
    stats: {
      primary: "34",
      secondary: "Projects",
      trend: "+25%"
    }
  }, {
    id: "tours-travels",
    name: "Rithish Tours and Travels",
    icon: Plane,
    description: "Travel & Tourism Services",
    color: "from-sky-400 to-blue-600",
    stats: {
      primary: "523",
      secondary: "Bookings",
      trend: "+16%"
    }
  }, {
    id: "builders",
    name: "Roshan Builders",
    icon: Building2,
    description: "Construction & Real Estate",
    color: "from-amber-400 to-orange-600",
    stats: {
      primary: "28",
      secondary: "Projects",
      trend: "+14%"
    }
  }];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">RORIRI ERP</h1>
          </div>
          <nav className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="ghost" onClick={() => navigate("/admin")}>
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout}>
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