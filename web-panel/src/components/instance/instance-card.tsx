"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Play, Square, Cpu, HardDrive, Activity } from "lucide-react";
import { DeleteVmAction, StartVmAction, StopVmAction } from "@/app/actions/vm-actions";
import { VMInstance } from "@/types/instance";

export function InstanceCard({ instance }: { instance: VMInstance }) {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () => StartVmAction(instance.proxmoxId, instance.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instances"] }),
  });

  const stopMutation = useMutation({
    mutationFn: () => StopVmAction(instance.proxmoxId, instance.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instances"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => DeleteVmAction(instance.id, instance.proxmoxId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instances"] }),
  });

  const isOnline = instance.status === "online";
  const statusColor = isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

  return (
    <Card className="border border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{instance.name}</CardTitle>
            <CardDescription className="text-xs">{instance.os} ({instance.labName})</CardDescription>
          </div>
          <Badge className={`${statusColor} border-0 flex-shrink-0`}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">IP Address:</span>
            <span className="font-mono text-foreground">{instance.ip}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Cpu className="w-3 h-3" /> CPU</div>
            <span className="text-sm font-medium">{instance.cpu}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Activity className="w-3 h-3" /> RAM</div>
            <span className="text-sm font-medium">{instance.ram}%</span>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          {isOnline ? (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => stopMutation.mutate()} disabled={stopMutation.isPending}>
              <Square className="w-4 h-4 mr-1 text-amber-500" /> Stop
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
              <Play className="w-4 h-4 mr-1 text-green-500" /> Start
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-1 hover:text-destructive hover:border-destructive" onClick={() => { if (confirm("Destroy VM?")) deleteMutation.mutate() }} disabled={deleteMutation.isPending || isOnline}>
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
