"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { InstanceHeader } from "@/components/instance/instance-header";
import { InstanceFilters } from "@/components/instance/instance-filters";
import { InstanceStats } from "@/components/instance/instance-stats";
import { InstanceGrid } from "@/components/instance/instance-grid";
import { InstancePagination } from "@/components/instance/instance-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export default function InstanceManagementPage() {
  // Query State
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [isExpanded, setIsExpanded] = useState(true);

  // React Query Fetcher
  const { data, isLoading, isError } = useQuery({
    queryKey: ["instances", page, limit, searchTerm, selectedLab, sortBy, sortOrder],
    queryFn: async () => {
      const response = await axios.get("/api/instances", {
        params: {
          page,
          limit,
          search: searchTerm,
          labId: selectedLab || "",
          sortBy,
          sortOrder
        }
      });
      return response.data;
    },
    refetchInterval: 10000, // Live updates
  });

  if (isError) return <div className="p-8 text-center text-red-500">Error connecting to Proxmox.</div>;

  return (
    <div className="p-8 space-y-8">
      <InstanceHeader labs={data?.labs || []} currentVms={data?.instances || []} />

      {/* Filter and Sort Toolbar */}
      <div className="space-y-4">
        <InstanceFilters
          labs={data?.labs || []}
          selectedLab={selectedLab}
          setSelectedLab={(id) => { setSelectedLab(id); setPage(1); }}
          searchTerm={searchTerm}
          setSearchTerm={(term) => { setSearchTerm(term); setPage(1); }}
        />

        <div className="flex justify-end items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hostname">Hostname</SelectItem>
                <SelectItem value="createdAt">Creation Date</SelectItem>
                <SelectItem value="proxmoxId">Proxmox ID</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 border-l pl-4">
            <span className="text-xs font-medium text-muted-foreground uppercase">Limit:</span>
            <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[80px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <InstanceStats instances={data?.instances || []} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-xl" />)}
        </div>
      ) : (
        <>
          <InstanceGrid
            instances={data?.instances || []}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
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
