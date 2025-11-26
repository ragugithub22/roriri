import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, Plus, Send } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateOfferLetterHTML, OfferLetter } from "@/components/internship/OfferLetter";
import { generateBonafideLetterHTML, BonafideLetter } from "@/components/internship/BonafideLetter";
import { DialogFooter } from "@/components/ui/dialog";

interface InternshipEnquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  college_name?: string;
  passout_year?: string;
  department?: string;
  description?: string;
  address?: string;
  comments?: string;
  follow_up_date?: string;
  follow_status?: string;
  enquiry_date: string;
  mode_status?: string;
  created_at?: string;
}

export default function EnquiryPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLetterDialogOpen, setIsLetterDialogOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<InternshipEnquiry | null>(null);
  const [viewingEnquiry, setViewingEnquiry] = useState<InternshipEnquiry | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<InternshipEnquiry | null>(null);
  const [letterType, setLetterType] = useState<"offer" | "bonafide">("offer");
  const [showPreview, setShowPreview] = useState(false);
  const [letterData, setLetterData] = useState({
    position: "",
    joiningDate: format(new Date(), "yyyy-MM-dd"),
    duration: "",
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    college_name: "",
    passout_year: "",
    department: "",
    description: "",
    address: "",
    comments: "",
    follow_up_date: "",
    follow_status: "",
    enquiry_date: format(new Date(), "yyyy-MM-dd"),
    mode_status: "",
  });

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ["internship-enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InternshipEnquiry[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingEnquiry) {
        const { error } = await supabase
          .from("internship_enquiries")
          .update(data)
          .eq("id", editingEnquiry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("internship_enquiries")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internship-enquiries"] });
      toast.success(editingEnquiry ? "Enquiry updated successfully" : "Enquiry added successfully");
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to save enquiry: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("internship_enquiries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internship-enquiries"] });
      toast.success("Enquiry deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete enquiry: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      college_name: "",
      passout_year: "",
      department: "",
      description: "",
      address: "",
      comments: "",
      follow_up_date: "",
      follow_status: "",
      enquiry_date: format(new Date(), "yyyy-MM-dd"),
      mode_status: "",
    });
    setEditingEnquiry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleEdit = (enquiry: InternshipEnquiry) => {
    setEditingEnquiry(enquiry);
    setFormData({
      name: enquiry.name,
      phone: enquiry.phone,
      email: enquiry.email || "",
      college_name: enquiry.college_name || "",
      passout_year: enquiry.passout_year || "",
      department: enquiry.department || "",
      description: enquiry.description || "",
      address: enquiry.address || "",
      comments: enquiry.comments || "",
      follow_up_date: enquiry.follow_up_date || "",
      follow_status: enquiry.follow_status || "",
      enquiry_date: enquiry.enquiry_date,
      mode_status: enquiry.mode_status || "",
    });
    setIsOpen(true);
  };

  const handleView = (enquiry: InternshipEnquiry) => {
    setViewingEnquiry(enquiry);
    setIsViewOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this enquiry?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSendLetter = (enquiry: InternshipEnquiry, type: "offer" | "bonafide") => {
    setSelectedEnquiry(enquiry);
    setLetterType(type);
    setShowPreview(false);
    setLetterData({
      position: "",
      joiningDate: format(new Date(), "yyyy-MM-dd"),
      duration: "1 Month",
      endDate: format(new Date(), "yyyy-MM-dd"),
    });
    setIsLetterDialogOpen(true);
  };

  const handleGenerateLetter = () => {
    if (!letterData.position) {
      toast.error("Please enter position");
      return;
    }
    if (letterType === "offer" && !letterData.duration) {
      toast.error("Please enter duration");
      return;
    }
    if (letterType === "bonafide" && !letterData.endDate) {
      toast.error("Please select end date");
      return;
    }
    setShowPreview(true);
  };

  const sendLetterMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEnquiry || !selectedEnquiry.email) {
        throw new Error("Email address is required");
      }

      const letterHTML = letterType === "offer" 
        ? generateOfferLetterHTML({
            candidateName: selectedEnquiry.name,
            position: letterData.position,
            joiningDate: letterData.joiningDate,
            duration: letterData.duration,
          })
        : generateBonafideLetterHTML({
            candidateName: selectedEnquiry.name,
            position: letterData.position,
            startDate: letterData.joiningDate,
            endDate: letterData.endDate,
          });

      const { data, error } = await supabase.functions.invoke('send-internship-letter', {
        body: {
          recipientEmail: selectedEnquiry.email,
          recipientName: selectedEnquiry.name,
          letterType: letterType,
          letterHTML: letterHTML,
          subject: letterType === "offer" 
            ? "Internship Offer Letter - Roriri Software Solutions"
            : "Bonafide Internship Certificate - Roriri Software Solutions",
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to send letter");
      }

      return data;
    },
    onSuccess: () => {
      toast.success(`${letterType === "offer" ? "Offer Letter" : "Bonafide Certificate"} sent successfully!`);
      setIsLetterDialogOpen(false);
      setSelectedEnquiry(null);
    },
    onError: (error) => {
      toast.error(`Failed to send letter: ${error.message}`);
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Internship Enquiries</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Enquiry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEnquiry ? "Edit Enquiry" : "Add New Enquiry"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="Phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college_name">College Name</Label>
                  <Input
                    id="college_name"
                    value={formData.college_name}
                    onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                    placeholder="College Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passout_year">Passout Year</Label>
                  <Input
                    id="passout_year"
                    value={formData.passout_year}
                    onChange={(e) => setFormData({ ...formData, passout_year: e.target.value })}
                    placeholder="YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Department Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description ..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Address ..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Enter comments ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">Follow-up Date *</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow_status">Follow Status *</Label>
                  <Select
                    value={formData.follow_status}
                    onValueChange={(value) => setFormData({ ...formData, follow_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enquiry_date">Enquiry Date *</Label>
                  <Input
                    id="enquiry_date"
                    type="date"
                    value={formData.enquiry_date}
                    onChange={(e) => setFormData({ ...formData, enquiry_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mode_status">Mode Status</Label>
                  <Select
                    value={formData.mode_status}
                    onValueChange={(value) => setFormData({ ...formData, mode_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Submit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>College Name</TableHead>
                <TableHead>Followed Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : enquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No enquiries found
                  </TableCell>
                </TableRow>
              ) : (
                enquiries.map((enquiry, index) => (
                  <TableRow key={enquiry.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{enquiry.name}</TableCell>
                    <TableCell>{enquiry.phone}</TableCell>
                    <TableCell>{enquiry.college_name || "-"}</TableCell>
                    <TableCell>
                      {enquiry.follow_up_date
                        ? format(new Date(enquiry.follow_up_date), "dd-MM-yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          enquiry.follow_status === "completed"
                            ? "bg-green-100 text-green-700"
                            : enquiry.follow_status === "contacted"
                            ? "bg-blue-100 text-blue-700"
                            : enquiry.follow_status === "follow_up"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {enquiry.follow_status || "pending"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleView(enquiry)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(enquiry)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={!enquiry.email}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleSendLetter(enquiry, "offer")}>
                              Offer Letter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendLetter(enquiry, "bonafide")}>
                              Bonafide Letter
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(enquiry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {viewingEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{viewingEnquiry.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{viewingEnquiry.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{viewingEnquiry.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">College Name</Label>
                  <p className="font-medium">{viewingEnquiry.college_name || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Passout Year</Label>
                  <p className="font-medium">{viewingEnquiry.passout_year || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium">{viewingEnquiry.department || "-"}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="font-medium">{viewingEnquiry.description || "-"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium">{viewingEnquiry.address || "-"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Comments</Label>
                <p className="font-medium">{viewingEnquiry.comments || "-"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Follow-up Date</Label>
                  <p className="font-medium">
                    {viewingEnquiry.follow_up_date
                      ? format(new Date(viewingEnquiry.follow_up_date), "dd-MM-yyyy")
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Follow Status</Label>
                  <p className="font-medium">{viewingEnquiry.follow_status || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Enquiry Date</Label>
                  <p className="font-medium">
                    {format(new Date(viewingEnquiry.enquiry_date), "dd-MM-yyyy")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mode Status</Label>
                  <p className="font-medium">{viewingEnquiry.mode_status || "-"}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsViewOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Letter Dialog */}
      <Dialog open={isLetterDialogOpen} onOpenChange={setIsLetterDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Send {letterType === "offer" ? "Offer Letter" : "Bonafide Certificate"}
            </DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <>
              {!showPreview ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Candidate Name</Label>
                    <p className="font-medium">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedEnquiry.email || "No email provided"}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={letterData.position}
                      onChange={(e) => setLetterData({ ...letterData, position: e.target.value })}
                      placeholder="e.g., FullStack Developer"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="joiningDate">
                        {letterType === "offer" ? "Joining Date *" : "Start Date *"}
                      </Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        value={letterData.joiningDate}
                        onChange={(e) => setLetterData({ ...letterData, joiningDate: e.target.value })}
                        required
                      />
                    </div>
                    {letterType === "offer" ? (
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration *</Label>
                        <Input
                          id="duration"
                          value={letterData.duration}
                          onChange={(e) => setLetterData({ ...letterData, duration: e.target.value })}
                          placeholder="e.g., 1 Month, 3 Months"
                          required
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={letterData.endDate}
                          onChange={(e) => setLetterData({ ...letterData, endDate: e.target.value })}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <DialogFooter className="gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsLetterDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateLetter}>
                      Generate
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-lg p-6 bg-white">
                    {letterType === "offer" ? (
                      <OfferLetter
                        candidateName={selectedEnquiry.name}
                        position={letterData.position}
                        joiningDate={letterData.joiningDate}
                        duration={letterData.duration}
                      />
                    ) : (
                      <BonafideLetter
                        candidateName={selectedEnquiry.name}
                        position={letterData.position}
                        startDate={letterData.joiningDate}
                        endDate={letterData.endDate}
                      />
                    )}
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview(false)}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => sendLetterMutation.mutate()}
                      disabled={sendLetterMutation.isPending || !selectedEnquiry.email}
                    >
                      {sendLetterMutation.isPending ? "Sending..." : "Send"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
