import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const userSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
  role: z.string().min(1, "Role is required"),
});

export default function UsersRolesManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [editingRole, setEditingRole] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (rolesError) throw rolesError;
      if (!roles) return [];

      // Fetch profile data separately
      const userIds = roles.map(r => r.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]));
      return roles.map(role => ({
        ...role,
        profile: profilesMap.get(role.user_id)
      }));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async ({ fullName, email, phone, role }: { fullName: string; email: string; phone?: string; role: string }) => {
      // Call edge function to create user with admin privileges
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { fullName, email, phone, role }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("User created and role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role removed successfully");
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
    },
    onError: () => {
      toast.error("Failed to remove role");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ roleId, userId, fullName, email, phone, newRole }: { 
      roleId: string; 
      userId: string;
      fullName: string; 
      email: string; 
      phone?: string; 
      newRole: string 
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          full_name: fullName,
          email: email,
          phone: phone || null
        })
        .eq("id", userId);
      
      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: newRole as any })
        .eq("id", roleId);
      
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setIsEditOpen(false);
      setEditingRole(null);
      setSelectedRole("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setSelectedRole(role.role);
    setIsEditOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User & Role Management</CardTitle>
            <CardDescription>Manage user access and permissions</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User and Assign Role</DialogTitle>
                <DialogDescription>Enter user details and assign a role.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const fullName = formData.get("fullName") as string;
                  const email = formData.get("email") as string;
                  const phone = formData.get("phone") as string;
                  const role = selectedRole;

                  // Validate input
                  try {
                    userSchema.parse({ fullName, email, phone, role });
                    createUserMutation.mutate({ fullName, email, phone, role });
                  } catch (error) {
                    if (error instanceof z.ZodError) {
                      toast.error(error.errors[0].message);
                    }
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Enter full name"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="trainee">Trainee</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create User & Assign Role"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User and Role</DialogTitle>
                <DialogDescription>
                  Update user details and role assignment.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const fullName = formData.get("fullName") as string;
                  const email = formData.get("email") as string;
                  const phone = formData.get("phone") as string;
                  const role = selectedRole;

                  // Validate input
                  try {
                    userSchema.parse({ fullName, email, phone, role });
                    if (editingRole) {
                      updateUserMutation.mutate({ 
                        roleId: editingRole.id,
                        userId: editingRole.user_id,
                        fullName, 
                        email, 
                        phone, 
                        newRole: role 
                      });
                    }
                  } catch (error) {
                    if (error instanceof z.ZodError) {
                      toast.error(error.errors[0].message);
                    }
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="edit-fullName">Full Name *</Label>
                  <Input
                    id="edit-fullName"
                    name="fullName"
                    placeholder="Enter full name"
                    defaultValue={editingRole?.profile?.full_name || ""}
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    defaultValue={editingRole?.profile?.email || ""}
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    defaultValue={editingRole?.profile?.phone || ""}
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="trainee">Trainee</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User & Role"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.map((role: any) => (
              <TableRow key={role.id}>
                <TableCell>{role.profile?.full_name || "Unknown"}</TableCell>
                <TableCell>{role.profile?.email || "-"}</TableCell>
                <TableCell>{role.profile?.phone || "-"}</TableCell>
                <TableCell>
                  <Badge>{role.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(role)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRoleMutation.mutate(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
