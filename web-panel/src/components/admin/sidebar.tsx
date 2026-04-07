// @/components/admin/sidebar.tsx
'use client';

import { useSession } from "next-auth/react";
import Link from 'next/link';
import { Server } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SidebarProfile } from './sidebar-profile';
import { SidebarNav } from './sidebar-nav';
import { NotificationBell } from '../notification/notification-bell';
import { adminNavConfig, facultyNavConfig } from '@/lib/nav-config';

export function Sidebar() {
  const { data: session } = useSession();

  const isAdmin = session?.user?.role?.includes("ADMIN");
  const isFaculty = session?.user?.role?.includes("FACULTY");
  const hasLab = !!session?.user?.labId;

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
            <Server className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">VDS Admin</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter mt-1 opacity-60">Control Panel</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ONLY show Admin nav if user is Admin */}
        {isAdmin && (
          <SidebarNav title="Administration" items={adminNavConfig} />
        )}

        {/* ONLY show Faculty nav if user is Faculty AND has a labId */}
        {isFaculty && hasLab && (
          <SidebarNav title="Faculty Access" items={facultyNavConfig} />
        )}
      </div>

      <div className="mt-auto bg-muted/20">
        <div className="px-4 py-2 border-t border-border">

          <div className="flex items-center justify-between px-4 py-2 bg-background/50 rounded-xl mb-2 border border-border/50">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">System</span>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <ThemeSwitcher />
            </div>
          </div>
        </div>
        <SidebarProfile />
      </div>
    </aside>
  );
}
