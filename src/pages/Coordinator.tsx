import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Coordinator {
  id: string;
  category_name: string;
  coordinator_name: string;
  description: string | null;
  created_at: string;
}

const Coordinator = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category_name: "",
    coordinator_name: "",
    description: "",
  });

  // Fetch IT Company entity
  const { data: itCompanyEntity } = useQuery({
    queryKey: ['it-company-entity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('id')
        .eq('code', 'it_company')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch coordinators
  const { data: coordinators, isLoading } = useQuery({
    queryKey: ['coordinators'],
    queryFn: async () => {
      if (!itCompanyEntity?.id) return [];
      
      const { data, error } = await supabase
        .from('coordinators')
        .select('*')
        .eq('entity_id', itCompanyEntity.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coordinator[];
    },
    enabled: !!itCompanyEntity?.id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!itCompanyEntity?.id) throw new Error("Entity not found");
      
      const { error } = await supabase
        .from('coordinators')
        .insert({
          ...data,
          entity_id: itCompanyEntity.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinators'] });
      toast.success("Coordinator added successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Failed to add coordinator: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('coordinators')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinators'] });
      toast.success("Coordinator updated successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(`Failed to update coordinator: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coordinators')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinators'] });
      toast.success("Coordinator deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete coordinator: ${error.message}`);
    },
  });

  const handleOpenDialog = (coordinator?: Coordinator) => {
    if (coordinator) {
      setEditingId(coordinator.id);
      setFormData({
        category_name: coordinator.category_name,
        coordinator_name: coordinator.coordinator_name,
        description: coordinator.description || "",
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      category_name: "",
      coordinator_name: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this coordinator?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Coordinators</CardTitle>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Coordinator
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : coordinators && coordinators.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S. No</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Coordinator Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coordinators.map((coordinator, index) => (
                  <TableRow key={coordinator.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{coordinator.category_name}</TableCell>
                    <TableCell>{coordinator.coordinator_name}</TableCell>
                    <TableCell>{coordinator.description || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(coordinator)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(coordinator.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No coordinators found.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Coordinator" : "Add Coordinator"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category_name">Category Name</Label>
                <Input
                  id="category_name"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordinator_name">Coordinator Name</Label>
                <Input
                  id="coordinator_name"
                  value={formData.coordinator_name}
                  onChange={(e) => setFormData({ ...formData, coordinator_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coordinator;
