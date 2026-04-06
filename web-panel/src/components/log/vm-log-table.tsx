"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Clock, HardDrive } from "lucide-react";

interface VmLogTableProps {
  logs: any[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
}

export function VmLogTable({ logs, sortBy, sortOrder, onSort }: VmLogTableProps) {
  const SortButton = ({ column, label }: { column: string, label: string }) => (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1 hover:text-primary transition-colors uppercase text-[10px] font-bold tracking-wider"
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortBy === column ? "text-primary" : "opacity-30"}`} />
    </button>
  );

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead><SortButton column="_time" label="Timestamp" /></TableHead>
            <TableHead><SortButton column="host" label="Host" /></TableHead>
            <TableHead>Status</TableHead>
            <TableHead><SortButton column="usage_active" label="CPU" /></TableHead>
            <TableHead><SortButton column="used_percent" label="RAM" /></TableHead>
            <TableHead>Net Throughput</TableHead>
            <TableHead><SortButton column="uptime" label="Uptime" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, idx) => (
            <TableRow key={idx} className="hover:bg-muted/30 transition-colors border-border/50">
              <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                {format(new Date(log._time), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell className="font-bold text-xs">{log.host}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 text-[10px] px-1 h-5">
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={(log.cpuload || 0) * 100} className="w-10 h-1" />
                  <span className="text-[10px] font-mono w-8">{((log.cpuload || 0) * 100).toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={log.mem_used_percentage} className="w-10 h-1" />
                  <span className="text-[10px] font-mono w-8">{log.mem_used_percentage?.toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-[9px] font-mono leading-tight">
                  <span className="text-emerald-600">↓ {((log.bytes_recv || 0) / 1024 / 1024).toFixed(1)}MB</span>
                  <span className="text-blue-600">↑ {((log.bytes_sent || 0) / 1024 / 1024).toFixed(1)}MB</span>
                </div>
              </TableCell>
              <TableCell className="text-[10px] text-muted-foreground">
                {Math.floor((log.uptime || 0) / 3600)}h {Math.floor(((log.uptime || 0) % 3600) / 60)}m
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
