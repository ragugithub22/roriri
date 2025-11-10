import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataTable, Badge } from '@/components/dashboard/DataTable';
import { Building2, ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function DepartmentList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments-with-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          entities:entity_id (name, color),
          employees:employees(count)
        `)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('departments').insert([{
        name: data.name.trim(),
        entity_id: null
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-with-counts'] });
      toast({ title: 'Department created successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error creating department', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase
        .from('departments')
        .update({ name: data.name.trim() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-with-counts'] });
      toast({ title: 'Department updated successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error updating department', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-with-counts'] });
      toast({ title: 'Department deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting department', description: error.message, variant: 'destructive' });
    },
  });

  const handleOpenDialog = (department?: any) => {
    if (department) {
      setFormData({
        name: department.name || '',
      });
      setEditingDepartment(department);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDepartment(null);
    setFormData({
      name: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate department name
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      toast({ 
        title: 'Validation error', 
        description: 'Department name cannot be empty',
        variant: 'destructive' 
      });
      return;
    }

    if (trimmedName.length > 100) {
      toast({ 
        title: 'Validation error', 
        description: 'Department name must be less than 100 characters',
        variant: 'destructive' 
      });
      return;
    }

    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, name: trimmedName });
    } else {
      createMutation.mutate({ name: trimmedName });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Department Name',
    },
    {
      key: 'entity',
      label: 'Entity',
      render: (_: any, row: any) => (
        <Badge style={{ backgroundColor: row.entities?.color }}>
          {row.entities?.name || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'employee_count',
      label: 'Employees',
      render: (_: any, row: any) => row.employees?.[0]?.count || 0,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenDialog(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Are you sure you want to delete this department?')) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

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
              <h1 className="text-xl font-bold">Department Management</h1>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </header>

      <section className="py-8 px-6">
        <div className="container mx-auto max-w-7xl">
          <DataTable
            title="Department Directory"
            description={`Showing ${departments?.length || 0} departments`}
            columns={columns}
            data={departments || []}
            emptyMessage={isLoading ? "Loading departments..." : "No departments found"}
          />
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter department name"
                  maxLength={100}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.name.length}/100 characters
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingDepartment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
