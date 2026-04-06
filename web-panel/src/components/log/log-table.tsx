"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";

export function LogTable({ logs }: { logs: any[] }) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "FATAL": return { icon: <ShieldAlert className="w-4 h-4 text-red-700" />, color: "bg-red-200 text-red-900 border-red-300" };
      case "ERROR": return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, color: "bg-red-100 text-red-800" };
      case "WARNING": return { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, color: "bg-amber-100 text-amber-800" };
      default: return { icon: <Info className="w-4 h-4 text-blue-500" />, color: "bg-blue-100 text-blue-800" };
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Timestamp</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Lab</TableHead>
            <TableHead>User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const styles = getSeverityStyles(log.severity);
            return (
              <TableRow key={log.id} className="group cursor-default">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {styles.icon}
                    <Badge variant="outline" className={`${styles.color} border-0 text-[10px] uppercase font-bold`}>
                      {log.severity}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-semibold">{log.type}</TableCell>
                <TableCell className="max-w-[300px] truncate text-sm" title={log.message}>
                  {log.message}
                </TableCell>
                <TableCell className="text-xs italic text-muted-foreground">{log.targetName || "-"}</TableCell>
                <TableCell className="text-xs">{log.lab?.name || "-"}</TableCell>
                <TableCell className="text-xs font-medium">{log.user?.name || "System"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
