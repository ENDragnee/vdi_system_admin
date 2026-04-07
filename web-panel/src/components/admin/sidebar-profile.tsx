'use client';

import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function SidebarProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="p-4 border-t border-border animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-muted rounded"></div>
            <div className="w-32 h-3 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border space-y-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={session?.user?.image || ''} />
          <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm text-foreground truncate">{session?.user?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full justify-start gap-3 text-foreground hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => signOut({ callbackUrl: '/auth' })}
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </Button>
    </div>
  );
}
