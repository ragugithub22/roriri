import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, Download, Eye, Trash2, ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import MOUGenerator from "@/components/mou/MOUGenerator";

interface MOUDocument {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  uploaded_by: string;
  entity_id: string;
}

export default function MOUManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 7;

  const { data: documents, isLoading } = useQuery({
    queryKey: ['mou-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('file_type', 'mou')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MOUDocument[];
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `mou/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name,
          file_path: filePath,
          file_type: 'mou',
          file_size: file.size,
          uploaded_by: user?.id,
          entity_id: '00000000-0000-0000-0000-000000000000' // placeholder
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mou-documents'] });
      toast.success("MOU document uploaded successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to upload document: " + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: MOUDocument) => {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mou-documents'] });
      toast.success("Document deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete document: " + error.message);
    }
  });

  const handleDownload = async (doc: MOUDocument) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(doc.file_path);

    if (error) {
      toast.error("Failed to download document");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCloseDialog = () => {
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setDocumentName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && documentName) {
      uploadMutation.mutate({ file: selectedFile, name: documentName });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
           
            <h1 className="text-2xl font-bold">MOU Management</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl py-8 px-6">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generate">
              <FileText className="h-4 w-4 mr-2" />
              Generate MOU
            </TabsTrigger>
            <TabsTrigger value="documents">
              <Upload className="h-4 w-4 mr-2" />
              Uploaded Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            <MOUGenerator onClose={() => {}} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div></div>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload MOU
                  </Button>
                </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Loading MOU documents...
                      </TableCell>
                    </TableRow>
                  ) : documents && documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No MOU documents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>{format(new Date(doc.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{(doc.file_size / 1024).toFixed(2)} KB</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc)}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(doc)}
                              title="Delete"
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

            {documents && documents.length > itemsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.ceil(documents.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < Math.ceil(documents.length / itemsPerPage) && setCurrentPage(currentPage + 1)}
                        className={currentPage === Math.ceil(documents.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload MOU Document</DialogTitle>
            <DialogDescription>
              Upload a new Memorandum of Understanding document
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="documentName">Document Name</Label>
                <Input
                  id="documentName"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
