import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const UserDailyUpdates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [workDescription, setWorkDescription] = useState('');

  const { data: updates, isLoading } = useQuery({
    queryKey: ['user-daily-updates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academy_daily_work_updates')
        .select('*')
        .eq('employee_id', user?.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (description: string) => {
      const { error } = await supabase
        .from('academy_daily_work_updates')
        .insert({
          employee_id: user?.id,
          work_description: description,
          date: new Date().toISOString().split('T')[0],
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-daily-updates'] });
      toast.success('Daily update submitted successfully');
      setOpen(false);
      setWorkDescription('');
    },
    onError: () => {
      toast.error('Failed to submit daily update');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDescription.trim()) {
      toast.error('Please enter work description');
      return;
    }
    createMutation.mutate(workDescription);
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daily Work Updates</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Update
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Daily Work Update</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Work Description</Label>
                <Textarea
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Describe your work for today..."
                  rows={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting...' : 'Submit Update'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S. No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Work Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates && updates.length > 0 ? (
              updates.map((update, index) => (
                <TableRow key={update.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{new Date(update.date).toLocaleDateString()}</TableCell>
                  <TableCell>{update.work_description}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No daily updates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserDailyUpdates;
