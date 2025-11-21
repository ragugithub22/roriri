import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Plus, Edit, Trash2, Award, Calendar, Users, FileText } from "lucide-react";
import { toast } from "sonner";

interface Certificate {
  id: string;
  certificate_number: string;
  beneficiary_id: string;
  certificate_type: string;
  issue_date: string;
  expiry_date?: string;
  status: string;
  notes?: string;
  created_at: string;
}

const CertificatesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    certificate_number: "",
    beneficiary_id: "",
    certificate_type: "",
    issue_date: "",
    expiry_date: "",
    status: "active",
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foundation_certificates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Certificate[];
    },
  });

  const { data: beneficiaries = [] } = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name")
        .eq("entity_code", "foundation");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("foundation_certificates")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create certificate: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("foundation_certificates")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update certificate: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("foundation_certificates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete certificate: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      certificate_number: "",
      beneficiary_id: "",
      certificate_type: "",
      issue_date: "",
      expiry_date: "",
      status: "active",
      notes: ""
    });
    setEditingCertificate(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCertificate) {
      updateMutation.mutate({ id: editingCertificate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      certificate_number: certificate.certificate_number,
      beneficiary_id: certificate.beneficiary_id,
      certificate_type: certificate.certificate_type,
      issue_date: certificate.issue_date,
      expiry_date: certificate.expiry_date || "",
      status: certificate.status,
      notes: certificate.notes || ""
    });
    setIsDialogOpen(true);
  };

  const getBeneficiaryName = (id: string) => {
    const beneficiary = beneficiaries.find(b => b.id === id);
    return beneficiary ? beneficiary.full_name : "Unknown";
  };

  const columns = [
    {
      key: "certificate_number",
      label: "Certificate Number",
      render: (value: string) => (
        <div className="font-mono font-medium">{value}</div>
      )
    },
    {
      key: "beneficiary_id",
      label: "Beneficiary",
      render: (value: string) => getBeneficiaryName(value)
    },
    {
      key: "certificate_type",
      label: "Type",
      render: (value: string) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: "issue_date",
      label: "Issue Date",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={
          value === "active" ? "default" :
          value === "expired" ? "secondary" :
          value === "revoked" ? "destructive" :
          "outline"
        }>
          {value}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Certificate) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this certificate?")) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const totalCertificates = certificates.length;
  const activeCertificates = certificates.filter(c => c.status === "active").length;
  const thisMonthCertificates = certificates.filter(c =>
    new Date(c.issue_date).getMonth() === new Date().getMonth() &&
    new Date(c.issue_date).getFullYear() === new Date().getFullYear()
  ).length;
  const expiredCertificates = certificates.filter(c => c.status === "expired").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Certificates Management</h2>
          <p className="text-muted-foreground">Issue and manage foundation certificates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Issue Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCertificate ? "Edit Certificate" : "Issue New Certificate"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="certificate_number">Certificate Number *</Label>
                  <Input
                    id="certificate_number"
                    value={formData.certificate_number}
                    onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="beneficiary_id">Beneficiary *</Label>
                  <Select value={formData.beneficiary_id} onValueChange={(value) => setFormData({ ...formData, beneficiary_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaries.map((beneficiary) => (
                        <SelectItem key={beneficiary.id} value={beneficiary.id}>
                          {beneficiary.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="certificate_type">Certificate Type *</Label>
                  <Select value={formData.certificate_type} onValueChange={(value) => setFormData({ ...formData, certificate_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completion">Program Completion</SelectItem>
                      <SelectItem value="participation">Participation</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="appreciation">Appreciation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="issue_date">Issue Date *</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCertificate ? "Update" : "Issue"} Certificate
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertificates}</div>
            <p className="text-xs text-muted-foreground">All certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCertificates}</div>
            <p className="text-xs text-muted-foreground">Valid certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthCertificates}</div>
            <p className="text-xs text-muted-foreground">Issued this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredCertificates}</div>
            <p className="text-xs text-muted-foreground">Expired certificates</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Certificates"
        description="Manage foundation certificates and their status"
        columns={columns}
        data={certificates}
        emptyMessage="No certificates found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default CertificatesManager;
