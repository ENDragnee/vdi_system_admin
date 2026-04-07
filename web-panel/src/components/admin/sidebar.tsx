// components/admin/sidebar.tsx
import Link from 'next/link';
import { Server } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SidebarProfile } from './sidebar-profile';
import { SidebarNav } from './sidebar-nav';
import { adminNavConfig, facultyNavConfig } from '@/lib/nav-config';
import { NotificationBell } from '../notification/notification-bell';
export function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
            <Server className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">VDS Admin</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter mt-1 opacity-60">Control Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* These components will only render links the user has permission for */}
        <SidebarNav title="Administration" items={adminNavConfig} />
        <SidebarNav title="Faculty Access" items={facultyNavConfig} />
      </div>

      {/* Footer Section */}
      <div className="mt-auto bg-muted/20">
        <div className="px-4 py-2 border-t border-border">
          <div className="flex items-center justify-between px-4 py-2 bg-background/50 rounded-lg mb-2 border border-border/50">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Theme</span>
            <NotificationBell />
            <ThemeSwitcher />
          </div>
        </div>
        <SidebarProfile />
      </div>
    </aside>
  );
}
