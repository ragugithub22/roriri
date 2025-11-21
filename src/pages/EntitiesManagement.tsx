import { useState } from "react";
import {
  Building2,
  GraduationCap,
  Heart,
  Sprout,
  Briefcase,
  ShoppingCart,
  Factory,
  Laptop,
  Plane,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EntityCard from "@/components/dashboard/EntityCard";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function EntitiesManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    icon: "Building2",
    color: "#3b82f6",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("entities").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      toast({ title: "Entity created successfully" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: "Error creating entity", description: error.message, variant: "destructive" });
    },
  });

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      name: "",
      code: "",
      description: "",
      icon: "Building2",
      color: "#3b82f6",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const entities = [
    {
      id: "it-academy",
      name: "RORIRI IT Academy",
      icon: Laptop,
      description: "IT Training & Certification",
      color: "from-blue-600 to-indigo-600",
      stats: {
        primary: "7",
        secondary: "IT Courses",
        trend: "+20%",
      },
    },
    {
      id: "it",
      name: "RORIRI Software Solution",
      icon: Laptop,
      description: "Technology & Software",
      color: "from-indigo-500 to-blue-500",
      stats: {
        primary: "34",
        secondary: "Projects",
        trend: "+25%",
      },
    },
    {
      id: "foundation",
      name: "RORIRI Foundation",
      icon: Heart,
      description: "Social Development & Charity",
      color: "from-pink-500 to-rose-500",
      stats: {
        primary: "156",
        secondary: "Projects",
        trend: "+8%",
      },
    },
    {
      id: "farm",
      name: "Rithish Farms",
      icon: Sprout,
      description: "Agriculture & Livestock",
      color: "from-green-500 to-emerald-500",
      stats: {
        primary: "850",
        secondary: "Acres",
        trend: "+15%",
      },
    },
    {
      id: "consultancy",
      name: "RIYA Consultancy",
      icon: Briefcase,
      description: "Professional Services",
      color: "from-purple-500 to-violet-500",
      stats: {
        primary: "89",
        secondary: "Clients",
        trend: "+22%",
      },
    },
    {
      id: "trading",
      name: "ROSHAN Traders",
      icon: ShoppingCart,
      description: "Retail & Wholesale",
      color: "from-orange-500 to-amber-500",
      stats: {
        primary: "₹45.2M",
        secondary: "Revenue",
        trend: "+18%",
      },
    },
    {
      id: "automation",
      name: "RORIRI Automation",
      icon: Factory,
      description: "Manufacturing & Industry",
      color: "from-slate-500 to-zinc-500",
      stats: {
        primary: "12K",
        secondary: "Units/Mo",
        trend: "+9%",
      },
    },
    {
      id: "tours-travels",
      name: "Rithish Tours and Travels",
      icon: Plane,
      description: "Travel & Tourism Services",
      color: "from-sky-400 to-blue-600",
      stats: {
        primary: "523",
        secondary: "Bookings",
        trend: "+16%",
      },
    },
    {
      id: "builders",
      name: "Roshan Builders",
      icon: Building2,
      description: "Construction & Real Estate",
      color: "from-amber-400 to-orange-600",
      stats: {
        primary: "28",
        secondary: "Projects",
        trend: "+14%",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Entities Management</h1>
            </div>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entity
          </Button>
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
              <div key={entity.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <EntityCard {...entity} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Entity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Entity Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="code">Entity Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., it_company"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Building2">Building</SelectItem>
                    <SelectItem value="GraduationCap">Education</SelectItem>
                    <SelectItem value="Heart">Foundation</SelectItem>
                    <SelectItem value="Sprout">Agriculture</SelectItem>
                    <SelectItem value="Briefcase">Consultancy</SelectItem>
                    <SelectItem value="ShoppingCart">Trading</SelectItem>
                    <SelectItem value="Factory">Automation</SelectItem>
                    <SelectItem value="Laptop">IT</SelectItem>
                    <SelectItem value="Plane">Travel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
