import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface DailyUpdateData {
  id: string;
  date: string;
  work_description: string;
  hours_spent: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

interface EmployeeDailyUpdateProps {
  userId: string;
}

export default function EmployeeDailyUpdate({ userId }: EmployeeDailyUpdateProps) {
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    work_description: '',
    hours_spent: '',
    status: 'in_progress' as 'pending' | 'in_progress' | 'completed'
  });

  useEffect(() => {
    fetchDailyUpdates();
  }, [userId]);

  const fetchDailyUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_work_updates')
        .select('id, date, work_description, hours_spent, status, created_at')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!error && data) {
        setDailyUpdates(data as DailyUpdateData[]);
      }
    } catch (error) {
      console.error('Error fetching daily updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDailyUpdate = async () => {
    if (!userId) {
      toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
      return;
    }

    if (!updateFormData.work_description.trim()) {
      toast({ title: 'Error', description: 'Please enter work description', variant: 'destructive' });
      return;
    }

    if (!updateFormData.hours_spent || parseFloat(updateFormData.hours_spent) <= 0) {
      toast({ title: 'Error', description: 'Please enter valid hours spent', variant: 'destructive' });
      return;
    }

    setSavingUpdate(true);
    try {
      const { data, error } = await supabase
        .from('daily_work_updates')
        .insert({
          user_id: userId,
          date: updateFormData.date,
          work_description: updateFormData.work_description,
          hours_spent: parseFloat(updateFormData.hours_spent),
          status: updateFormData.status
        })
        .select()
        .single();

      if (error) throw error;

      setDailyUpdates(prev => [data as DailyUpdateData, ...prev]);
      setShowUpdateModal(false);
      setUpdateFormData({
        date: new Date().toISOString().split('T')[0],
        work_description: '',
        hours_spent: '',
        status: 'in_progress'
      });
      toast({ title: 'Success', description: 'Daily update saved successfully' });
    } catch (error: any) {
      console.error('Error saving update:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save update', variant: 'destructive' });
    } finally {
      setSavingUpdate(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Loading daily updates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Work Updates</CardTitle>
          <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Daily Update</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="update-date">Date</Label>
                  <Input
                    id="update-date"
                    type="date"
                    value={updateFormData.date}
                    onChange={(e) => setUpdateFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-description">Work Description</Label>
                  <Textarea
                    id="work-description"
                    placeholder="Describe the work you did today..."
                    value={updateFormData.work_description}
                    onChange={(e) => setUpdateFormData(prev => ({ ...prev, work_description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours-spent">Hours Spent</Label>
                  <Input
                    id="hours-spent"
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="e.g., 8"
                    value={updateFormData.hours_spent}
                    onChange={(e) => setUpdateFormData(prev => ({ ...prev, hours_spent: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={updateFormData.status}
                    onValueChange={(value: 'pending' | 'in_progress' | 'completed') => 
                      setUpdateFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDailyUpdate} disabled={savingUpdate}>
                    {savingUpdate ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {dailyUpdates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Work Description</TableHead>
                <TableHead>Hours Spent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyUpdates.map((update, index) => (
                <TableRow key={update.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{new Date(update.date).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{update.work_description}</p>
                  </TableCell>
                  <TableCell>{update.hours_spent} hrs</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      update.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : update.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {update.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No daily updates found. Click "Update" to add your first entry.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
