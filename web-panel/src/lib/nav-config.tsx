// @/lib/nav-config.ts
import {
  LayoutDashboard,
  Users,
  Server,
  Activity,
  HardDrive,
  Library,
  Laptop,
  History,
  Bell
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
    name: "Live Metrics",
    href: "/admin/metrics",
    icon: <Activity className="w-5 h-5" />,
    requiredPermission: "metrics.view",
  },
  {
    name: "Instance Management",
    href: "/admin/instances",
    icon: <Server className="w-5 h-5" />,
    requiredPermission: "vm.view",
  },
  {
    name: "Package Management",
    href: "/admin/packages",
    icon: <HardDrive className="w-5 h-5" />,
    requiredPermission: "packages.manage",
  },
  {
    name: "Lab Management",
    href: "/admin/labs",
    icon: <Library className="w-5 h-5" />,
    requiredPermission: "lab.view",
  },
  {
    name: "Faculty Management",
    href: "/admin/faculty-management",
    icon: <Users className="w-5 h-5" />,
    requiredPermission: "faculty.manage",
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: <Bell className="w-5 h-5" />,
    requiredPermission: "notifications.view",
  },
  {
    name: "System Logs",
    href: "/admin/logs/system",
    icon: <Activity className="w-5 h-5" />,
    requiredPermission: "logs.view",
  },
  {
    name: "VM Logs",
    href: "/admin/logs/vm",
    icon: <Laptop className="w-5 h-5" />,
    requiredPermission: "logs.view",
  },
];

export const facultyNavConfig: NavItem[] = [
  {
    name: 'Lab Overview',
    href: '/faculty/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    requiredPermission: 'faculty.dashboard.view',
  },
  {
    name: 'My Instances',
    href: '/faculty/instances',
    icon: <Server className="w-5 h-5" />,
    requiredPermission: 'faculty.vm.view',
  },
  {
    name: 'Live Telemetry',
    href: '/faculty/metrics',
    icon: <Activity className="w-5 h-5" />,
    requiredPermission: 'faculty.metrics.view',
  },
  {
    name: 'Lab Analytics',
    href: '/faculty/analytics',
    icon: <History className="w-5 h-5" />,
    requiredPermission: 'faculty.logs.view',
  },
  {
    name: "Alerts & Tasks",
    href: "/faculty/notifications",
    icon: <Bell className="w-5 h-5" />,
    requiredPermission: "notifications.view",
  },
];
