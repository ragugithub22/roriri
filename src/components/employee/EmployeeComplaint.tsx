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

interface ComplaintData {
  id: string;
  date: string;
  complaint_to: string | null;
  complaint_text: string;
  status: string | null;
  reply: string | null;
}

interface EmployeeData {
  id: string;
  full_name: string;
}

interface EmployeeComplaintProps {
  userId: string;
}

export default function EmployeeComplaint({ userId }: EmployeeComplaintProps) {
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [savingComplaint, setSavingComplaint] = useState(false);
  const [complaintFormData, setComplaintFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    complaint_to: '',
    complaint_text: ''
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Fetch complaints for this employee
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('academy_complaints')
        .select('id, date, complaint_to, complaint_text, status, reply')
        .eq('complaint_from', userId)
        .order('date', { ascending: false });

      if (!complaintsError && complaintsData) {
        setComplaints(complaintsData as ComplaintData[]);
      }

      // Fetch employees with Admin, Manager, HR, or Trainer roles
      const { data: recipientsData, error: recipientsError } = await supabase
        .rpc('get_complaint_recipients');

      if (!recipientsError && recipientsData) {
        const filteredEmployees = recipientsData.map((emp: any) => ({
          id: emp.employee_id,
          full_name: emp.full_name
        }));
        setEmployees(filteredEmployees);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComplaint = async () => {
    if (!userId) {
      toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
      return;
    }

    if (!complaintFormData.complaint_to) {
      toast({ title: 'Error', description: 'Please select complaint recipient', variant: 'destructive' });
      return;
    }

    if (!complaintFormData.complaint_text.trim()) {
      toast({ title: 'Error', description: 'Please enter complaint details', variant: 'destructive' });
      return;
    }

    setSavingComplaint(true);
    try {
      const { data, error } = await supabase
        .from('academy_complaints')
        .insert({
          complaint_from: userId,
          complaint_to: complaintFormData.complaint_to,
          complaint_text: complaintFormData.complaint_text,
          date: complaintFormData.date,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setComplaints(prev => [data as ComplaintData, ...prev]);
      setShowComplaintModal(false);
      setComplaintFormData({
        date: new Date().toISOString().split('T')[0],
        complaint_to: '',
        complaint_text: ''
      });
      toast({ title: 'Success', description: 'Complaint submitted successfully' });
    } catch (error: any) {
      console.error('Error saving complaint:', error);
      toast({ title: 'Error', description: error.message || 'Failed to submit complaint', variant: 'destructive' });
    } finally {
      setSavingComplaint(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Loading complaints...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Complaints</CardTitle>
          <Dialog open={showComplaintModal} onOpenChange={setShowComplaintModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Complaint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="complaint-date">Date</Label>
                  <Input
                    id="complaint-date"
                    type="date"
                    value={complaintFormData.date}
                    onChange={(e) => setComplaintFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-to">Complaint To</Label>
                  <Select
                    value={complaintFormData.complaint_to}
                    onValueChange={(value) => setComplaintFormData(prev => ({ ...prev, complaint_to: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-text">Complaint</Label>
                  <Textarea
                    id="complaint-text"
                    placeholder="Describe your complaint..."
                    value={complaintFormData.complaint_text}
                    onChange={(e) => setComplaintFormData(prev => ({ ...prev, complaint_text: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowComplaintModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveComplaint} disabled={savingComplaint}>
                    {savingComplaint ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {complaints.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Complaint To</TableHead>
                <TableHead>Complaint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reply</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint, index) => (
                <TableRow key={complaint.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{complaint.date}</TableCell>
                  <TableCell>
                    {employees.find(e => e.id === complaint.complaint_to)?.full_name || 'Unknown'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{complaint.complaint_text}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      complaint.status === 'resolved' 
                        ? 'bg-green-100 text-green-800'
                        : complaint.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {complaint.status || 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {complaint.reply || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No complaints found. Click "Add Complaint" to submit one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
