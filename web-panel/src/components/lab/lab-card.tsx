"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Server, Edit2, Trash2 } from "lucide-react";

export function LabCard({ lab, onEdit }: { lab: any; onEdit: (l: any) => void }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`/api/labs/${lab.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["labs"] }),
    onError: (err: any) => alert(err.response?.data?.error || "Delete failed"),
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{lab.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">{lab.description || "No description provided."}</p>

        <div className="flex gap-4 py-2 border-y border-border">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-bold">{lab._count.users}</span> <span className="text-muted-foreground">Users</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Server className="w-4 h-4 text-primary" />
            <span className="font-bold">{lab._count.vms}</span> <span className="text-muted-foreground">VMs</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onEdit(lab)}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10"
            onClick={() => confirm(`Delete ${lab.name}?`) && deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
