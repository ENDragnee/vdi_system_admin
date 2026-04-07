"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Bell,
  CheckCheck,
  Loader2,
  Inbox,
  Filter,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NotificationItem } from "@/components/notification/notification-item";

export default function FacultyNotificationsPage() {
  const queryClient = useQueryClient();
  const [filterUnread, setFilterUnread] = useState(false);

  // 1. Fetch scoped notifications (BFF handles the labId filter)
  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["faculty-notifications"],
    queryFn: async () => (await axios.get("/api/notifications?limit=50")).data,
    refetchInterval: 60000, // Refresh every minute
  });

  // 2. Mutation: Mark All Read
  const markAllRead = useMutation({
    mutationFn: () => axios.put("/api/notifications"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty-notifications"] }),
  });

  // 3. Mutation: Mark Single Read (Triggered when clicking an item)
  const markSingleRead = useMutation({
    mutationFn: (id: string) => axios.put(`/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty-notifications"] }),
  });

  const notifications = data?.data || [];
  const filteredNotifs = filterUnread
    ? notifications.filter((n: any) => !n.isRead)
    : notifications;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Bell className="text-primary w-10 h-10" /> Alerts & Tasks
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest mt-1">
            Activity and performance audit for your assigned laboratory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-bold text-xs uppercase h-10"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || data?.unreadCount === 0}
          >
            {markAllRead.isPending ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : <CheckCheck className="h-3 w-3 mr-2" />}
            Clear Unread
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["faculty-notifications"] })}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-2xl w-fit border">
        <Button
          variant={!filterUnread ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilterUnread(false)}
          className="rounded-xl text-[10px] font-black uppercase px-6"
        >
          All Events
        </Button>
        <Button
          variant={filterUnread ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilterUnread(true)}
          className="rounded-xl text-[10px] font-black uppercase px-6"
        >
          Unread ({data?.unreadCount || 0})
        </Button>
      </div>

      {/* Main List */}
      <Card className="border-0 shadow-xl bg-card/40 backdrop-blur-md overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <CardTitle className="text-[10px] font-black uppercase opacity-50 tracking-widest">
              Notification Stream
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
              <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Fetching Alerts...</p>
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-muted-foreground opacity-20" />
              </div>
              <h3 className="font-bold text-lg">All caught up!</h3>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                {filterUnread ? "You have no unread notifications." : "There are no events recorded for your lab yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredNotifs.map((n: any) => (
                <NotificationItem
                  key={n.id}
                  notif={n}
                  onClick={() => !n.isRead && markSingleRead.mutate(n.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 opacity-30">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="text-[9px] font-black uppercase tracking-widest">End of Feed</span>
      </div>
    </div>
  );
}
