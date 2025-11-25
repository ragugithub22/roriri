import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, FileText, DollarSign } from "lucide-react";

interface IndustrialVisitProps {
  onNavigate?: (path: string) => void;
}

const IndustrialVisit = ({ onNavigate }: IndustrialVisitProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const cards = [
    {
      id: "enquiry",
      title: "Enquiry",
      description: "Manage industrial visit enquiries and requests",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      path: "/industrial-visit/enquiry"
    },
    {
      id: "visitors",
      title: "Visitors",
      description: "Track and manage industrial visit visitors",
      icon: Users,
      color: "from-green-500 to-green-600",
      path: "/industrial-visit/visitors"
    },
    {
      id: "payment-report",
      title: "Payment Report",
      description: "View payment reports for industrial visits",
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      path: "/industrial-visit/payment-report"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Industrial Visit</h1>
        <p className="text-muted-foreground mt-2">
          Manage industrial visits, enquiries, visitors, and payments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleCardClick(card.path)}
                  className="w-full"
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
};

export default IndustrialVisit;
