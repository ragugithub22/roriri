import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileDown, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Visitor {
  id: string;
  college_name: string;
  date: string;
  department: string;
  students_count: number;
  staff_count: number;
  status: string;
  created_at: string;
}

export default function IndustrialVisitVisitors() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    college_name: "",
    date: "",
    department: "",
    students_count: 0,
    staff_count: 0,
    status: "upcoming",
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
      students_count: 0,
      staff_count: 0,
      status: "upcoming",
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
      students_count: visitor.students_count,
      staff_count: visitor.staff_count,
      status: visitor.status,
    });
  };

  const filteredVisitors = visitors.filter((visitor) =>
    visitor.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingVisitors = filteredVisitors.filter((v) => v.status === "upcoming");
  const completedVisitors = filteredVisitors.filter((v) => v.status === "completed");

  const exportToCSV = (data: Visitor[]) => {
    const headers = ["S. No", "College Name", "Date", "Department", "Students Count", "Staff Count", "Status"];
    const rows = data.map((visitor, index) => [
      index + 1,
      visitor.college_name,
      visitor.date,
      visitor.department,
      visitor.students_count,
      visitor.staff_count,
      visitor.status,
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visitors.csv";
    a.click();
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
              <TableHead>College Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Students Count</TableHead>
              <TableHead>Staff Count</TableHead>
              <TableHead>Status</TableHead>
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
              data.map((visitor, index) => (
                <TableRow key={visitor.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{visitor.college_name}</TableCell>
                  <TableCell>{new Date(visitor.date).toLocaleDateString()}</TableCell>
                  <TableCell>{visitor.department}</TableCell>
                  <TableCell>{visitor.students_count}</TableCell>
                  <TableCell>{visitor.staff_count}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      visitor.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {visitor.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Industrial Visit Visitors</h1>
          <p className="text-muted-foreground mt-2">Manage upcoming and completed visits</p>
        </div>
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
                  <Label htmlFor="students_count">Students Count *</Label>
                  <Input
                    id="students_count"
                    type="number"
                    min="0"
                    value={formData.students_count}
                    onChange={(e) => setFormData({ ...formData, students_count: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff_count">Staff Count *</Label>
                  <Input
                    id="staff_count"
                    type="number"
                    min="0"
                    value={formData.staff_count}
                    onChange={(e) => setFormData({ ...formData, staff_count: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
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

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming Visits
          </TabsTrigger>
          <TabsTrigger value="completed">
            <FileDown className="h-4 w-4 mr-2" />
            Completed Visits
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <VisitorTable data={upcomingVisitors} />
        </TabsContent>
        
        <TabsContent value="completed">
          <VisitorTable data={completedVisitors} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
