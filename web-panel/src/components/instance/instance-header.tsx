"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { CreateVmModal } from "./create-vm-modal";
import { MassVmAction } from "@/app/actions/vm-actions";
import { Lab, VMInstance } from "@/types/instance";

interface InstanceHeaderProps {
  labs: Lab[];
  currentVms: VMInstance[];
}

export function InstanceHeader({ labs, currentVms }: InstanceHeaderProps) {
  const queryClient = useQueryClient();

  const massMutation = useMutation({
    mutationFn: (action: "start" | "stop") => {
      const payload = currentVms.map(vm => ({ id: vm.id, proxmoxId: vm.proxmoxId }));
      return MassVmAction(payload, action);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instances"] }),
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Instance Management</h1>
        <p className="text-muted-foreground">Manage virtual instances across your labs</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => massMutation.mutate("start")} disabled={massMutation.isPending || currentVms.length === 0}>
          <Play className="w-4 h-4 mr-2 text-green-500" /> Start All
        </Button>
        <Button variant="outline" size="sm" onClick={() => massMutation.mutate("stop")} disabled={massMutation.isPending || currentVms.length === 0}>
          <Square className="w-4 h-4 mr-2 text-red-500" /> Stop All
        </Button>
        <CreateVmModal labs={labs} />
      </div>
    </div>
  );
}
