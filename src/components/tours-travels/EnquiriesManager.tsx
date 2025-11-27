// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FileText, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

export default function EnquiriesManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ["tours-enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours_enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (enquiryData: any) => {
      if (editingEnquiry) {
        const { error } = await supabase
          .from("tours_enquiries")
          .update(enquiryData)
          .eq("id", editingEnquiry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tours_enquiries")
          .insert(enquiryData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingEnquiry ? "Enquiry updated" : "Enquiry created");
      queryClient.invalidateQueries({ queryKey: ["tours-enquiries"] });
      setIsOpen(false);
      setEditingEnquiry(null);
    },
    onError: () => {
      toast.error("Failed to save enquiry");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tours_enquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry deleted");
      queryClient.invalidateQueries({ queryKey: ["tours-enquiries"] });
    },
    onError: () => {
      toast.error("Failed to delete enquiry");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const enquiryData = {
      customer_name: formData.get("customer_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      destination: formData.get("destination"),
      travel_date: formData.get("travel_date") || null,
      duration_days: parseInt(formData.get("duration_days") as string) || null,
      no_of_adults: parseInt(formData.get("no_of_adults") as string) || 1,
      no_of_children: parseInt(formData.get("no_of_children") as string) || 0,
      budget_range: formData.get("budget_range"),
      requirements: formData.get("requirements"),
      lead_source: formData.get("lead_source"),
      status: formData.get("status"),
      follow_up_date: formData.get("follow_up_date") || null,
      remarks: formData.get("remarks"),
    };
    saveMutation.mutate(enquiryData);
  };

  const columns = [
    { key: "customer_name", label: "Customer Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "destination", label: "Destination" },
    {
      key: "travel_date",
      label: "Travel Date",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "-"
    },
    {
      key: "status",
      label: "Status",
      render: (value: any) => {
        const variants = {
          new: "default",
          contacted: "secondary",
          quoted: "outline",
          confirmed: "default",
          cancelled: "destructive"
        };
        return (
          <Badge variant={variants[value as keyof typeof variants] || "secondary"}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingEnquiry(row);
              setIsOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Enquiries Management</CardTitle>
            <CardDescription>Manage customer enquiries and leads</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEnquiry(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Enquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEnquiry ? "Edit" : "Add"} Enquiry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Customer Name</Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      defaultValue={editingEnquiry?.customer_name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={editingEnquiry?.phone}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingEnquiry?.email}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead_source">Lead Source</Label>
                    <Select name="lead_source" defaultValue={editingEnquiry?.lead_source || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="walk_in">Walk In</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      name="destination"
                      defaultValue={editingEnquiry?.destination}
                    />
                  </div>
                  <div>
                    <Label htmlFor="travel_date">Travel Date</Label>
                    <Input
                      id="travel_date"
                      name="travel_date"
                      type="date"
                      defaultValue={editingEnquiry?.travel_date}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="duration_days">Duration (Days)</Label>
                    <Input
                      id="duration_days"
                      name="duration_days"
                      type="number"
                      defaultValue={editingEnquiry?.duration_days}
                    />
                  </div>
                  <div>
                    <Label htmlFor="no_of_adults">Adults</Label>
                    <Input
                      id="no_of_adults"
                      name="no_of_adults"
                      type="number"
                      defaultValue={editingEnquiry?.no_of_adults || 1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="no_of_children">Children</Label>
                    <Input
                      id="no_of_children"
                      name="no_of_children"
                      type="number"
                      defaultValue={editingEnquiry?.no_of_children || 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget_range">Budget Range</Label>
                    <Input
                      id="budget_range"
                      name="budget_range"
                      defaultValue={editingEnquiry?.budget_range}
                      placeholder="₹50,000 - ₹1,00,000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    defaultValue={editingEnquiry?.requirements}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingEnquiry?.status || "new"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="follow_up_date">Follow Up Date</Label>
                    <Input
                      id="follow_up_date"
                      name="follow_up_date"
                      type="date"
                      defaultValue={editingEnquiry?.follow_up_date}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    name="remarks"
                    defaultValue={editingEnquiry?.remarks}
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingEnquiry ? "Update" : "Create"} Enquiry
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          title="Enquiries"
          description="Manage customer enquiries and leads"
          columns={columns}
          data={enquiries}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
