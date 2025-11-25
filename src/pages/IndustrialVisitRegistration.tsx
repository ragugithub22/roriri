import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function IndustrialVisitRegistration() {
  const { visitorId } = useParams();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    email: "",
    visitor_type: "",
    whom_to_see: "",
    purpose_of_visit: "",
  });

  const { data: visitorRecord } = useQuery({
    queryKey: ["visitor-record", visitorId],
    queryFn: async () => {
      if (!visitorId) return null;
      const { data, error } = await supabase
        .from("industrial_visit_visitors")
        .select("*")
        .eq("id", visitorId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!visitorId,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("industrial_visit_registrations")
        .insert([{ ...data, visitor_record_id: visitorId || null }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registration submitted successfully!");
      setIsSubmitted(true);
      setFormData({
        full_name: "",
        mobile: "",
        email: "",
        visitor_type: "",
        whom_to_see: "",
        purpose_of_visit: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to submit registration");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for registering. Your information has been submitted successfully.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="w-full"
            >
              Register Another Visitor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Industrial Visit Registration</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Please fill in your details to register for the industrial visit
          </p>
          {visitorRecord && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">College: <span className="font-semibold text-foreground">{visitorRecord.college_name}</span></p>
              <p className="text-sm text-muted-foreground">Department: <span className="font-semibold text-foreground">{visitorRecord.department}</span></p>
              <p className="text-sm text-muted-foreground">Date: <span className="font-semibold text-foreground">{new Date(visitorRecord.date).toLocaleDateString()}</span></p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitor_type">Visitor Type *</Label>
                <Select
                  value={formData.visitor_type}
                  onValueChange={(value) => setFormData({ ...formData, visitor_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Faculty">Faculty</SelectItem>
                    <SelectItem value="Guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whom_to_see">Whom to See (Optional)</Label>
                <Input
                  id="whom_to_see"
                  value={formData.whom_to_see}
                  onChange={(e) => setFormData({ ...formData, whom_to_see: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose_of_visit">Purpose of Visit *</Label>
              <Textarea
                id="purpose_of_visit"
                value={formData.purpose_of_visit}
                onChange={(e) => setFormData({ ...formData, purpose_of_visit: e.target.value })}
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
