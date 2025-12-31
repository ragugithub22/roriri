import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Visitor {
  id: string;
  college_name: string;
  date: string;
  department: string;
  amount?: number;
  created_at: string;
}

interface IndustrialVisitVisitorsProps {
  onNavigate?: (path: string) => void;
}

export default function IndustrialVisitVisitors({ onNavigate }: IndustrialVisitVisitorsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    college_name: "",
    date: "",
    department: "",
    amount: 0,
  });

  const { data: visitors = [] } = useQuery({
    queryKey: ["industrial-visit-visitors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_visitors")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) throw error;
      // Map to include amount field with default value
      return (data || []).map(item => ({
        ...item,
        amount: (item as any).amount || 0
      })) as Visitor[];
    },
  });

  const { data: sliderImages = [] } = useQuery({
    queryKey: ["industrial-visit-slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_slider_images")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });


  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("industrial_visit_visitors")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-visit-visitors"] });
      toast.success("Visitor record updated successfully");
      setEditingVisitor(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update visitor record");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("industrial_visit_visitors")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-visit-visitors"] });
      toast.success("Visitor record deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete visitor record");
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      college_name: "",
      date: "",
      department: "",
      amount: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVisitor) {
      updateMutation.mutate({ id: editingVisitor.id, data: formData });
    }
  };

  const handleEdit = (visitor: Visitor) => {
    setEditingVisitor(visitor);
    setFormData({
      college_name: visitor.college_name,
      date: visitor.date,
      department: visitor.department,
      amount: visitor.amount,
    });
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("/industrial-visit");
    }
  };

  const filteredVisitors = visitors.filter((visitor) =>
    visitor.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const VisitorTable = ({ data }: { data: Visitor[] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Search:</span>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S. No</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>College Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              data.map((visitor, index) => {
                const registrationUrl = `${window.location.origin}/industrial-visit-registration/${visitor.id}`;
                return (
                  <TableRow key={visitor.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="p-2 bg-white rounded">
                        <QRCodeSVG value={registrationUrl} size={64} />
                      </div>
                    </TableCell>
                    <TableCell>{visitor.college_name}</TableCell>
                    <TableCell>{new Date(visitor.date).toLocaleDateString()}</TableCell>
                    <TableCell>{visitor.department}</TableCell>
                    <TableCell>₹{visitor.amount}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/industrial-visit-visitor-details/${visitor.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(visitor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(visitor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing 0 to {data.length} of {data.length} entries</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Prev</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {sliderImages.length > 0 && (
        <div className="mb-8">
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 3000 })]}
            className="w-full"
          >
            <CarouselContent>
              {sliderImages.map((image) => (
                <CarouselItem key={image.id}>
                  <div className="aspect-[21/9] relative rounded-lg overflow-hidden">
                    <img
                      src={image.image_url}
                      alt="Industrial visit"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Industrial Visit Visitors</h1>
            <p className="text-muted-foreground mt-2">Manage upcoming and completed visits</p>
          </div>
        </div>
        <Dialog open={editingVisitor !== null} onOpenChange={(open) => {
          if (!open) {
            setEditingVisitor(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Visitor Record</DialogTitle>
              <DialogDescription>
                Update the details for the industrial visit
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="college_name">College Name *</Label>
                  <Input
                    id="college_name"
                    value={formData.college_name}
                    onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingVisitor(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Visitor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <VisitorTable data={filteredVisitors} />
    </div>
  );
}
