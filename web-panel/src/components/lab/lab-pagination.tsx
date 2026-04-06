// components/lab/lab-pagination.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  meta?: {
    page: number;
    totalPages: number;
    limit: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

export function LabPagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{((meta.page - 1) * meta.limit) + 1}</span> to{" "}
        <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of{" "}
        <span className="font-medium">{meta.total}</span> Labs
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          className="h-8 w-28"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center justify-center min-w-[80px] text-sm font-medium">
          Page {meta.page} of {meta.totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          className="h-8 w-28"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
