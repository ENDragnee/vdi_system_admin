"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { NotificationItem } from "@/components/notification/notification-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCheck, Loader2, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationHistoryPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications-full"],
    queryFn: async () => (await axios.get("/api/notifications?limit=50")).data,
  });

  const markAllRead = useMutation({
    mutationFn: () => axios.put("/api/notifications"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-mini"] });
    },
  });

  // NEW: Delete All Logic
  const deleteAll = useMutation({
    mutationFn: () => axios.delete("/api/notifications"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-mini"] });
    },
  });

  const markSingleRead = useMutation({
    mutationFn: (id: string) => axios.put(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-full"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-mini"] });
    },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Bell className="text-primary w-10 h-10" /> Notifications
          </h1>
          <p className="text-muted-foreground font-medium text-sm uppercase tracking-widest">
            System audit trail and resource alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={isLoading || data?.unreadCount === 0}
            className="rounded-xl border-border/60 hover:bg-primary/5 transition-all text-xs font-bold uppercase"
          >
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
          </Button>

          {/* NEW: Permanent Clear Button */}
          <Button
            variant="outline"
            onClick={() => confirm("Permanently delete all notifications?") && deleteAll.mutate()}
            disabled={isLoading || data?.data?.length === 0}
            className="rounded-xl border-border/60 hover:bg-destructive/5 hover:text-destructive transition-all text-xs font-bold uppercase"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear History
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-md overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/30 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-[10px] font-black uppercase opacity-50 tracking-widest">Recent Events</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-24 gap-4">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
              <span className="text-[10px] font-bold uppercase opacity-40">Loading Archive...</span>
            </div>
          ) : data?.data.length === 0 ? (
            <div className="p-24 text-center text-muted-foreground italic">No notifications recorded.</div>
          ) : (
            <div className="divide-y divide-border/20">
              {data.data.map((n: any) => (
                <NotificationItem
                  key={n.id}
                  notif={n}
                  onMarkRead={(id) => markSingleRead.mutate(id)}
                  onClick={() => !n.isRead && markSingleRead.mutate(n.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
