"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Search, XCircle, ListFilter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  labs: { id: string; name: string }[];
}

export function LogFilters({ filters, setFilters, labs }: LogFiltersProps) {
  const updateFilter = (updates: any) => {
    setFilters({ ...filters, ...updates, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 25,
      search: "",
      labId: "all",
      type: "all",
      severity: "all",
      startDate: "", // Reset date
      endDate: ""    // Reset date
    });
  };

  return (
    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-dashed border-border/60">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages, targets, or user names..."
            className="pl-9 bg-card shadow-sm h-10"
            value={filters.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
          />
        </div>

        {/* Severity Selector */}
        <Select value={filters.severity} onValueChange={(v) => updateFilter({ severity: v })}>
          <SelectTrigger className="w-[140px] bg-card h-10 shadow-sm">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="INFO">Info</SelectItem>
            <SelectItem value="WARNING">Warning</SelectItem>
            <SelectItem value="ERROR">Error</SelectItem>
            <SelectItem value="FATAL">Fatal</SelectItem>
          </SelectContent>
        </Select>

        {/* Log Type Selector */}
        <Select value={filters.type} onValueChange={(v) => updateFilter({ type: v })}>
          <SelectTrigger className="w-[180px] bg-card h-10 shadow-sm">
            <div className="flex items-center gap-2">
              <ListFilter className="w-3 h-3 text-muted-foreground" />
              <SelectValue placeholder="Log Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Event Types</SelectItem>

            <SelectGroup>
              <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Authentication</SelectLabel>
              <SelectItem value="AUTH_LOGIN_SUCCESS">Login Success</SelectItem>
              <SelectItem value="AUTH_LOGIN_FAILED">Login Failed</SelectItem>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Virtual Machines</SelectLabel>
              <SelectItem value="VM_PROVISIONED">VM Provisioned</SelectItem>
              <SelectItem value="VM_STARTED">VM Started</SelectItem>
              <SelectItem value="VM_STOPPED">VM Stopped</SelectItem>
              <SelectItem value="VM_DESTROYED">VM Destroyed</SelectItem>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Nix & Build</SelectLabel>
              <SelectItem value="NIX_SYNC_REQUESTED">Sync Requested</SelectItem>
              <SelectItem value="NIX_BUILD_SUCCESS">Build Success</SelectItem>
              <SelectItem value="NIX_BUILD_FAILED">Build Failed</SelectItem>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Infrastructure</SelectLabel>
              <SelectItem value="PROXMOX_API_ERROR">Proxmox Errors</SelectItem>
              <SelectItem value="NETWORK_DISCONNECT">Network Issues</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Lab Selector */}
        <Select value={filters.labId} onValueChange={(v) => updateFilter({ labId: v })}>
          <SelectTrigger className="w-[180px] bg-card h-10 shadow-sm">
            <SelectValue placeholder="Target Lab" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Global (All Labs)</SelectItem>
            {labs?.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Start Date */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="date"
            className="pl-9 bg-card shadow-sm h-10 w-[160px]"
            value={filters.startDate}
            onChange={(e) => updateFilter({ startDate: e.target.value })}
          />
        </div>

        <span className="text-muted-foreground self-center">-</span>

        {/* End Date */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="date"
            className="pl-9 bg-card shadow-sm h-10 w-[160px]"
            value={filters.endDate}
            onChange={(e) => updateFilter({ endDate: e.target.value })}
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground h-10 px-4"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
