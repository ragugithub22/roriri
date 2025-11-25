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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Edit, Trash2, Eye, Upload, Image as ImageIcon } from "lucide-react";
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
  amount: number;
  created_at: string;
}

export default function IndustrialVisitVisitors() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      return data as Visitor[];
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("industrial_visit_visitors")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-visit-visitors"] });
      toast.success("Visitor record added successfully");
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add visitor record");
      console.error(error);
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
    } else {
      createMutation.mutate(formData);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('industrial-visit-slider')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('industrial-visit-slider')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('industrial_visit_slider_images')
        .insert([{ image_url: publicUrl }]);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["industrial-visit-slider"] });
      toast.success("Image uploaded successfully");
      setIsUploadOpen(false);
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploadingImage(false);
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
        <div>
          <h1 className="text-3xl font-bold">Industrial Visit Visitors</h1>
          <p className="text-muted-foreground mt-2">Manage upcoming and completed visits</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Slider Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Slider Image</DialogTitle>
                <DialogDescription>
                  Select an image to add to the slider
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && <p className="text-sm text-muted-foreground">Uploading...</p>}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen || !!editingVisitor} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) {
              setEditingVisitor(null);
              resetForm();
            }
          }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Add Visitor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVisitor ? "Edit" : "Add"} Visitor Record</DialogTitle>
              <DialogDescription>
                Enter the details for the industrial visit
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
                    setIsAddOpen(false);
                    setEditingVisitor(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVisitor ? "Update" : "Add"} Visitor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <VisitorTable data={filteredVisitors} />
    </div>
  );
}
