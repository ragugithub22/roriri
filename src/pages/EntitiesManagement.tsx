import { Building2, GraduationCap, Heart, Sprout, Briefcase, ShoppingCart, Factory, Laptop, Plane, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EntityCard from "@/components/dashboard/EntityCard";
import { useNavigate } from "react-router-dom";

export default function EntitiesManagement() {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Entities Management</h1>
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-3">Integrated Business Units</h2>
            <p className="text-muted-foreground text-lg">
              Ten specialized divisions working in harmony through shared infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entities.map((entity, index) => (
              <div 
                key={entity.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <EntityCard {...entity} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
