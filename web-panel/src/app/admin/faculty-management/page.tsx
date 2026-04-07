"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FacultyTable } from "@/components/faculty/faculty-table";
import { FacultyUpsertModal } from "@/components/faculty/faculty-upsert-modal";
import { FacultyPasswordModal } from "@/components/faculty/faculty-password-modal";
import { LabPagination } from "@/components/lab/lab-pagination";

export default function FacultyManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // States for Modals
  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [targetMember, setTargetMember] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["faculty", page, search],
    queryFn: async () => (await axios.get("/api/faculty", { params: { page, search, limit: 10 } })).data
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/faculty/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty"] })
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Users className="text-primary w-10 h-10" /> Faculty Registry
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest mt-1">Identity and access control</p>
        </div>
        <Button onClick={() => { setTargetMember(null); setIsUpsertOpen(true); }} className="shadow-lg rounded-xl h-11 px-6 font-bold uppercase text-xs">
          <Plus className="w-4 h-4 mr-2" /> Add Faculty
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-10 h-12 text-lg shadow-sm bg-card border-border/40"
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
            onEdit={(m: any) => { setTargetMember(m); setIsUpsertOpen(true); }}
            onPasswordReset={(m: any) => { setTargetMember(m); setIsPasswordOpen(true); }}
            onDelete={(id: string) => confirm("Permanently delete this member?") && deleteMutation.mutate(id)}
          />
          <LabPagination meta={data?.meta} onPageChange={setPage} />
        </div>
      )}

      {/* MODALS */}
      <FacultyUpsertModal
        isOpen={isUpsertOpen}
        onClose={() => setIsUpsertOpen(false)}
        editingMember={targetMember}
      />

      <FacultyPasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        member={targetMember}
      />
    </div>
  );
}
