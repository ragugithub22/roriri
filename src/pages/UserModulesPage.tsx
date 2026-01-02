import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, GraduationCap, Building2, Briefcase, BookOpen } from "lucide-react";

const modules = [
  {
    id: "mou",
    name: "MOU",
    description: "Memorandum of Understanding management",
    icon: FileText,
    path: "/mou",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "internship",
    name: "Internship",
    description: "Internship program management",
    icon: GraduationCap,
    path: "/internship",
    color: "from-green-500 to-green-600",
  },
  {
    id: "industrial-visit",
    name: "Industrial Visit",
    description: "Industrial visit scheduling and management",
    icon: Building2,
    path: "/industrial-visit",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "placement",
    name: "Placement",
    description: "Placement and recruitment management",
    icon: Briefcase,
    path: "/consultancy",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "training",
    name: "Training",
    description: "Training programs and courses",
    icon: BookOpen,
    path: "/it-academy",
    color: "from-pink-500 to-pink-600",
  },
];

interface UserModulesPageProps {
  userId: string;
  onBack: () => void;
}

export default function UserModulesPage({ userId, onBack }: UserModulesPageProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">User Modules</h1>
          <p className="text-muted-foreground">Select a module to manage</p>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${module.color}`} />
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${module.color} text-white shadow-md`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => navigate(module.path)}
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
