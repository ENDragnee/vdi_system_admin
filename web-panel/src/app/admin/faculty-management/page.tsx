"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FacultyTable } from "@/components/faculty/faculty-table";
import { FacultyUpsertModal } from "@/components/faculty/faculty-upsert-modal";
import { LabPagination } from "@/components/lab/lab-pagination"; // Reusing Pagination

export default function FacultyManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["faculty", page, search],
    queryFn: async () => (await axios.get("/api/faculty", { params: { page, search, limit: 10 } })).data
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/faculty/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty"] })
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Users className="text-primary" /> Faculty Registry
          </h1>
          <p className="text-muted-foreground font-medium">Manage academic staff and lab access permissions</p>
        </div>
        <Button onClick={() => { setEditingMember(null); setIsModalOpen(true); }} className="shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Add Faculty
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search faculty by name or email..."
          className="pl-10 h-12 text-lg shadow-sm"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <FacultyTable
            data={data?.data || []}
            onEdit={(m: any) => { setEditingMember(m); setIsModalOpen(true); }}
            onDelete={(id: string) => confirm("Permanently delete this member?") && deleteMutation.mutate(id)}
          />
          <LabPagination meta={data?.meta} onPageChange={setPage} />
        </div>
      )}

      <FacultyUpsertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingMember={editingMember}
      />
    </div>
  );
}
