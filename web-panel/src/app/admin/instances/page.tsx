"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { InstanceHeader } from "@/components/instance/instance-header";
import { InstanceFilters } from "@/components/instance/instance-filters";
import { InstanceStats } from "@/components/instance/instance-stats";
import { InstanceGrid } from "@/components/instance/instance-grid";
import { InstancesResponse } from "@/types/instance";

export default function InstanceManagementPage() {
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const { data, isLoading, isError } = useQuery<InstancesResponse>({
    queryKey: ["instances"],
    queryFn: async () => {
      const response = await axios.get("/api/instances");
      return response.data;
    },
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Live Proxmox Data...</div>;
  if (isError || !data) return <div className="p-8 text-center text-red-500">Failed to load instance data.</div>;

  const filteredInstances = data.instances.filter((instance) => {
    const matchesSearch = instance.name.toLowerCase().includes(searchTerm.toLowerCase()) || instance.ip.includes(searchTerm);
    const matchesLab = !selectedLab || instance.labId === selectedLab;
    return matchesSearch && matchesLab;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Pass the currently filtered instances to the header for Mass Actions */}
      <InstanceHeader labs={data.labs} currentVms={filteredInstances} />

      <InstanceFilters labs={data.labs} selectedLab={selectedLab} setSelectedLab={setSelectedLab} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <InstanceStats instances={data.instances} />

      <InstanceGrid instances={filteredInstances} isExpanded={isExpanded} setIsExpanded={setIsExpanded} totalCount={data.instances.length} />
    </div>
  );
}
