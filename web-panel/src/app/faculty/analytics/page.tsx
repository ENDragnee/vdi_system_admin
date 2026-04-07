"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { History, FileDown, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Reusing Modular Components
import { VmLogTable } from "@/components/log/vm-log-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FacultyAnalyticsPage() {
  const [params, setParams] = useState({
    hostname: "all",
    page: 1,
    limit: 20,
    startDate: format(new Date(Date.now() - 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  // 1. Fetch available VMs for the filter dropdown
  const { data: vms } = useQuery({
    queryKey: ["my-lab-vms-list"],
    queryFn: async () => (await axios.get("/api/vm/managed")).data,
  });

  // 2. Fetch historical logs from InfluxDB
  const { data: logs, isLoading } = useQuery({
    queryKey: ["lab-historical-logs", params],
    queryFn: async () => {
      const res = await axios.get("/api/logs/vm", {
        params: {
          ...params,
          hostname: params.hostname === "all" ? "" : params.hostname,
          // Convert local date picker format to InfluxDB-friendly format
          startDate: new Date(params.startDate).toISOString(),
          endDate: new Date(params.endDate).toISOString()
        }
      });
      return res.data;
    }
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <History className="text-primary" /> Lab Analytics
          </h1>
          <p className="text-muted-foreground font-medium">Historical performance audit for {vms?.[0]?.labName}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <FileDown className="w-4 h-4" /> Export Report
        </Button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-2xl border shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Instance</label>
          <Select value={params.hostname} onValueChange={(v) => setParams({ ...params, hostname: v, page: 1 })}>
            <SelectTrigger className="bg-muted/50 border-0"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lab VMs</SelectItem>
              {vms?.map((v: any) => <SelectItem key={v.id} value={v.hostname}>{v.hostname}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">From</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 opacity-30" />
            <Input
              type="datetime-local"
              className="pl-9 bg-muted/50 border-0"
              value={params.startDate}
              onChange={(e) => setParams({ ...params, startDate: e.target.value, page: 1 })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">To</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 opacity-30" />
            <Input
              type="datetime-local"
              className="pl-9 bg-muted/50 border-0"
              value={params.endDate}
              onChange={(e) => setParams({ ...params, endDate: e.target.value, page: 1 })}
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button
            variant="secondary"
            className="w-full h-10 font-bold uppercase text-xs tracking-widest"
            onClick={() => setParams({ ...params, page: 1 })}
          >
            Query InfluxDB
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Reusing the table component built for Admin */}
          <VmLogTable logs={logs?.data || []} onSort={() => { }} sortBy="_time" sortOrder="desc" />

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              disabled={params.page === 1}
              onClick={() => setParams({ ...params, page: params.page - 1 })}
              className="font-bold text-xs uppercase"
            >
              Newer
            </Button>
            <span className="text-[10px] font-black bg-muted px-4 py-1.5 rounded-full uppercase tracking-widest">
              Page {params.page}
            </span>
            <Button
              variant="ghost"
              disabled={!logs?.meta?.hasMore}
              onClick={() => setParams({ ...params, page: params.page + 1 })}
              className="font-bold text-xs uppercase"
            >
              Older
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
