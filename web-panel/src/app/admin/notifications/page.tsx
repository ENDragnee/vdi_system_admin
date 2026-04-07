"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { NotificationItem } from "@/components/notification/notification-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationHistoryPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications-full"],
    queryFn: async () => (await axios.get("/api/notifications?limit=50")).data,
  });

  const markRead = useMutation({
    mutationFn: () => axios.put("/api/notifications"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications-full"] }),
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Bell className="text-primary w-10 h-10" /> Notifications
          </h1>
          <p className="text-muted-foreground font-medium text-sm uppercase tracking-widest">
            Audit history and resource alerts
          </p>
        </div>
        <Button variant="outline" onClick={() => markRead.mutate()} disabled={isLoading || data?.unreadCount === 0}>
          <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
        </Button>
      </div>

      <Card className="border-0 shadow-xl bg-card/50 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-xs font-black uppercase opacity-50 tracking-widest">Recent Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : data?.data.length === 0 ? (
            <div className="p-20 text-center text-muted-foreground italic">No notifications found.</div>
          ) : (
            data.data.map((n: any) => (
              <NotificationItem key={n.id} notif={n} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
