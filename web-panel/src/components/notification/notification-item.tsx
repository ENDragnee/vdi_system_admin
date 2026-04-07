"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2, Info, Zap, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NotificationItem({ notif, onMarkRead, onClick }: {
  notif: any,
  onMarkRead?: (id: string) => void,
  onClick?: () => void
}) {
  const icons = {
    SUCCESS: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    ERROR: <AlertCircle className="w-4 h-4 text-red-500" />,
    WARNING: <AlertCircle className="w-4 h-4 text-amber-500" />,
    RESOURCE_CRITICAL: <Zap className="w-4 h-4 text-orange-500 animate-pulse" />,
    INFO: <Info className="w-4 h-4 text-blue-500" />,
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkRead) onMarkRead(notif.id);
  };

  const Content = (
    <div className={cn(
      "group flex items-start gap-4 p-4 transition-all duration-300 relative border-l-4",
      // Unread: Strong colors and stripe
      !notif.isRead ? "bg-primary/[0.02] border-l-primary" : "opacity-50 grayscale-[0.5] border-l-transparent",
      "hover:bg-muted/50"
    )}>
      <div className="mt-1 shrink-0">{icons[notif.type as keyof typeof icons]}</div>
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <p className={cn("text-sm leading-none truncate", !notif.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
            {notif.title}
          </p>
          <span className="text-[9px] uppercase font-black opacity-30 whitespace-nowrap">
            {formatDistanceToNow(new Date(notif.createdAt))} ago
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notif.message}</p>
      </div>

      {/* Hover Action: Mark Read */}
      {!notif.isRead && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMarkRead}
          className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background shadow-sm hover:text-green-600 hover:bg-green-50"
        >
          <Check className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );

  if (notif.link) {
    return <Link href={notif.link} onClick={onClick} className="block no-underline">{Content}</Link>;
  }

  return <div onClick={onClick} className="cursor-pointer">{Content}</div>;
}
