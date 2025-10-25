import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type AppRole = 'admin' | 'manager' | 'staff' | 'viewer';

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('viewer');
  const [selectedEntityId, setSelectedEntityId] = useState('');

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: entities } = useQuery({
    queryKey: ['entities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id (full_name, email),
          entities:entity_id (name)
        `);
      if (error) throw error;
      return data;
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role, entityId }: { userId: string; role: AppRole; entityId?: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role, entity_id: entityId || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role assigned successfully');
      setIsDialogOpen(false);
      setSelectedUserId('');
      setSelectedRole('viewer');
      setSelectedEntityId('');
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate')) {
        toast.error('This user already has this role for this entity');
      } else {
        toast.error('Failed to assign role');
      }
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove role');
    },
  });

  const handleAddRole = () => {
    if (!selectedUserId || !selectedRole) {
      toast.error('Please select a user and role');
      return;
    }
    addRoleMutation.mutate({
      userId: selectedUserId,
      role: selectedRole,
      entityId: selectedEntityId || undefined,
    });
  };

  return (
    <DashboardLayout
      entityName="Admin Panel"
      entityIcon={Shield}
      entityColor="purple"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Role Management</h2>
            <p className="text-muted-foreground">Assign roles and entity access to users</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign User Role</DialogTitle>
                <DialogDescription>
                  Grant a user access to the system or specific entities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Entity (Optional)</Label>
                  <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="All entities (admin only)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All entities</SelectItem>
                      {entities?.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRole} disabled={addRoleMutation.isPending}>
                  {addRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Role Assignments</CardTitle>
            <CardDescription>Manage user permissions across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userRoles?.map((userRole: any) => (
                <div
                  key={userRole.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{userRole.profiles?.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {userRole.profiles?.email}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{userRole.role}</Badge>
                      {userRole.entities ? (
                        <Badge variant="secondary">{userRole.entities.name}</Badge>
                      ) : (
                        <Badge>All Entities</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRoleMutation.mutate(userRole.id)}
                    disabled={deleteRoleMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {(!userRoles || userRoles.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No role assignments yet. Click "Assign Role" to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
