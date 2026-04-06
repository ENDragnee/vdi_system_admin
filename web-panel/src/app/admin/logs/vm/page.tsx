"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { VmLogTable } from "@/components/log/vm-log-table";
import { VmLogFilters } from "@/components/log/vm-log-filters";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, History, RefreshCcw } from "lucide-react";

export default function VmLogsPage() {
  const [hostname, setHostname] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["vm-logs", hostname, page],
    queryFn: async () => {
      const res = await axios.get("/api/logs/vm", {
        params: { hostname, page, limit }
      });
      return res.data;
    },
    refetchInterval: 30000,
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <History className="text-primary w-10 h-10" /> VM Metrics History
          </h1>
          <p className="text-muted-foreground">Detailed telemetry and utilization logs from InfluxDB</p>
        </div>
        {isRefetching && <RefreshCcw className="w-5 h-5 animate-spin text-primary" />}
      </div>

      <VmLogFilters
        hostname={hostname}
        setHostname={(v: string) => { setHostname(v); setPage(1); }}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(12)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <VmLogTable logs={data?.data || []} />

          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="hover:bg-primary/10"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Newer Data
            </Button>

            <div className="text-sm font-semibold bg-muted px-4 py-1 rounded-full">
              Page {page}
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={!data?.meta?.hasMore}
              onClick={() => setPage(page + 1)}
              className="hover:bg-primary/10"
            >
              Older History <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
