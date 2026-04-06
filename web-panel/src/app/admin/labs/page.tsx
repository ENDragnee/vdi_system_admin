// app/admin/labs/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LabCard } from "@/components/lab/lab-card";
import { LabUpsertModal } from "@/components/lab/lab-upsert-modal";
import { LabPagination } from "@/components/lab/lab-pagination";

export default function LabManagementPage() {
  // 1. Local State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12); // Default to 12 for a 3 or 4 column grid
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);

  // 2. Data Fetching with React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["labs", page, search, limit],
    queryFn: async () => {
      const res = await axios.get("/api/labs", {
        params: { page, search, limit }
      });
      return res.data;
    },
  });

  const handleEdit = (lab: any) => {
    setEditingLab(lab);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLab(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Lab Management</h1>
          <p className="text-muted-foreground">Orchestrate physical facilities and VM groups</p>
        </div>
        <Button onClick={handleCreate} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Lab
        </Button>
      </div>

      {/* Filters Area */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search labs by name..."
          className="pl-10 h-12 text-lg shadow-sm bg-card"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to page 1 on search
          }}
        />
      </div>

      {/* Data Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-destructive">
          Failed to load labs. Please check your permissions.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data.map((lab: any) => (
              <LabCard key={lab.id} lab={lab} onEdit={handleEdit} />
            ))}
          </div>

          {/* Empty State */}
          {data?.data.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/10">
              <p className="text-muted-foreground text-lg">No labs found matching your criteria.</p>
            </div>
          )}

          {/* Pagination Component */}
          <LabPagination
            meta={data?.meta}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modals */}
      <LabUpsertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingLab={editingLab}
      />
    </div>
  );
}
