// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText, Download, Eye, Calendar } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/DataTable";

const supabaseClient = supabase as any;

const DocumentsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [formData, setFormData] = useState({
    document_name: "",
    document_type: "",
    project_id: "",
    description: "",
    upload_date: "",
    expiry_date: "",
    status: "active"
  });

  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<any[]>({
    queryKey: ["builders-documents"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_documents")
        .select(`
          *,
          builders_projects(project_name)
        `)
        .order("upload_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["builders-projects-dropdown"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("builders_projects")
        .select("id, project_name")
        .order("project_name");
      if (error) throw error;
      return data;
    },
  });

  // Create document mutation
  const createDocumentMutation = useMutation<any, Error, any>({
    mutationFn: async (documentData: any) => {
      const { data, error } = await supabaseClient
        .from("builders_documents")
        .insert([documentData])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-documents"] });
      toast.success("Document added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add document: " + error.message);
    },
  });

  // Update document mutation
  const updateDocumentMutation = useMutation<any, Error, any>({
    mutationFn: async ({ id, ...documentData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabaseClient
        .from("builders_documents")
        .update(documentData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-documents"] });
      toast.success("Document updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update document: " + error.message);
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation<any, Error, any>({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from("builders_documents")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builders-documents"] });
      toast.success("Document removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove document: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      document_name: "",
      document_type: "",
      project_id: "",
      description: "",
      upload_date: "",
      expiry_date: "",
      status: "active"
    });
    setEditingDocument(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDocument) {
      updateDocumentMutation.mutate({ id: editingDocument.id, ...formData });
    } else {
      createDocumentMutation.mutate(formData);
    }
  };

  const handleEdit = (document: any) => {
    setEditingDocument(document);
    setFormData({
      document_name: document.document_name || "",
      document_type: document.document_type || "",
      project_id: document.project_id || "",
      description: document.description || "",
      upload_date: document.upload_date || "",
      expiry_date: document.expiry_date || "",
      status: document.status || "active"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this document?")) {
      deleteDocumentMutation.mutate(id);
    }
  };

  const handleDownload = (document: any) => {
    // In a real implementation, this would download the actual file
    toast.info("Download functionality would be implemented here");
  };

  const handleView = (document: any) => {
    // In a real implementation, this would open/view the document
    toast.info("View functionality would be implemented here");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      expired: { variant: "destructive", label: "Expired" },
      archived: { variant: "secondary", label: "Archived" }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary">Expiring Soon</Badge>;
    }
    return null;
  };

  const documentColumns = [
    { key: "document_name", label: "Document Name" },
    { key: "document_type", label: "Type" },
    {
      key: "project_name",
      label: "Project",
      render: (_: any, row: any) => row.builders_projects?.project_name || "Not assigned"
    },
    {
      key: "upload_date",
      label: "Upload Date",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "N/A"
    },
    {
      key: "expiry_date",
      label: "Expiry Date",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "N/A"
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: any) => (
        <div className="flex gap-2">
          {getStatusBadge(value)}
          {getExpiryStatus(row.expiry_date)}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload(row)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const documentTypeOptions = [
    "contract", "permit", "blueprint", "invoice", "receipt", "certificate",
    "agreement", "report", "specification", "photo", "video", "other"
  ];

  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documents Management</h2>
          <p className="text-muted-foreground">Manage project documents and files</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDocument ? "Edit Document" : "Add New Document"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_name">Document Name *</Label>
                  <Input
                    id="document_name"
                    value={formData.document_name}
                    onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="document_type">Document Type *</Label>
                  <Select value={formData.document_type} onValueChange={(value) => setFormData({ ...formData, document_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="project_id">Associated Project</Label>
                  <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="upload_date">Upload Date</Label>
                  <Input
                    id="upload_date"
                    type="date"
                    value={formData.upload_date}
                    onChange={(e) => setFormData({ ...formData, upload_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDocumentMutation.isPending || updateDocumentMutation.isPending}>
                  {editingDocument ? "Update" : "Add"} Document
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        title="Project Documents"
        description="All project documents and their details"
        columns={documentColumns}
        data={documents}
      />

      {/* Document Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document: any) => (
          <Card key={document.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {document.document_name}
                </span>
                {getStatusBadge(document.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Type: {document.document_type ? document.document_type.charAt(0).toUpperCase() + document.document_type.slice(1) : "Not specified"}
                </div>
                {document.builders_projects?.project_name && (
                  <div className="text-sm text-muted-foreground">
                    Project: {document.builders_projects.project_name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Uploaded: {document.upload_date ? new Date(document.upload_date).toLocaleDateString() : "N/A"}
                </div>
                {document.expiry_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Expires: {new Date(document.expiry_date).toLocaleDateString()}
                  </div>
                )}
                {getExpiryStatus(document.expiry_date)}
                {document.description && (
                  <div className="text-sm text-muted-foreground">
                    {document.description}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleView(document)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(document)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(document)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(document.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentsManager;
