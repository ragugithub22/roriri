import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const IndustrialVisitEnquiry = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Industrial Visit Enquiry</h1>
          <p className="text-muted-foreground mt-1">
            Manage industrial visit enquiries and requests
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">
          Enquiry management functionality coming soon...
        </p>
      </div>
    </div>
  );
};

export default IndustrialVisitEnquiry;
