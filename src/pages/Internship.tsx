import { useState } from "react";
import { LayoutDashboard, Users, MessageSquare, BookOpen, CreditCard, FileText, MessageCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CandidatePage from "./internship/CandidatePage";
import EnquiryPage from "./internship/EnquiryPage";
import CoursePage from "./internship/CoursePage";
import PaymentReportPage from "./internship/PaymentReportPage";
import IDCardPage from "./internship/IDCardPage";
import ChatBoxPage from "./internship/ChatBoxPage";
import InternshipDashboard from "./internship/InternshipDashboard";

const internshipItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "candidate", label: "Candidate", icon: Users },
  { id: "enquiry", label: "Enquiry", icon: MessageSquare },
  { id: "course", label: "Course", icon: BookOpen },
  { id: "payment-report", label: "Payment Report", icon: CreditCard },
  { id: "id-card", label: "ID Card Details", icon: FileText },
  { id: "chat", label: "Chat Box", icon: MessageCircle },
];

const Internship = () => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const renderActiveComponent = () => {
    switch (activeItem) {
      case "dashboard":
        return <InternshipDashboard />;
      case "candidate":
        return <CandidatePage />;
      case "enquiry":
        return <EnquiryPage />;
      case "course":
        return <CoursePage />;
      case "payment-report":
        return <PaymentReportPage />;
      case "id-card":
        return <IDCardPage />;
      case "chat":
        return <ChatBoxPage />;
      default:
        return <InternshipDashboard />;
    }
  };

  return (
    <div className="flex h-full w-full">
      <Sidebar className="border-l">
        <SidebarHeader>
          <div className="px-2">
            <h2 className="text-lg font-semibold">Internship</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel></SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {internshipItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveItem(item.id)}
                        className="w-full"
                        isActive={activeItem === item.id}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex-1 p-6">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default Internship;
