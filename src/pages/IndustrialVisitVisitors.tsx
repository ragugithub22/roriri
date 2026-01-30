import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye, ArrowLeft, IndianRupee } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface IndustrialVisitRegistration {
  id: string;
  full_name: string;
  mobile: string;
  email: string | null;
  college_name: string | null;
  department: string | null;
  address: string | null;
  visitor_type: string;
  purpose_of_visit: string;
  created_at: string | null;
  payment_amount: number | null;
}

interface GroupedVisit {
  date: string;
  college_name: string | null;
  address: string | null;
  visitor_type: string;
  count: number;
  total_payment: number;
  ids: string[];
}

interface IndustrialVisitVisitorsProps {
  onNavigate?: (path: string) => void;
  onViewGroup?: (date: string, collegeName: string | null, address: string | null) => void;
}

export default function IndustrialVisitVisitors({ onNavigate, onViewGroup }: IndustrialVisitVisitorsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedVisit | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: visitors = [] } = useQuery({
    queryKey: ["industrial-visit-registrations-only"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("industrial_visit_registrations")
        .select("*")
        .eq("visitor_type", "industrial_visit")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as IndustrialVisitRegistration[];
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ ids, amount }: { ids: string[]; amount: number }) => {
      const { error } = await supabase
        .from("industrial_visit_registrations")
        .update({ payment_amount: amount } as any)
        .in("id", ids);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industrial-visit-registrations-only"] });
      toast({ title: "Payment updated successfully" });
      setIsPaymentDialogOpen(false);
      setPaymentAmount("");
      setSelectedGroup(null);
    },
    onError: (error) => {
      toast({ title: "Error updating payment", description: error.message, variant: "destructive" });
    },
  });

  // Group visitors by date, college_name, and address
  const groupedVisitors: GroupedVisit[] = visitors.reduce((acc: GroupedVisit[], visitor) => {
    const date = visitor.created_at ? new Date(visitor.created_at).toLocaleDateString() : "-";
    const existingGroup = acc.find(
      g => g.date === date && 
           g.college_name === visitor.college_name && 
           g.address === visitor.address
    );
    
    if (existingGroup) {
      existingGroup.count++;
      existingGroup.total_payment += visitor.payment_amount || 0;
      existingGroup.ids.push(visitor.id);
    } else {
      acc.push({
        date,
        college_name: visitor.college_name,
        address: visitor.address,
        visitor_type: visitor.visitor_type,
        count: 1,
        total_payment: visitor.payment_amount || 0,
        ids: [visitor.id],
      });
    }
    return acc;
  }, []);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate("/industrial-visit");
    }
  };

  const handleView = (group: GroupedVisit) => {
    if (onViewGroup) {
      onViewGroup(group.date, group.college_name, group.address);
    }
  };

  const handleAddPayment = (group: GroupedVisit) => {
    setSelectedGroup(group);
    setPaymentAmount(group.total_payment > 0 ? group.total_payment.toString() : "");
    setIsPaymentDialogOpen(true);
  };

  const handleSavePayment = () => {
    if (!selectedGroup || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount < 0) {
      toast({ title: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    updatePaymentMutation.mutate({ ids: selectedGroup.ids, amount });
  };

  const filteredVisitors = groupedVisitors.filter((group) =>
    (group.college_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (group.address?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Industrial Visit</h1>
            <p className="text-muted-foreground mt-2">Manage industrial visit registrations</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Search:</span>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S. No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Visitor Type</TableHead>
                <TableHead>College Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitors.map((group, index) => (
                  <TableRow key={`${group.date}-${group.college_name}-${group.address}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{group.date}</TableCell>
                    <TableCell>{group.visitor_type?.replace("_", " ") || "-"}</TableCell>
                    <TableCell>{group.college_name || "-"}</TableCell>
                    <TableCell>{group.address || "-"}</TableCell>
                    <TableCell>
                      {group.total_payment > 0 ? `₹${group.total_payment.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(group)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddPayment(group)}
                          title="Add Payment"
                        >
                          <IndianRupee className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing {filteredVisitors.length > 0 ? 1 : 0} to {filteredVisitors.length} of {filteredVisitors.length} entries</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Prev</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>College Name</Label>
              <Input value={selectedGroup?.college_name || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input value={selectedGroup?.date || "-"} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePayment} disabled={updatePaymentMutation.isPending}>
              {updatePaymentMutation.isPending ? "Saving..." : "Save Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
