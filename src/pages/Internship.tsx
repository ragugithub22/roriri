import { useState } from "react";
import { LayoutDashboard, Users, MessageSquare, BookOpen, CreditCard, FileText, MessageCircle } from "lucide-react";
import CandidatePage from "./internship/CandidatePage";
import EnquiryPage from "./internship/EnquiryPage";
import CoursePage from "./internship/CoursePage";
import PaymentReportPage from "./internship/PaymentReportPage";
import IDCardPage from "./internship/IDCardPage";
import ChatBoxPage from "./internship/ChatBoxPage";
import InternshipDashboard from "./internship/InternshipDashboard";
import { cn } from "@/lib/utils";

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
      <aside className="w-64 border-r border-border bg-background">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Internship</h2>
        </div>
        <nav className="p-2">
          {internshipItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  activeItem === item.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/50 text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 p-6 overflow-auto">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default Internship;
