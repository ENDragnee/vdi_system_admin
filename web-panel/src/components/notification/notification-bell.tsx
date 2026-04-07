"use client";

import { Bell, ListChecks, CheckCheck } from "lucide-react";
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
    refetchInterval: 30000,
  });

  const markAllRead = useMutation({
    mutationFn: () => axios.put("/api/notifications"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-mini"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
    },
  });

  const markSingleRead = useMutation({
    mutationFn: (id: string) => axios.put(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-mini"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors rounded-xl">
          <Bell className="w-5 h-5" />
          {data?.unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-border/50 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/40">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Live Alerts</span>
          <Button
            variant="ghost"
            className="text-[10px] h-6 px-2 font-bold uppercase hover:text-primary transition-colors flex items-center gap-1"
            onClick={(e) => {
              e.preventDefault();
              markAllRead.mutate();
            }}
            disabled={markAllRead.isPending || data?.unreadCount === 0}
          >
            <CheckCheck className="w-3 h-3" />
            {markAllRead.isPending ? "Updating..." : "Mark Read"}
          </Button>
        </div>
        <div className="max-h-[350px] overflow-y-auto divide-y divide-border/10">
          {data?.data.length === 0 ? (
            <div className="p-12 text-center text-[10px] font-bold uppercase text-muted-foreground tracking-widest opacity-40">
              System Clear
            </div>
          ) : (
            data?.data.map((n: any) => (
              <NotificationItem
                key={n.id}
                notif={n}
                onMarkRead={(id) => markSingleRead.mutate(id)}
              />
            ))
          )}
        </div>
        <Link
          href="/admin/notifications"
          className="flex items-center justify-center gap-2 p-3 text-[10px] font-black uppercase tracking-widest hover:bg-muted border-t transition-colors text-muted-foreground hover:text-primary"
        >
          <ListChecks className="w-3 h-3" />
          View All History
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
