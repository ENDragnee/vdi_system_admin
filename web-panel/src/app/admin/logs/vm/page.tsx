"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { VmLogTable } from "@/components/log/vm-log-table";
import { VmLogFilters } from "@/components/log/vm-log-filters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, History, RefreshCcw } from "lucide-react";

export default function VmLogsPage() {
  const [params, setParams] = useState({
    hostname: "",
    page: 1,
    limit: 25,
    sortBy: "_time",
    sortOrder: "desc" as "asc" | "desc",
    startDate: "",
    endDate: ""
  });

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["vm-logs", params],
    queryFn: async () => {
      const res = await axios.get("/api/logs/vm", { params });
      return res.data;
    },
    refetchInterval: 30000,
  });

  const handleSort = (column: string) => {
    setParams(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === "desc" ? "asc" : "desc"
    }));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <History className="text-primary w-10 h-10" /> Telemetry Archive
          </h1>
          <p className="text-muted-foreground">Historical resource metrics from InfluxDB</p>
        </div>
        <div className="flex items-center gap-4">
          {isRefetching && <RefreshCcw className="w-4 h-4 animate-spin text-primary" />}
          <div className="flex items-center gap-2 border-l pl-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Limit:</span>
            <Select
              value={String(params.limit)}
              onValueChange={(v) => setParams(p => ({ ...p, limit: Number(v), page: 1 }))}
            >
              <SelectTrigger className="w-[80px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Date Filter added here */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-xl border border-dashed">
        <div className="md:col-span-2">
          <VmLogFilters
            hostname={params.hostname}
            setHostname={(v: string) => setParams(p => ({ ...p, hostname: v, page: 1 }))}
          />
        </div>
        <input
          type="date"
          className="bg-card border rounded px-3 h-10 text-xs"
          onChange={(e) => setParams(p => ({ ...p, startDate: e.target.value ? new Date(e.target.value).toISOString() : "", page: 1 }))}
        />
        <input
          type="date"
          className="bg-card border rounded px-3 h-10 text-xs"
          onChange={(e) => setParams(p => ({ ...p, endDate: e.target.value ? new Date(e.target.value).toISOString() : "", page: 1 }))}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <VmLogTable
            logs={data?.data || []}
            sortBy={params.sortBy}
            sortOrder={params.sortOrder}
            onSort={handleSort}
          />

          <div className="flex items-center justify-between">
            <Button
              variant="outline" size="sm" disabled={params.page === 1}
              onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Newer
            </Button>
            <span className="text-xs font-bold text-muted-foreground uppercase">Page {params.page}</span>
            <Button
              variant="outline" size="sm" disabled={!data?.meta?.hasMore}
              onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
            >
              Older <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
