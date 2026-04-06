// app/admin/packages/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, Plus, Zap, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { PackageCard } from "@/components/package/package-card";
import { PackageStats } from "@/components/package/package-stats";
import { PackageUpsertModal } from "@/components/package/package-upsert-modal";
import { PackagePagination } from "@/components/package/package-pagination";
import { VmMultiSelector } from "@/components/package/vm-multi-selector";

export default function PackageManagementPage() {
  const queryClient = useQueryClient();

  // States
  const [selectedVmIds, setSelectedVmIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);

  // 1. Fetch Managed VMs to get their live IPs
  const { data: managedVms } = useQuery({
    queryKey: ["managed-vms"],
    queryFn: async () => (await axios.get("/api/vm/managed")).data,
    refetchInterval: 30000, // Refresh IPs every 30s
  });

  // 2. Fetch Packages from Repository
  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages", page, limit, search],
    queryFn: async () => {
      const res = await axios.get("/api/packages", {
        params: { page, limit, search }
      });
      return res.data;
    }
  });

  // 3. Bulk Action Mutation
  const bulkMutation = useMutation({
    mutationFn: async ({ pkgName, action }: { pkgName?: string, action: string }) => {
      return (await axios.post("/api/vm/package/bulk", {
        vmIds: selectedVmIds,
        packageName: pkgName,
        action
      })).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] })
  });

  // 4. Logic to determine current target IP (for single-vm mode in PackageCard)
  const selectedVmIp = useMemo(() => {
    if (selectedVmIds.length === 0 || !managedVms) return "No IP Assigned";
    const firstVm = managedVms.find((v: any) => v.id === selectedVmIds[0]);
    return firstVm?.ip || "No IP Assigned";
  }, [selectedVmIds, managedVms]);

  const handleEdit = (pkg: any) => {
    setEditingPkg(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Package Management</h1>
          <p className="text-muted-foreground">Global VDI Software Deployment Pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => bulkMutation.mutate({ action: 'sync' })} disabled={bulkMutation.isPending || selectedVmIds.length === 0}>
            {bulkMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2 text-amber-500" />}
            Bulk Force Sync
          </Button>
          <Button onClick={() => { setEditingPkg(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> New Package
          </Button>
        </div>
      </div>

      {/* VM Selection Area */}
      <VmMultiSelector selectedIds={selectedVmIds} onSelectionChange={setSelectedVmIds} />

      {/* Statistics */}
      <PackageStats packages={packages?.data} vmId={selectedVmIds[0] || ""} />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search repository by name or description..."
          className="pl-10 h-12 text-lg shadow-sm"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages?.data.map((pkg: any) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              vmId={selectedVmIds[0] || ""}
              vmIp={selectedVmIp} // Pass the dynamically resolved IP
              isBulk={selectedVmIds.length > 1}
              onAction={(action) => bulkMutation.mutate({ pkgName: pkg.name, action })}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && packages?.data.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed rounded-2xl">
          <p className="text-muted-foreground">No packages found matching your search.</p>
        </div>
      )}

      {/* Pagination */}
      <PackagePagination
        meta={packages?.meta}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Modals */}
      <PackageUpsertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingPackage={editingPkg}
      />
    </div>
  );
}
