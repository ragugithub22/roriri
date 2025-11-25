import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2 } from "lucide-react";

export default function IDCardPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [idCardNumber, setIdCardNumber] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const queryClient = useQueryClient();

  // Fetch all candidates
  const { data: candidates } = useQuery({
    queryKey: ['internship-candidates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('internship_candidates')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch all ID cards
  const { data: idCards, isLoading } = useQuery({
    queryKey: ['internship-id-cards'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('internship_id_cards')
        .select(`
          *,
          internship_candidates(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { id_card_number: string; candidate_id: string }) => {
      if (editingId) {
        const { error } = await (supabase as any)
          .from('internship_id_cards')
          .update(data)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('internship_id_cards')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internship-id-cards'] });
      toast.success(editingId ? 'ID card updated successfully' : 'ID card assigned successfully');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to save ID card: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('internship_id_cards')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internship-id-cards'] });
      toast.success('ID card deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete ID card: ${error.message}`);
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setIdCardNumber("");
    setSelectedCandidateId("");
  };

  const handleEdit = (idCard: any) => {
    setEditingId(idCard.id);
    setIdCardNumber(idCard.id_card_number);
    setSelectedCandidateId(idCard.candidate_id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardNumber.trim() || !selectedCandidateId) {
      toast.error('Please fill all fields');
      return;
    }
    saveMutation.mutate({
      id_card_number: idCardNumber.trim(),
      candidate_id: selectedCandidateId,
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ID Card Details</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setIdCardNumber(""); setSelectedCandidateId(""); }}>
                Assign ID
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit ID Card' : 'Assign ID Card'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="id-card-number">ID Card Number</Label>
                  <Input
                    id="id-card-number"
                    value={idCardNumber}
                    onChange={(e) => setIdCardNumber(e.target.value)}
                    placeholder="Enter ID card number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate">Intern/Candidate Name</Label>
                  <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId} required>
                    <SelectTrigger id="candidate">
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates?.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Assign'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S.No</TableHead>
                    <TableHead>ID Card</TableHead>
                    <TableHead>Intern Name</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {idCards && idCards.length > 0 ? (
                    idCards.map((idCard, index) => (
                      <TableRow key={idCard.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{idCard.id_card_number}</TableCell>
                        <TableCell>{idCard.internship_candidates?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(idCard)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(idCard.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No ID cards assigned yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
