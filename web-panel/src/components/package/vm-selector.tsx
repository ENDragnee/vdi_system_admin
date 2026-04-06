// components/package/vm-selector.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Wifi, WifiOff } from "lucide-react";

interface ManagedVm {
  id: string;
  proxmoxId: number;
  hostname: string;
  labName: string;
  ip: string;
  isReady: boolean;
}

interface VmSelectorProps {
  selectedVmId: string | null;
  onVmChange: (vm: ManagedVm) => void;
}

export function VmSelector({ selectedVmId, onVmChange }: VmSelectorProps) {
  const { data: vms, isLoading } = useQuery<ManagedVm[]>({
    queryKey: ["managed-vms"],
    queryFn: async () => {
      const res = await axios.get("/api/vm/managed");
      return res.data;
    },
    refetchInterval: 15000, // Refresh IPs every 15s
  });

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Target Instance</label>
      <Select
        value={selectedVmId || ""}
        onValueChange={(id) => {
          const vm = vms?.find((v) => v.id === id);
          if (vm) onVmChange(vm);
        }}
      >
        <SelectTrigger className="w-[300px] bg-card">
          <SelectValue placeholder={isLoading ? "Loading VMs..." : "Select a VM to manage"} />
        </SelectTrigger>
        <SelectContent>
          {vms?.map((vm) => (
            <SelectItem key={vm.id} value={vm.id}>
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{vm.hostname}</span>
                  <span className="text-[10px] opacity-70">
                    {vm.labName} • {vm.ip}
                  </span>
                </div>
                {vm.isReady ? (
                  <Wifi className="w-3 h-3 text-green-500 ml-auto" />
                ) : (
                  <WifiOff className="w-3 h-3 text-amber-500 ml-auto" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
