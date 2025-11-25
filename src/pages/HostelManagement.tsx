import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HostelManagement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Hostel Management</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl py-8 px-6">
        <Card>
          <CardHeader>
            <CardTitle>Hostel Management System</CardTitle>
            <CardDescription>Manage hostel rooms, residents, and facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              Hostel management features coming soon...
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
