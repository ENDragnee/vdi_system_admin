"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, HardDrive, Cpu, Activity } from "lucide-react";

export function VmLogTable({ logs }: { logs: any[] }) {
  const formatUptime = (seconds: number) => {
    if (!seconds) return "0s";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[180px]">Timestamp</TableHead>
            <TableHead>Host Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>CPU Load</TableHead>
            <TableHead>RAM Usage</TableHead>
            <TableHead>Net In/Out</TableHead>
            <TableHead>Uptime</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                No telemetry data found for the selected timeframe.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {format(new Date(log._time), "HH:mm:ss (MMM dd)")}
                </TableCell>
                <TableCell className="font-bold text-sm">
                  {log.host}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={log.status === 'running' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-red-500/10 text-red-600 border-red-200'}
                  >
                    {log.status || 'unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={(log.cpuload || 0) * 100} className="w-12 h-1.5" />
                    <span className="text-[11px] font-mono">{((log.cpuload || 0) * 100).toFixed(1)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      {((log.mem_used || 0) / 1024 / 1024 / 1024).toFixed(1)} GB
                    </span>
                    <Progress value={log.mem_used_percentage} className="w-16 h-1" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-[10px] font-mono">
                    <span className="text-emerald-600">↓ {((log.netin || 0) / 1024 / 1024).toFixed(1)}MB</span>
                    <span className="text-blue-600">↑ {((log.netout || 0) / 1024 / 1024).toFixed(1)}MB</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatUptime(log.uptime)}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
