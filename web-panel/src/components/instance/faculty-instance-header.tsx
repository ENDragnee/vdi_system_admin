"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Play, Square, RefreshCcw } from "lucide-react";
import { MassVmAction } from "@/app/actions/vm-actions";

export function FacultyInstanceHeader({ currentVms, labName }: any) {
  const queryClient = useQueryClient();

  const massMutation = useMutation({
    mutationFn: (action: "start" | "stop") => {
      const payload = currentVms.map((vm: any) => ({ id: vm.id, proxmoxId: vm.proxmoxId }));
      return MassVmAction(payload, action);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty-instances"] }),
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">{labName || 'My Lab'}</h1>
        <p className="text-muted-foreground font-medium">Monitor and control your lab instances</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => massMutation.mutate("start")} disabled={massMutation.isPending}>
          <Play className="w-4 h-4 mr-2 text-green-500 fill-current" /> Start Lab
        </Button>
        <Button variant="outline" size="sm" onClick={() => massMutation.mutate("stop")} disabled={massMutation.isPending}>
          <Square className="w-4 h-4 mr-2 text-amber-500 fill-current" /> Stop Lab
        </Button>
        <Button variant="ghost" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ["faculty-instances"] })}>
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
