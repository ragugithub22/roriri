import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, User, BookOpen, FileText, ClipboardList, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserDashboardHome from "./user/UserDashboardHome";
import UserProfile from "./user/UserProfile";
import UserSubjects from "./user/UserSubjects";
import UserApplications from "./user/UserApplications";
import UserDailyUpdates from "./user/UserDailyUpdates";
import UserComplaints from "./user/UserComplaints";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
  { id: "subjects", label: "Subject", icon: BookOpen },
  { id: "applications", label: "Application", icon: FileText },
  { id: "daily-updates", label: "Daily Update", icon: ClipboardList },
  { id: "complaints", label: "Complaint", icon: MessageSquare },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeItem, setActiveItem] = useState("dashboard");

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const renderActiveComponent = () => {
    switch (activeItem) {
      case "dashboard":
        return <UserDashboardHome />;
      case "profile":
        return <UserProfile />;
      case "subjects":
        return <UserSubjects />;
      case "applications":
        return <UserApplications />;
      case "daily-updates":
        return <UserDailyUpdates />;
      case "complaints":
        return <UserComplaints />;
      default:
        return <UserDashboardHome />;
    }
  };

  return (
    <SidebarProvider>
      <UserDashboardContent
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        renderActiveComponent={renderActiveComponent}
        handleLogout={handleLogout}
      />
    </SidebarProvider>
  );
};

const UserDashboardContent = ({
  activeItem,
  setActiveItem,
  renderActiveComponent,
  handleLogout,
}: {
  activeItem: string;
  setActiveItem: (item: string) => void;
  renderActiveComponent: () => React.ReactNode;
  handleLogout: () => void;
}) => {
  const sidebar = useSidebar();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="h-[73px] border-b bg-gradient-to-b from-blue-600 to-blue-700 flex items-center px-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-white shrink-0" />
            {sidebar.open && <h1 className="text-lg font-bold text-white">User Dashboard</h1>}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveItem(item.id)}
                      className={`hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white ${
                        activeItem === item.id ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold" : ""
                      }`}
                      isActive={activeItem === item.id}
                      tooltip={item.label}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex-1">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">
            {sidebarItems.find(item => item.id === activeItem)?.label || "Dashboard"}
          </h1>
        </header>
        <div className="flex-1 p-6">
          {renderActiveComponent()}
        </div>
      </SidebarInset>
    </div>
  );
};

export default UserDashboard;
