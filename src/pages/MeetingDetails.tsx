import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface MeetingDetail {
  id: string;
  date: string;
  meeting_for: string;
  participants: string;
  hours: number;
  created_at: string;
  updated_at: string;
}

const MeetingDetails = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingDetail | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    meeting_for: "",
    participants: "",
    hours: "",
  });

  const { data: meetings, isLoading } = useQuery({
    queryKey: ["meeting-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_details")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as MeetingDetail[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("meeting_details").insert({
        date: data.date,
        meeting_for: data.meeting_for,
        participants: data.participants,
        hours: parseFloat(data.hours),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-details"] });
      toast({ title: "Meeting added successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Failed to add meeting", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from("meeting_details")
        .update({
          date: data.date,
          meeting_for: data.meeting_for,
          participants: data.participants,
          hours: parseFloat(data.hours),
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-details"] });
      toast({ title: "Meeting updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Failed to update meeting", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meeting_details").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-details"] });
      toast({ title: "Meeting deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete meeting", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      date: "",
      meeting_for: "",
      participants: "",
      hours: "",
    });
    setEditingMeeting(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeeting) {
      updateMutation.mutate({ ...formData, id: editingMeeting.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (meeting: MeetingDetail) => {
    setEditingMeeting(meeting);
    setFormData({
      date: meeting.date,
      meeting_for: meeting.meeting_for,
      participants: meeting.participants,
      hours: meeting.hours.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meeting Details</h1>
          <p className="text-muted-foreground">Schedule and manage meetings and agendas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add Meeting</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMeeting ? "Edit Meeting" : "Add Meeting"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="meeting_for">Meeting For</Label>
                <Input
                  id="meeting_for"
                  value={formData.meeting_for}
                  onChange={(e) => setFormData({ ...formData, meeting_for: e.target.value })}
                  placeholder="e.g., Project Planning"
                  required
                />
              </div>
              <div>
                <Label htmlFor="participants">Participants</Label>
                <Textarea
                  id="participants"
                  value={formData.participants}
                  onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                  placeholder="List participant names"
                  required
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="e.g., 2.5"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingMeeting ? "Update" : "Add"} Meeting</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">S. No</th>
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">Meeting For</th>
                <th className="p-4 text-left font-medium">Participants</th>
                <th className="p-4 text-left font-medium">Hours</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : meetings?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    No meetings found
                  </td>
                </tr>
              ) : (
                meetings?.map((meeting, index) => (
                  <tr key={meeting.id} className="border-b">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{format(new Date(meeting.date), "PPP")}</td>
                    <td className="p-4">{meeting.meeting_for}</td>
                    <td className="p-4">{meeting.participants}</td>
                    <td className="p-4">{meeting.hours}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(meeting)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(meeting.id)}>
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

export default MeetingDetails;
