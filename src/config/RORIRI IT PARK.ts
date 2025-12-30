import { LucideIcon, Users, Building2, Briefcase, GraduationCap, Heart, Sprout, ShoppingCart, Factory, Laptop, Plane, BarChart3, Settings, FileText, Shield, LogOut, FileCheck, Home, Package, MessageCircle } from "lucide-react";

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  isLogout?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/it-park",
    icon: Home
  },
  {
    label: "Roles",
    path: "/roles",
    icon: Shield,
    adminOnly: true
  },
  {
    label: "Departments",
    path: "/departments",
    icon: Building2,
    adminOnly: true
  },
  {
    label: "Employees",
    path: "/employees",
    icon: Users,
    adminOnly: true
  },
  {
    label: "MOU",
    path: "/mou",
    icon: FileCheck,
    adminOnly: true
  },
  {
    label: "Hostel",
    path: "/hostel",
    icon: Home,
    adminOnly: true
  },
  {
    label: "Asset Management",
    path: "/asset-management",
    icon: Package,
    adminOnly: true
  },
  {
    label: "Entities",
    path: "/entities",
    icon: Building2,
    adminOnly: true
  },
  {
    label: "Letter",
    path: "/letters",
    icon: FileText,
    adminOnly: true
  },
  {
    label: "Chat Box",
    path: "/chat",
    icon: MessageCircle,
    adminOnly: true
  },
  {
    label: "Visitors",
    path: "/industrial-visit",
    icon: Briefcase,
    adminOnly: true
  },
  {
    label: "IT Academy",
    path: "/it-academy",
    icon: GraduationCap
  },
  {
    label: "Foundation",
    path: "/foundation",
    icon: Heart
  },
  {
    label: "Farm",
    path: "/farm",
    icon: Sprout
  },
  {
    label: "Consultancy",
    path: "/consultancy",
    icon: Briefcase
  },
  {
    label: "Tours & Travels",
    path: "/tours-travels",
    icon: Plane
  },
  {
    label: "Builders",
    path: "/builders",
    icon: Factory
  },
  {
    label: "Logout",
    path: "/logout",
    icon: LogOut,
    isLogout: true
  }
];
