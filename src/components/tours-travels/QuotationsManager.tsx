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
import { Plus, Pencil, Trash2, FileText, Calculator } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

export default function QuotationsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ["tours-quotations"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_quotations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data || [];
    },
  });

  const { data: enquiries = [] } = useQuery({
    queryKey: ["tours-enquiries"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_enquiries")
        .select("id, customer_name, destination")
        .order("customer_name");
      if (error) return [];
      return data || [];
    },
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["tours-packages"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tours_packages")
        .select("id, package_name, package_code, price_per_person")
        .eq("status", "active")
        .order("package_name");
      if (error) return [];
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (quotationData: any) => {
      if (editingQuotation) {
        const { error } = await (supabase as any)
          .from("tours_quotations")
          .update(quotationData)
          .eq("id", editingQuotation.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("tours_quotations")
          .insert(quotationData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingQuotation ? "Quotation updated" : "Quotation created");
      queryClient.invalidateQueries({ queryKey: ["tours-quotations"] });
      setIsOpen(false);
      setEditingQuotation(null);
    },
    onError: () => {
      toast.error("Failed to save quotation");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("tours_quotations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Quotation deleted");
      queryClient.invalidateQueries({ queryKey: ["tours-quotations"] });
    },
    onError: () => {
      toast.error("Failed to delete quotation");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quotationData = {
      enquiry_id: formData.get("enquiry_id"),
      package_id: formData.get("package_id"),
      quotation_date: formData.get("quotation_date"),
      valid_until: formData.get("valid_until"),
      no_of_adults: parseInt(formData.get("no_of_adults") as string) || 1,
      no_of_children: parseInt(formData.get("no_of_children") as string) || 0,
      base_price: parseFloat(formData.get("base_price") as string),
      taxes: parseFloat(formData.get("taxes") as string) || 0,
      discounts: parseFloat(formData.get("discounts") as string) || 0,
      total_amount: parseFloat(formData.get("total_amount") as string),
      payment_terms: formData.get("payment_terms"),
      status: formData.get("status"),
      notes: formData.get("notes"),
    };
    saveMutation.mutate(quotationData);
  };

  const columns = [
    { key: "enquiry_id", label: "Enquiry" },
    { key: "package_id", label: "Package" },
    {
      key: "quotation_date",
      label: "Date",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "-"
    },
    {
      key: "total_amount",
      label: "Total Amount",
      render: (value: any) => `₹${value?.toLocaleString() || 0}`
    },
    {
      key: "valid_until",
      label: "Valid Until",
      render: (value: any) => value ? new Date(value).toLocaleDateString() : "-"
    },
    {
      key: "status",
      label: "Status",
      render: (value: any) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          draft: "outline",
          sent: "secondary",
          accepted: "default",
          rejected: "destructive",
          expired: "outline"
        };
        return (
          <Badge variant={variants[value as string] || "secondary"}>
            {value || "-"}
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
              setEditingQuotation(row);
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
            <CardTitle>Quotations Management</CardTitle>
            <CardDescription>Create and manage tour quotations for customers</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingQuotation(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Quotation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuotation ? "Edit" : "Add"} Quotation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="enquiry_id">Customer Enquiry</Label>
                    <Select name="enquiry_id" defaultValue={editingQuotation?.enquiry_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select enquiry" />
                      </SelectTrigger>
                      <SelectContent>
                        {enquiries.map((enquiry: any) => (
                          <SelectItem key={enquiry.id} value={enquiry.id}>
                            {enquiry.customer_name} - {enquiry.destination}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="package_id">Tour Package</Label>
                    <Select name="package_id" defaultValue={editingQuotation?.package_id || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg: any) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.package_name} (₹{pkg.price_per_person})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quotation_date">Quotation Date</Label>
                    <Input
                      id="quotation_date"
                      name="quotation_date"
                      type="date"
                      defaultValue={editingQuotation?.quotation_date || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input
                      id="valid_until"
                      name="valid_until"
                      type="date"
                      defaultValue={editingQuotation?.valid_until}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="base_price">Base Price (₹)</Label>
                    <Input
                      id="base_price"
                      name="base_price"
                      type="number"
                      step="0.01"
                      defaultValue={editingQuotation?.base_price}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxes">Taxes (₹)</Label>
                    <Input
                      id="taxes"
                      name="taxes"
                      type="number"
                      step="0.01"
                      defaultValue={editingQuotation?.taxes || 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discounts">Discounts (₹)</Label>
                    <Input
                      id="discounts"
                      name="discounts"
                      type="number"
                      step="0.01"
                      defaultValue={editingQuotation?.discounts || 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_amount">Total Amount (₹)</Label>
                    <Input
                      id="total_amount"
                      name="total_amount"
                      type="number"
                      step="0.01"
                      defaultValue={editingQuotation?.total_amount}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingQuotation?.status || "draft"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      name="notes"
                      defaultValue={editingQuotation?.notes}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingQuotation ? "Update" : "Create"} Quotation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          title="Quotations"
          description="Manage tour quotations and pricing"
          columns={columns}
          data={quotations}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}