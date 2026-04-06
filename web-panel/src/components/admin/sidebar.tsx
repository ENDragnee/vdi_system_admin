import Link from 'next/link';
import { Server } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SidebarProfile } from './sidebar-profile';
import { SidebarNav } from './sidebar-nav';
import { adminNavConfig, facultyNavConfig, settingsNavConfig } from '@/lib/nav-config';

export function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
            <Server className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">VDS Admin</h1>
            <p className="text-xs text-muted-foreground">Control Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto">
        <SidebarNav title="Administration" items={adminNavConfig} />
        <SidebarNav title="Faculty Access" items={facultyNavConfig} />
      </div>

      {/* Footer / Profile Section */}
      <div className="mt-auto">
        <div className="px-4 py-2 border-t border-border">
          <SidebarNav title="Configuration" items={settingsNavConfig} />
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-xs font-semibold text-muted-foreground">Theme</span>
            <ThemeSwitcher />
          </div>
        </div>
        <SidebarProfile />
      </div>
    </aside>
  );
}
