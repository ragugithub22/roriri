import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EntityCardProps {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  stats: {
    primary: string;
    secondary: string;
    trend: string;
  };
}

const EntityCard = ({ id, name, icon: Icon, description, color, stats }: EntityCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/${id}`);
  };
  
  return (
    <Card 
      className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className={`h-2 bg-gradient-to-r ${color}`}></div>
      
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-soft`}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="secondary" className="text-xs font-semibold">
            {stats.trend}
          </Badge>
        </div>
        
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {name}
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-foreground">{stats.primary}</span>
          <span className="text-sm text-muted-foreground">{stats.secondary}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full group-hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Open Module
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default EntityCard;
