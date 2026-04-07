"use client";

import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./notification-item";
import Link from "next/link";

export function NotificationBell() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications-mini"],
    queryFn: async () => (await axios.get("/api/notifications?limit=5")).data,
    refetchInterval: 30000, // Poll every 30s
  });

  const markAllRead = useMutation({
    mutationFn: () => axios.put("/api/notifications"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications-mini"] }),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
          <Bell className="w-5 h-5" />
          {data?.unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-border/50">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <span className="text-xs font-black uppercase tracking-widest">Alerts</span>
          <Button variant="ghost" className="text-[10px] h-6 px-2" onClick={() => markAllRead.mutate()}>
            Mark Read
          </Button>
        </div>
        <div className="max-h-[350px] overflow-y-auto">
          {data?.data.length === 0 ? (
            <div className="p-10 text-center text-xs text-muted-foreground italic">Clean slate. No alerts.</div>
          ) : (
            data?.data.map((n: any) => <NotificationItem key={n.id} notif={n} />)
          )}
        </div>
        <Link href="/admin/notifications" className="block p-3 text-center text-[10px] font-bold uppercase tracking-tighter hover:bg-muted border-t">
          View Full History
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
