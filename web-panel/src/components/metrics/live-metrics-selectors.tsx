"use client";

import { Button } from '@/components/ui/button';
import { Server, ChevronRight } from 'lucide-react';

interface SelectorsProps {
  labs: any[];
  vms: any[];
  selectedLab: string | null;
  selectedInstance: string | null;
  showAllMetrics: boolean;
  onLabSelect: (id: string) => void;
  onInstanceSelect: (hostname: string) => void;
  onViewAll: () => void;
}

export function LiveMetricsSelectors({
  labs,
  vms,
  selectedLab,
  selectedInstance,
  showAllMetrics,
  onLabSelect,
  onInstanceSelect,
  onViewAll
}: SelectorsProps) {
  const availableVms = vms?.filter((v) => v.labName === labs.find((l) => l.id === selectedLab)?.name) || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 ml-1">Select Lab</h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant={showAllMetrics ? 'default' : 'outline'} onClick={onViewAll}>
            View All Cluster
          </Button>
          {labs.map((lab) => (
            <Button
              key={lab.id}
              variant={selectedLab === lab.id ? 'default' : 'outline'}
              onClick={() => onLabSelect(lab.id)}
            >
              {lab.name}
            </Button>
          ))}
        </div>
      </div>

      {selectedLab && (
        <div className="animate-in slide-in-from-left-2 duration-300">
          <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 ml-1">Select Instance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableVms.map((vm) => (
              <Button
                key={vm.id}
                variant={selectedInstance === vm.hostname ? 'default' : 'outline'}
                onClick={() => onInstanceSelect(vm.hostname)}
                className="justify-start gap-3 h-12"
              >
                <Server className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-sm font-bold leading-none">{vm.hostname}</p>
                  <p className="text-[10px] opacity-60 leading-none mt-1">{vm.ip}</p>
                </div>
                {selectedInstance === vm.hostname && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
