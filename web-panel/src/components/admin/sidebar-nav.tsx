'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { NavItem } from '@/lib/nav-config';

interface SidebarNavProps {
  title: string;
  items: NavItem[];
}

export function SidebarNav({ title, items }: SidebarNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userPermissions = session?.user?.permissions || [];

  const accessibleItems = items.filter(
    (item) => !item.requiredPermission || userPermissions.includes(item.requiredPermission)
  );

  if (accessibleItems.length === 0) {
    return null;
  }

  return (
    <nav className="px-4 py-4 space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-3">
        {title}
      </p>
      {accessibleItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
            pathname.startsWith(item.href) // Use startsWith for nested routes
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
  );
}
