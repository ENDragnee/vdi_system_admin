"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2, Info, Zap } from "lucide-react";
import Link from "next/link";

export function NotificationItem({ notif, onClick }: { notif: any, onClick?: () => void }) {
  const icons = {
    SUCCESS: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    ERROR: <AlertCircle className="w-4 h-4 text-red-500" />,
    WARNING: <AlertCircle className="w-4 h-4 text-amber-500" />,
    RESOURCE_CRITICAL: <Zap className="w-4 h-4 text-orange-500 animate-pulse" />,
    INFO: <Info className="w-4 h-4 text-blue-500" />,
  };

  const Content = (
    <div className={cn(
      "flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 border-b border-border/50",
      !notif.isRead && "bg-primary/[0.03]"
    )}>
      <div className="mt-1">{icons[notif.type as keyof typeof icons]}</div>
      <div className="flex-1 space-y-1">
        <p className={cn("text-sm leading-none", !notif.isRead ? "font-bold" : "font-medium")}>
          {notif.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
        <p className="text-[10px] uppercase font-black opacity-40">
          {formatDistanceToNow(new Date(notif.createdAt))} ago
        </p>
      </div>
    </div>
  );

  if (notif.link) {
    return <Link href={notif.link} onClick={onClick}>{Content}</Link>;
  }

  return <div onClick={onClick}>{Content}</div>;
}
