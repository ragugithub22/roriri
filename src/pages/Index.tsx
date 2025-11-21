import { Building2, ArrowRight, BarChart3, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatsOverview from "@/components/dashboard/StatsOverview";
import EntityFlowDiagram from "@/components/dashboard/EntityFlowDiagram";
import DailyUpdateCard from "@/components/dashboard/DailyUpdateCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const handleLoginClick = async () => {
    if (user) {
      await signOut();
    }
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">RORIRI ERP</h1>
          </div>
          <Button onClick={handleLoginClick} className="bg-primary hover:bg-primary/90">
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden landing-hero py-20 px-6 text-white">

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <Building2 className="h-12 w-12" />
            <h1 className="text-5xl font-bold">RORIRI ERP</h1>
          </div>

          <p className="text-2xl font-medium mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            One Roof, Many Missions
          </p>

          <p className="text-lg opacity-90 max-w-3xl mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            A unified digital ecosystem connecting education, agriculture, social development, business, and technology — 
            enabling RORIRI to drive rural empowerment, innovation, and sustainable growth through a single intelligent platform.
          </p>

          <div className="flex gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              size="lg"
              variant="secondary"
              className="shadow-medium"
              onClick={handleLoginClick}
            >
              Login <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          <Button
  size="lg"
  className="bg-blue-600 hover:bg-blue-700 text-white border-none"
>
  View Architectures
</Button>


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
    </div>
  );
};

export default Index;

