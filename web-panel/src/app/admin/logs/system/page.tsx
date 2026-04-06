// app/admin/logs/system/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Download, Activity, FileSpreadsheet } from "lucide-react";
import { LogTable } from "@/components/log/log-table";
import { LogFilters } from "@/components/log/log-filters";
import { LabPagination } from "@/components/lab/lab-pagination";

export default function SystemLogsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 25,
    search: "",
    labId: "all",
    severity: "all",
    type: "all",
    startDate: "",
    endDate: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["logs", filters],
    queryFn: async () => {
      const res = await axios.get("/api/logs/system", { params: filters });
      return res.data;
    }
  });

  const handleExportAll = () => {
    // Generate a URL with the CURRENT filters
    const params = new URLSearchParams({
      labId: filters.labId,
      severity: filters.severity,
      startDate: filters.startDate,
      endDate: filters.endDate
    });

    // Redirect browser to the export route to trigger native download
    window.location.href = `/api/logs/system/export?${params.toString()}`;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Activity className="text-primary" /> System Audit
          </h1>
          <p className="text-muted-foreground">Comprehensive record of infrastructure events</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportAll}>
          <FileSpreadsheet className="w-4 h-4" />
          Export All Matching
        </Button>
      </div>

      <LogFilters
        filters={filters}
        setFilters={setFilters}
        labs={data?.labs}
      />

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
        </div>
      ) : (
        <>
          <LogTable logs={data?.data || []} />
          <LabPagination
            meta={data?.meta}
            onPageChange={(p) => setFilters({ ...filters, page: p })}
          />
        </>
      )}
    </div>
  );
}
