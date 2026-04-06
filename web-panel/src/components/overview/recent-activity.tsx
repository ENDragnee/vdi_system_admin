"use client";

import { formatDistanceToNow } from 'date-fns';

export function RecentActivity({ logs }: { logs: any[] }) {
  return (
    <div className="space-y-6">
      {logs.length === 0 ? (
        <p className="text-sm text-center py-10 text-muted-foreground italic">No recent system events.</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="flex items-start gap-4">
            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.severity === 'FATAL' || log.severity === 'ERROR' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                log.severity === 'WARNING' ? 'bg-amber-500' : 'bg-green-500'
              }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-none">{log.message}</p>
              <p className="text-[11px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">
                {log.user?.name || 'Automated System'} • {log.type.replace(/_/g, ' ')}
              </p>
            </div>
            <span className="text-[10px] uppercase font-black text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(log.createdAt))} ago
            </span>
          </div>
        ))
      )}
    </div>
  );
}
