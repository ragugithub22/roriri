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
import { DataTable, Badge } from "@/components/dashboard/DataTable";
import { Plus, Edit, Trash2, FileText, Upload, Download } from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  description?: string;
  document_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  uploaded_by?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  tags?: string[];
  status: string;
  created_at: string;
}

const DocumentsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    document_type: "resume",
    file_url: "",
    file_name: "",
    file_size: 0,
    uploaded_by: "",
    related_entity_type: "",
    related_entity_id: "",
    tags: [] as string[],
    status: "active"
  });

  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["consultancy-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultancy_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("consultancy_documents")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-documents"] });
      toast.success("Document added successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add document: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from("consultancy_documents")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-documents"] });
      toast.success("Document updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update document: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("consultancy_documents")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultancy-documents"] });
      toast.success("Document deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete document: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      document_type: "resume",
      file_url: "",
      file_name: "",
      file_size: 0,
      uploaded_by: "",
      related_entity_type: "",
      related_entity_id: "",
      tags: [],
      status: "active"
    });
    setEditingDocument(null);
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);
    setFormData({ ...formData, tags });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      description: document.description || "",
      document_type: document.document_type,
      file_url: document.file_url || "",
      file_name: document.file_name || "",
      file_size: document.file_size || 0,
      uploaded_by: document.uploaded_by || "",
      related_entity_type: document.related_entity_type || "",
      related_entity_id: document.related_entity_id || "",
      tags: document.tags || [],
      status: document.status
    });
    setIsDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    {
      key: "title",
      label: "Document",
      render: (value: string, row: Document) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">
            {row.document_type} • {row.file_name}
          </div>
        </div>
      )
    },
    {
      key: "file_size",
      label: "Size",
      render: (value: number) => value ? formatFileSize(value) : "N/A"
    },
    {
      key: "document_type",
      label: "Type",
      render: (value: string) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    },
    {
      key: "uploaded_by",
      label: "Uploaded By",
      render: (value: string) => value || "Unknown"
    },
    {
      key: "created_at",
      label: "Uploaded",
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Document) => (
        <div className="flex gap-2">
          {row.file_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(row.file_url, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
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
              if (confirm("Are you sure you want to delete this document?")) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documents Management</h2>
          <p className="text-muted-foreground">Manage resumes, contracts, and other documents</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? "Edit Document" : "Add New Document"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_type">Document Type</Label>
                  <Select value={formData.document_type} onValueChange={(value) => setFormData({ ...formData, document_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resume">Resume</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="offer_letter">Offer Letter</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="agreement">Agreement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="file_name">File Name</Label>
                  <Input
                    id="file_name"
                    value={formData.file_name}
                    onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                    placeholder="document.pdf"
                  />
                </div>
                <div>
                  <Label htmlFor="file_size">File Size (bytes)</Label>
                  <Input
                    id="file_size"
                    type="number"
                    value={formData.file_size}
                    onChange={(e) => setFormData({ ...formData, file_size: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file_url">File URL</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://drive.google.com/file/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="uploaded_by">Uploaded By</Label>
                  <Input
                    id="uploaded_by"
                    value={formData.uploaded_by}
                    onChange={(e) => setFormData({ ...formData, uploaded_by: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="related_entity_type">Related To</Label>
                  <Select value={formData.related_entity_type} onValueChange={(value) => setFormData({ ...formData, related_entity_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">Candidate</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="job_opening">Job Opening</SelectItem>
                      <SelectItem value="placement">Placement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingDocument ? "Update" : "Add"} Document
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">All documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resumes</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.document_type === "resume").length}
            </div>
            <p className="text-xs text-muted-foreground">Candidate resumes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.document_type === "contract").length}
            </div>
            <p className="text-xs text-muted-foreground">Legal documents</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Documents"
        description="Manage all consultancy-related documents and files"
        columns={columns}
        data={documents}
        emptyMessage="No documents found"
        isLoading={isLoading}
      />
    </div>
  );
};

export default DocumentsManager;
