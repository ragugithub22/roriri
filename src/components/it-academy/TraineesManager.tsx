import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function TraineesManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<any>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: trainees = [] } = useQuery({
    queryKey: ["trainees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (traineeData: any) => {
      if (editingTrainee) {
        const { error } = await supabase
          .from("students")
          .update(traineeData)
          .eq("id", editingTrainee.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("students")
          .insert(traineeData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingTrainee ? "Trainee updated" : "Trainee registered");
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      setIsOpen(false);
      setEditingTrainee(null);
    },
    onError: () => {
      toast.error("Failed to save trainee");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Trainee deleted");
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
    },
    onError: () => {
      toast.error("Failed to delete trainee");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const traineeData = {
      student_code: formData.get("student_code"),
      full_name: formData.get("full_name"),
      gender: formData.get("gender"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      date_of_birth: formData.get("date_of_birth") || null,
      address: formData.get("address"),
      password: formData.get("password"),
      enrollment_date: formData.get("enrollment_date"),
      status: formData.get("status"),
    };
    saveMutation.mutate(traineeData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Trainees Management</CardTitle>
            <CardDescription>Manage trainee registrations and records</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTrainee(null)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Register Trainee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTrainee ? "Edit" : "Register"} Trainee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={editingTrainee?.full_name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select name="gender" defaultValue={editingTrainee?.gender || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingTrainee?.email}
                    />
                  </div>
                  <div>
                    <Label htmlFor="student_code">Username</Label>
                    <Input
                      id="student_code"
                      name="student_code"
                      defaultValue={editingTrainee?.student_code}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      defaultValue={editingTrainee?.date_of_birth}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={editingTrainee?.phone}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      defaultValue={editingTrainee?.password}
                      required={!editingTrainee}
                    />
                  </div>
                  <div>
                    <Label htmlFor="enrollment_date">Enrollment Date</Label>
                    <Input
                      id="enrollment_date"
                      name="enrollment_date"
                      type="date"
                      defaultValue={editingTrainee?.enrollment_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingTrainee?.status || "active"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={editingTrainee?.address}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingTrainee ? "Update" : "Register"} Trainee
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
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainees.map((trainee) => (
              <TableRow key={trainee.id}>
                <TableCell>{trainee.student_code}</TableCell>
                <TableCell>{trainee.full_name}</TableCell>
                <TableCell>{trainee.email || "-"}</TableCell>
                <TableCell>{trainee.phone || "-"}</TableCell>
                <TableCell>
                  <Badge variant={trainee.status === "active" ? "default" : "secondary"}>
                    {trainee.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/trainees/${trainee.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTrainee(trainee);
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(trainee.id)}
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
