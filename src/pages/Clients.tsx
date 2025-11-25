import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { format, differenceInMonths } from "date-fns";

interface Client {
  id: string;
  client_code: string;
  company_name: string;
  contact_person: string;
  email: string | null;
  phone: string | null;
  status: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  deadline: string | null;
  client_id: string;
}

interface ClientWithProject extends Client {
  projects?: Project[];
}

const Clients = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientWithProject | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    contact_person: "",
    phone: "",
    email: "",
    company_name: "",
    project_name: "",
    project_description: "",
    project_start_date: "",
    project_end_date: "",
  });

  const { data: clients, isLoading } = useQuery({
    queryKey: ["it-clients"],
    queryFn: async () => {
      const { data: clientsData, error: clientsError } = await supabase
        .from("it_clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;

      const clientsWithProjects = await Promise.all(
        (clientsData || []).map(async (client) => {
          const { data: projects } = await supabase
            .from("it_projects")
            .select("*")
            .eq("client_id", client.id)
            .order("created_at", { ascending: false });

          return {
            ...client,
            projects: projects || [],
          };
        })
      );

      return clientsWithProjects as ClientWithProject[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const clientCode = `CL${Date.now().toString().slice(-6)}`;
      
      const { data: clientData, error: clientError } = await supabase
        .from("it_clients")
        .insert({
          client_code: clientCode,
          company_name: data.company_name,
          contact_person: data.contact_person,
          email: data.email,
          phone: data.phone,
          status: "active",
        })
        .select()
        .single();

      if (clientError) throw clientError;

      const projectCode = `PR${Date.now().toString().slice(-6)}`;
      
      const { error: projectError } = await supabase
        .from("it_projects")
        .insert({
          client_id: clientData.id,
          project_code: projectCode,
          name: data.project_name,
          description: data.project_description,
          start_date: data.project_start_date,
          deadline: data.project_end_date,
          status: "planning",
        });

      if (projectError) throw projectError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["it-clients"] });
      toast({ title: "Client added successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Failed to add client", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string; projectId: string }) => {
      const { error: clientError } = await supabase
        .from("it_clients")
        .update({
          company_name: data.company_name,
          contact_person: data.contact_person,
          email: data.email,
          phone: data.phone,
        })
        .eq("id", data.id);

      if (clientError) throw clientError;

      const { error: projectError } = await supabase
        .from("it_projects")
        .update({
          name: data.project_name,
          description: data.project_description,
          start_date: data.project_start_date,
          deadline: data.project_end_date,
        })
        .eq("id", data.projectId);

      if (projectError) throw projectError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["it-clients"] });
      toast({ title: "Client updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Failed to update client", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("it_clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["it-clients"] });
      toast({ title: "Client deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete client", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      contact_person: "",
      phone: "",
      email: "",
      company_name: "",
      project_name: "",
      project_description: "",
      project_start_date: "",
      project_end_date: "",
    });
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient && editingClient.projects?.[0]) {
      updateMutation.mutate({ ...formData, id: editingClient.id, projectId: editingClient.projects[0].id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (client: ClientWithProject) => {
    const project = client.projects?.[0];
    setEditingClient(client);
    setFormData({
      contact_person: client.contact_person,
      phone: client.phone || "",
      email: client.email || "",
      company_name: client.company_name,
      project_name: project?.name || "",
      project_description: project?.description || "",
      project_start_date: project?.start_date || "",
      project_end_date: project?.deadline || "",
    });
    setIsDialogOpen(true);
  };

  const handleView = (client: ClientWithProject) => {
    const project = client.projects?.[0];
    if (project) {
      setViewingProject(project);
      setIsViewDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteMutation.mutate(id);
    }
  };

  const calculateDuration = (startDate: string, endDate: string | null) => {
    if (!endDate) return "N/A";
    const months = differenceInMonths(new Date(endDate), new Date(startDate));
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage client relationships and projects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Client</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add Client"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Client Name</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project_name">Project Name</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project_start_date">Project Start Date</Label>
                  <Input
                    id="project_start_date"
                    type="date"
                    value={formData.project_start_date}
                    onChange={(e) => setFormData({ ...formData, project_start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="project_description">Project Description</Label>
                  <Textarea
                    id="project_description"
                    value={formData.project_description}
                    onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="project_end_date">Project End Date</Label>
                  <Input
                    id="project_end_date"
                    type="date"
                    value={formData.project_end_date}
                    onChange={(e) => setFormData({ ...formData, project_end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingClient ? "Update" : "Add"} Client</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Project Description</Label>
                <p className="mt-1 text-sm">{viewingProject.description || "No description provided"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Start Date</Label>
                  <p className="mt-1 text-sm">{format(new Date(viewingProject.start_date), "PPP")}</p>
                </div>
                <div>
                  <Label className="font-semibold">End Date</Label>
                  <p className="mt-1 text-sm">
                    {viewingProject.deadline ? format(new Date(viewingProject.deadline), "PPP") : "Not set"}
                  </p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Project Duration</Label>
                <p className="mt-1 text-sm">{calculateDuration(viewingProject.start_date, viewingProject.deadline)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">S. No</th>
                <th className="p-4 text-left font-medium">Client Name</th>
                <th className="p-4 text-left font-medium">Company</th>
                <th className="p-4 text-left font-medium">Phone</th>
                <th className="p-4 text-left font-medium">Email</th>
                <th className="p-4 text-left font-medium">Project Name</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : clients?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    No clients found
                  </td>
                </tr>
              ) : (
                clients?.map((client, index) => (
                  <tr key={client.id} className="border-b">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{client.contact_person}</td>
                    <td className="p-4">{client.company_name}</td>
                    <td className="p-4">{client.phone}</td>
                    <td className="p-4">{client.email}</td>
                    <td className="p-4">{client.projects?.[0]?.name || "N/A"}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleView(client)}
                          disabled={!client.projects?.[0]}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(client)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(client.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
