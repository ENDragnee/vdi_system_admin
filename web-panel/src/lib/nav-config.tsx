// @/lib/nav-config.ts
import {
  LayoutDashboard,
  Users,
  Server,
  Activity,
  HardDrive,
  BookOpen,
  Library,
  Settings,
} from "lucide-react";
import { ReactNode } from "react";

export interface NavItem {
  name: string;
  href: string;
  icon: ReactNode;
  requiredPermission?: string; // We link permissions to routes
  badge?: string;
}

export const adminNavConfig: NavItem[] = [
  {
    name: "Overview",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    requiredPermission: "dashboard.view",
  },
  {
    name: "Faculty Management",
    href: "/admin/faculty-management",
    icon: <Users className="w-5 h-5" />,
    requiredPermission: "faculty.manage",
  },
  {
    name: "Instance Management",
    href: "/admin/instances",
    icon: <Server className="w-5 h-5" />,
    requiredPermission: "vm.view",
  },
  {
    name: "Lab Management",
    href: "/admin/labs",
    icon: <Library className="w-5 h-5" />,
    requiredPermission: "lab.view",
  },
  {
    name: "Package Management",
    href: "/admin/packages",
    icon: <HardDrive className="w-5 h-5" />,
    requiredPermission: "packages.manage",
  },
  {
    name: "Live Metrics",
    href: "/admin/metrics",
    icon: <Activity className="w-5 h-5" />,
    requiredPermission: "metrics.view",
  },
  {
    name: "System Logs",
    href: "/admin/logs",
    icon: <Activity className="w-5 h-5" />,
    requiredPermission: "logs.view",
  },
];

export const facultyNavConfig: NavItem[] = [
  {
    name: "Faculty Panel",
    href: "/faculty/dashboard",
    icon: <BookOpen className="w-5 h-5" />,
    requiredPermission: "faculty.dashboard.view",
  },
];

export const settingsNavConfig: NavItem[] = [
  {
    name: "Settings",
    href: "/admin/settings",
    icon: <Settings className="w-5 h-5" />,
    requiredPermission: "settings.manage",
  },
];
