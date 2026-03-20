'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Server,
  Activity,
  HardDrive,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const adminNav: NavItem[] = [
  {
    name: 'Overview',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'System Logs',
    href: '/admin/logs/system',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    name: 'VM Logs',
    href: '/admin/logs/vm',
    icon: <Server className="w-5 h-5" />,
  },
  {
    name: 'Package Management',
    href: '/admin/packages',
    icon: <HardDrive className="w-5 h-5" />,
  },
  {
    name: 'Live Metrics',
    href: '/admin/metrics',
    icon: <Activity className="w-5 h-5" />,
  },
];

const facultyNav: NavItem[] = [
  {
    name: 'Faculty Panel',
    href: '/faculty',
    icon: <BookOpen className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
            <Server className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">VDS Admin</h1>
            <p className="text-xs text-muted-foreground">Control Panel</p>
          </div>
        </Link>
      </div>

      {/* Admin Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-3">
          Administration
        </p>
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground hover:bg-secondary'
            )}
          >
            {item.icon}
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Faculty Navigation */}
      <nav className="px-4 py-4 space-y-1 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-3">
          Faculty Access
        </p>
        {facultyNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground hover:bg-secondary'
            )}
          >
            {item.icon}
            <span className="flex-1">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Settings and Logout */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-foreground hover:bg-secondary"
          asChild
        >
          <Link href="/admin/settings">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-foreground hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}

