// components/package/vm-multi-selector.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Monitor, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VmMultiSelector({ selectedIds, onSelectionChange }: {
  selectedIds: string[],
  onSelectionChange: (ids: string[]) => void
}) {
  const { data: vms } = useQuery({
    queryKey: ["managed-vms"],
    queryFn: async () => (await axios.get("/api/vm/managed")).data,
  });

  const toggleAll = () => {
    if (selectedIds.length === vms?.length) onSelectionChange([]);
    else onSelectionChange(vms?.map((v: any) => v.id) || []);
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectionChange(selectedIds.filter(i => i !== id));
    else onSelectionChange([...selectedIds, id]);
  };

  return (
    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-dashed">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
          <Monitor className="w-4 h-4" /> Target Instances ({selectedIds.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={toggleAll} className="h-8 text-xs">
          {selectedIds.length === vms?.length ? <Square className="w-3 h-3 mr-1" /> : <CheckSquare className="w-3 h-3 mr-1" />}
          {selectedIds.length === vms?.length ? "Deselect All" : "Select All"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {vms?.map((vm: any) => (
          <div
            key={vm.id}
            onClick={() => toggleOne(vm.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${selectedIds.includes(vm.id) ? 'bg-primary/10 border-primary shadow-sm' : 'bg-card border-border opacity-60'
              }`}
          >
            <Checkbox checked={selectedIds.includes(vm.id)} />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-none">{vm.hostname}</span>
              <span className="text-[10px] opacity-60">{vm.ip}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
