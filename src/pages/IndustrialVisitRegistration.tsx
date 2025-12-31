import { useState } from "react";
import { useParams } from "react-router-dom";
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
import { CheckCircle } from "lucide-react";

type VisitType = "normal_visit" | "industrial_visit" | "interview" | "others" | "";

interface FormData {
  date: string;
  visit_type: VisitType;
  full_name: string;
  reason: string;
  address: string;
  college_name: string;
  department: string;
  mobile: string;
  email: string;
  amount: string; // keep as string for input
}

export default function IndustrialVisitRegistration() {
  const { visitorId } = useParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    visit_type: "",
    full_name: "",
    reason: "",
    address: "",
    college_name: "",
    department: "",
    mobile: "",
    email: "",
    amount: "",
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
    mutationFn: async (data: FormData) => {
      // Use visitor record ID from URL if available (for industrial visits via QR)
      // For other visit types, we don't link to a master record
      const resolvedVisitorRecordId: string | null = visitorId || null;

      // Insert the registration directly - RLS allows anonymous inserts
      const { error } = await supabase
        .from("industrial_visit_registrations")
        .insert([{
          full_name: data.full_name,
          mobile: data.mobile || "N/A",
          email: data.email || null,
          visitor_type: data.visit_type,
          purpose_of_visit: data.reason || `${data.visit_type} visit`,
          whom_to_see: null,
          visitor_record_id: resolvedVisitorRecordId,
          address: data.address || null,
          college_name: data.college_name || null,
          department: data.department || null,
          reason: data.reason || null,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registration submitted successfully!");
      setIsSubmitted(true);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        visit_type: "",
        full_name: "",
        reason: "",
        address: "",
        college_name: "",
        department: "",
        mobile: "",
        email: "",
        amount: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to submit registration");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visit_type) {
      toast.error("Please select a visit type");
      return;
    }
    registerMutation.mutate(formData);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderTypeSpecificFields = () => {
    switch (formData.visit_type) {
      case "normal_visit":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="full_name">Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={2}
                required
              />
            </div>
          </>
        );

      case "industrial_visit":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="full_name">Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="college_name">College Name *</Label>
              <Input
                id="college_name"
                value={formData.college_name}
                onChange={(e) => handleChange("college_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
              />
            </div>
          </>
        );

      case "interview":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="full_name">Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={2}
                required
              />
            </div>
          </>
        );

      case "others":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="full_name">Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Purpose of Visit *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                rows={3}
                required
              />
            </div>
          </>
        );

      default:
        return null;
    }
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
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Visitor Registration</h1>
            <p className="text-sm text-muted-foreground">
              Please fill in your details to register your visit
            </p>
          </div>

          {visitorRecord && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                College: <span className="font-semibold text-foreground">{visitorRecord.college_name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Department: <span className="font-semibold text-foreground">{visitorRecord.department}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Date: <span className="font-semibold text-foreground">{new Date(visitorRecord.date).toLocaleDateString()}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visit_type">Type *</Label>
                <Select
                  value={formData.visit_type}
                  onValueChange={(value: VisitType) => handleChange("visit_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal_visit">Normal Visit</SelectItem>
                    <SelectItem value="industrial_visit">Industrial Visit</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderTypeSpecificFields()}

            {formData.visit_type && (
              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Submitting..." : "Submit Registration"}
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
