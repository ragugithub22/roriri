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

interface Visitor {
  id: string;
  full_name: string;
  mobile: string;
  email: string | null;
  visitor_type: string;
  purpose_of_visit: string;
  whom_to_see: string | null;
  created_at: string;
  updated_at: string;
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
    full_name: "",
    mobile: "",
    email: "",
    visitor_type: "",
    purpose_of_visit: "",
  });

  const { data: visitors = [] } = useQuery({
    queryKey: ["industrial-visit-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_registrations")
        .select("*")
        .eq("visitor_type", "industrial_visit")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as Visitor[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("industrial_visit_registrations")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-visit-registrations"] });
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
        .from("industrial_visit_registrations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-visit-registrations"] });
      toast.success("Visitor record deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete visitor record");
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      mobile: "",
      email: "",
      visitor_type: "",
      purpose_of_visit: "",
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
      full_name: visitor.full_name,
      mobile: visitor.mobile,
      email: visitor.email || "",
      visitor_type: visitor.visitor_type,
      purpose_of_visit: visitor.purpose_of_visit,
    });
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("/industrial-visit");
    }
  };

  const filteredVisitors = visitors.filter((visitor) =>
    visitor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.purpose_of_visit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatVisitorType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No data available in table
                </TableCell>
              </TableRow>
            ) : (
              data.map((visitor, index) => (
                <TableRow key={visitor.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{new Date(visitor.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{visitor.full_name}</TableCell>
                  <TableCell>{visitor.mobile}</TableCell>
                  <TableCell>{visitor.email || "N/A"}</TableCell>
                  <TableCell>{visitor.purpose_of_visit}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing {data.length > 0 ? 1 : 0} to {data.length} of {data.length} entries</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Prev</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
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
            <h1 className="text-3xl font-bold">Industrial Visit</h1>
            <p className="text-muted-foreground mt-2">Manage industrial visit registrations</p>
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
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose_of_visit">Purpose of Visit *</Label>
                  <Input
                    id="purpose_of_visit"
                    value={formData.purpose_of_visit}
                    onChange={(e) => setFormData({ ...formData, purpose_of_visit: e.target.value })}
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
