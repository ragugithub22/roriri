import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  incharge_person_id?: string;
  course_id?: string;
  fees?: number;
  duration_value?: number;
  duration_unit?: string;
  gender?: string;
  mode?: string;
  phone?: string;
  email?: string;
  address?: string;
  image_url?: string;
  joining_date?: string;
  username?: string;
  password?: string;
  status: string;
  created_at: string;
}

interface CandidatePageProps {
  onViewCandidate?: (candidateId: string) => void;
}

export default function CandidatePage({ onViewCandidate }: CandidatePageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    incharge_person_id: "",
    course_id: "",
    fees: "",
    duration_value: "",
    duration_unit: "months",
    gender: "",
    mode: "",
    phone: "",
    email: "",
    address: "",
    image_url: "",
    joining_date: "",
    username: "",
    password: "",
    status: "active",
  });

  const queryClient = useQueryClient();

  // Fetch candidates
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["internship-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_candidates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Candidate[];
    },
  });

  // Fetch employees for incharge dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-incharge"],
    queryFn: async () => {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_company")
        .maybeSingle();
      
      if (!entity) return [];

      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          profiles!inner(full_name)
        `)
        .eq("entity_id", entity.id)
        .eq("status", "active");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", "it_academy")
        .maybeSingle();
      
      if (!entity) return [];
      
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("entity_id", entity.id)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Create user via edge function to properly create profile
      const { data: userData, error: userError } = await supabase.functions.invoke('create-user', {
        body: {
          fullName: data.name,
          email: data.email,
          phone: data.phone,
          username: data.username,
          password: data.password,
          role: 'intern',
          entityId: null,
          userType: 'internship_candidate' // Set correct user_type for interns
        },
      });

      if (userError || userData?.error) {
        throw new Error(userData?.error || userError?.message || 'Failed to create user');
      }
      
      // Insert candidate record
      const { error } = await supabase
        .from("internship_candidates")
        .insert([{
          ...data,
          fees: data.fees ? Number(data.fees) : null,
          duration_value: data.duration_value ? Number(data.duration_value) : null,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internship-candidates"] });
      toast.success("Candidate added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add candidate: " + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      // Update the internship_candidates table
      const { error } = await supabase
        .from("internship_candidates")
        .update({
          ...data,
          fees: data.fees ? Number(data.fees) : null,
          duration_value: data.duration_value ? Number(data.duration_value) : null,
        })
        .eq("id", id);
      if (error) throw error;

      // Find and update profile record by email (if exists)
      if (data.email && editingCandidate?.email) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", editingCandidate.email)
          .maybeSingle();

        if (existingProfile) {
          // Update existing profile
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              email: data.email,
              username: data.username,
              password: data.password,
              full_name: data.name,
              phone: data.phone,
            })
            .eq("id", existingProfile.id);
          if (profileError) throw profileError;

          // Update user_login table with correct user_type
          const { error: loginError } = await supabase
            .from("user_login")
            .update({
              email: data.email,
              username: data.username,
              password: data.password,
            })
            .eq("original_id", existingProfile.id)
            .eq("user_type", "internship_candidate"); // Use 'internship_candidate' for interns
          if (loginError) throw loginError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internship-candidates"] });
      toast.success("Candidate updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update candidate: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("internship_candidates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internship-candidates"] });
      toast.success("Candidate deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete candidate: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      incharge_person_id: "",
      course_id: "",
      fees: "",
      duration_value: "",
      duration_unit: "months",
      gender: "",
      mode: "",
      phone: "",
      email: "",
      address: "",
      image_url: "",
      joining_date: "",
      username: "",
      password: "",
      status: "active",
    });
    setEditingCandidate(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCandidate) {
      updateMutation.mutate({ id: editingCandidate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      incharge_person_id: candidate.incharge_person_id || "",
      course_id: candidate.course_id || "",
      fees: candidate.fees?.toString() || "",
      duration_value: candidate.duration_value?.toString() || "",
      duration_unit: candidate.duration_unit || "months",
      gender: candidate.gender || "",
      mode: candidate.mode || "",
      phone: candidate.phone || "",
      email: candidate.email || "",
      address: candidate.address || "",
      image_url: candidate.image_url || "",
      joining_date: candidate.joining_date || "",
      username: candidate.username || "",
      password: candidate.password || "",
      status: candidate.status,
    });
    setIsDialogOpen(true);
  };

  const handleCourseChange = (courseId: string) => {
    setFormData(prev => ({ ...prev, course_id: courseId }));
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setFormData(prev => ({
        ...prev,
        fees: course.fees?.toString() || "",
        duration_value: course.duration_weeks?.toString() || "",
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Candidates</h2>
          <p className="text-muted-foreground">Manage internship candidates and applications</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S. No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No candidates found</TableCell>
              </TableRow>
            ) : (
              candidates.map((candidate, index) => (
                <TableRow key={candidate.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.email || "N/A"}</TableCell>
                  <TableCell>{candidate.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={candidate.status === "active" ? "default" : "secondary"}>
                      {candidate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewCandidate ? onViewCandidate(candidate.id) : null}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(candidate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this candidate?")) {
                            deleteMutation.mutate(candidate.id);
                          }
                        }}
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
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCandidate ? "Edit Candidate" : "Add New Candidate"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter Name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="incharge_person">Incharge Person</Label>
                <Select value={formData.incharge_person_id} onValueChange={(val) => setFormData({ ...formData, incharge_person_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the Person" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.profiles?.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course">Course Name</Label>
                <Select value={formData.course_id} onValueChange={handleCourseChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fees">Fees</Label>
                <Input
                  id="fees"
                  type="number"
                  value={formData.fees}
                  onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                  placeholder="Enter the Fees"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_value}
                    onChange={(e) => setFormData({ ...formData, duration_value: e.target.value })}
                    placeholder="Duration No"
                  />
                  <Select value={formData.duration_unit} onValueChange={(val) => setFormData({ ...formData, duration_unit: val })}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Choose unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Select value={formData.mode} onValueChange={(val) => setFormData({ ...formData, mode: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone"
                />
              </div>
              <div>
                <Label htmlFor="joining_date">Joining Date</Label>
                <Input
                  id="joining_date"
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Address ..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // In a real app, you'd upload this to Supabase storage
                      setFormData({ ...formData, image_url: URL.createObjectURL(file) });
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <span className="text-sm text-muted-foreground">No file chosen</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">User Name</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter the Username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
