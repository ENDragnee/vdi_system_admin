"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Search, MonitorOff } from "lucide-react";

// Reuse Modular Components
import { FacultyInstanceHeader } from "@/components/instance/faculty-instance-header";
import { InstanceGrid } from "@/components/instance/instance-grid";
import { InstancePagination } from "@/components/instance/instance-pagination";

export default function FacultyInstancesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faculty-instances", page, search],
    queryFn: async () => {
      const res = await axios.get("/api/instances", {
        params: { page, search, limit: 12 }
      });
      return res.data;
    },
    refetchInterval: 15000, // Refresh every 15s for live status
  });

  if (isError) return (
    <div className="p-8 flex flex-col items-center justify-center h-[60vh] text-center">
      <MonitorOff className="w-16 h-16 text-destructive mb-4 opacity-20" />
      <h2 className="text-xl font-bold text-destructive">Unauthorized or No Lab Assigned</h2>
      <p className="text-muted-foreground">Please contact the system administrator to assign your account to a lab.</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 pb-20">
      {/* 1. Scoped Header (No 'Create' button for faculty) */}
      <FacultyInstanceHeader
        currentVms={data?.instances || []}
        labName={data?.instances?.[0]?.labName}
      />

      {/* 2. Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Filter your instances by hostname..."
          className="pl-10 h-12 text-lg shadow-sm bg-card"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* 3. Reusable Grid of InstanceCards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-2xl" />)}
        </div>
      ) : (
        <>
          <InstanceGrid
            instances={data?.instances || []}
            isExpanded={true}
            setIsExpanded={() => { }}
            totalCount={data?.meta?.total || 0}
          />

          <InstancePagination
            meta={data?.meta}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
