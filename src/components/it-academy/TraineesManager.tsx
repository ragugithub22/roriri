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
import { UserPlus, Pencil, Trash2, Eye, Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface TraineesManagerProps {
  onViewTrainee?: (traineeId: string) => void;
  readOnly?: boolean;
}

export default function TraineesManager({ onViewTrainee, readOnly = false }: TraineesManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const getStringField = (formData: FormData, key: string) => {
    const val = formData.get(key);
    if (typeof val !== "string") return "";
    return val.trim();
  };

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

  const { data: employees = [] } = useQuery({
    queryKey: ["it-academy-trainers"],
    queryFn: async () => {
      // First get the IT Academy entity ID
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .single();

      if (!entity) return [];

      // Fetch only IT Academy employees
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          profiles:profile_id(
            full_name
          )
        `)
        .eq("entity_id", entity.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (traineeData: any) => {
      if (editingTrainee) {
        // Update the students table
        const { error } = await supabase
          .from("students")
          .update(traineeData)
          .eq("id", editingTrainee.id);
        if (error) throw error;

        // Find and update profile record by email (if exists)
        if (traineeData.email) {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", editingTrainee.email)
            .maybeSingle();

          if (existingProfile) {
            // Update existing profile
            const { error: profileError } = await supabase
              .from("profiles")
              .update({
                email: traineeData.email,
                username: traineeData.student_code,
                password: traineeData.password,
                full_name: traineeData.full_name,
                phone: traineeData.phone,
                dob: traineeData.date_of_birth,
              })
              .eq("id", existingProfile.id);
            if (profileError) throw profileError;

            // Update user_login table with correct user_type
            const { error: loginError } = await supabase
              .from("user_login")
              .update({
                email: traineeData.email,
                username: traineeData.student_code,
                password: traineeData.password,
              })
              .eq("original_id", existingProfile.id)
              .eq("user_type", "student"); // Use 'student' for trainees
            if (loginError) throw loginError;
          }
        }
      } else {
        // Create new trainee via edge function to properly create profile
        const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
          body: {
            fullName: traineeData.full_name,
            email: traineeData.email,
            phone: traineeData.phone,
            username: traineeData.student_code,
            password: traineeData.password,
            dob: traineeData.date_of_birth,
            role: 'trainee',
            entityId: null,
            userType: 'student' // Set correct user_type for trainees
          },
        });

        // Handle edge function errors properly
        if (userError) {
          console.error('Edge function error:', userError);
          throw new Error(userError.message || 'Failed to create user');
        }
        
        if (userData?.error) {
          console.error('User creation error:', userData.error);
          throw new Error(userData.error);
        }
        
        // Now insert trainee record
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
    onError: (error: any) => {
      const errorMessage = error?.message || "Unknown error occurred";
      toast.error(`Failed to save trainee: ${errorMessage}`);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = editingTrainee?.image_url || null;
    
    // Upload image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('trainee-images')
        .upload(fileName, imageFile);
      
      if (uploadError) {
        toast.error("Failed to upload image");
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('trainee-images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }
    
    const email = getStringField(formData, "email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const traineeData: any = {
      student_code: getStringField(formData, "student_code"),
      full_name: getStringField(formData, "full_name"),
      gender: getStringField(formData, "gender") || null,
      email,
      phone: getStringField(formData, "phone") || null,
      date_of_birth: getStringField(formData, "date_of_birth") || null,
      address: getStringField(formData, "address") || null,
      password: getStringField(formData, "password"),
      enrollment_date: getStringField(formData, "enrollment_date"),
      status: getStringField(formData, "status") || "active",
      residence_type: getStringField(formData, "residence_type") || null,
      // Note: incharge_person_id and image_url removed as they don't exist in students table
    };
    
    // Only include image_url if it was uploaded and if we're adding it to the table
    if (imageUrl) {
      traineeData.image_url = imageUrl;
    }
    
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
          {!readOnly && (
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
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingTrainee?.email}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="student_code">Username</Label>
                    <Input
                      id="student_code"
                      name="student_code"
                      defaultValue={editingTrainee?.student_code}
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
                    <Label htmlFor="residence_type">Select Type</Label>
                    <Select name="residence_type" defaultValue={editingTrainee?.residence_type || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hostel">Hostel</SelectItem>
                        <SelectItem value="daily">Daily Come</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingTrainee?.address}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incharge_person_id">In-charge Name</Label>
                    <Select name="incharge_person_id" defaultValue={editingTrainee?.incharge_person_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select in-charge" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee: any) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.profiles?.full_name || "Unknown"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="image">Upload Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {editingTrainee?.image_url && (
                      <p className="text-xs text-muted-foreground mt-1">Current image will be replaced if new one is uploaded</p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingTrainee ? "Update" : "Register"} Trainee
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainees.map((trainee) => (
              <TableRow key={trainee.id}>
                <TableCell>{trainee.full_name}</TableCell>
                <TableCell>{trainee.email || "-"}</TableCell>
                <TableCell>{trainee.phone || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onViewTrainee) {
                          onViewTrainee(trainee.id);
                        } else {
                          navigate(`/trainees/${trainee.id}`);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!readOnly && (
                      <>
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
                      </>
                    )}
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
