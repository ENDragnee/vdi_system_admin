// components/package/package-pagination.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps {
  // Change meta to optional so TypeScript is happy with the parent state
  meta?: { page: number; totalPages: number; limit: number; total: number };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function PackagePagination({ meta, onPageChange, onLimitChange }: PaginationProps) {
  // --- THE FIX ---
  // If meta is undefined (during loading or if there's an error), 
  // don't render anything and don't crash.
  if (!meta) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{((meta.page - 1) * meta.limit) + 1}</span> to{" "}
          <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of{" "}
          <span className="font-medium">{meta.total}</span> packages
        </p>
        <Select value={String(meta.limit)} onValueChange={(v) => onLimitChange(Number(v))}>
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map(l => <SelectItem key={l} value={String(l)}>{l} / page</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline" size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <div className="text-sm font-medium">Page {meta.page} of {meta.totalPages}</div>
        <Button
          variant="outline" size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
