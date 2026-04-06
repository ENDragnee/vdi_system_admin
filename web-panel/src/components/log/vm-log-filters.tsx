"use client";

import { Input } from "@/components/ui/input";
import { Search, Monitor } from "lucide-react";

export function VmLogFilters({ hostname, setHostname }: any) {
  return (
    <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-dashed">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Filter by Hostname (e.g. vm1)..."
          className="pl-9 bg-card"
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
        />
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-2 italic">
        <Monitor className="w-3 h-3" />
        Displaying metrics from last 24 hours
      </div>
    </div>
  );
}
