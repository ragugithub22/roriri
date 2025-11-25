import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface IndustrialVisitEnquiry {
  id: string;
  college_name: string;
  phone: string;
  email: string;
  date: string;
  description: string | null;
}

const IndustrialVisitEnquiry = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    college_name: "",
    phone: "",
    email: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  // Fetch enquiries
  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ["industrial-visit-enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_enquiries")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as IndustrialVisitEnquiry[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("industrial_visit_enquiries")
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-visit-enquiries"] });
      toast.success("Enquiry added successfully");
      resetForm();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to add enquiry: " + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("industrial_visit_enquiries")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-visit-enquiries"] });
      toast.success("Enquiry updated successfully");
      resetForm();
      setIsOpen(false);
      setEditingId(null);
    },
    onError: (error) => {
      toast.error("Failed to update enquiry: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("industrial_visit_enquiries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-visit-enquiries"] });
      toast.success("Enquiry deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete enquiry: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      college_name: "",
      phone: "",
      email: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (enquiry: IndustrialVisitEnquiry) => {
    setFormData({
      college_name: enquiry.college_name,
      phone: enquiry.phone,
      email: enquiry.email,
      date: enquiry.date,
      description: enquiry.description || "",
    });
    setEditingId(enquiry.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this enquiry?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Industrial Visit Enquiry</h1>
          <p className="text-muted-foreground mt-1">
            Manage industrial visit enquiries and requests
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Enquiry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Enquiry" : "Add New Enquiry"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for the industrial visit enquiry
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="college_name">College Name *</Label>
                  <Input
                    id="college_name"
                    value={formData.college_name}
                    onChange={(e) =>
                      setFormData({ ...formData, college_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? "Update" : "Add"} Enquiry
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">S. No</TableHead>
              <TableHead>College Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No enquiries found. Add your first enquiry to get started.
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((enquiry, index) => (
                <TableRow key={enquiry.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{enquiry.college_name}</TableCell>
                  <TableCell>{enquiry.phone}</TableCell>
                  <TableCell>{enquiry.email}</TableCell>
                  <TableCell>
                    {format(new Date(enquiry.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {enquiry.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(enquiry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(enquiry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IndustrialVisitEnquiry;
