"use client";

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertItemProps {
  active: boolean;
  title: string;
  desc: string;
  type: 'error' | 'warning' | 'info';
}

export function AlertItem({ active, title, desc, type }: AlertItemProps) {
  if (!active) return null;
  const styles = {
    error: "bg-red-500/10 border-red-500/20 text-red-500",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-500"
  };

  return (
    <div className={cn("p-4 rounded-xl border animate-in zoom-in-95", styles[type])}>
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <p className="text-xs font-bold uppercase">{title}</p>
      </div>
      <p className="text-[10px] opacity-80 mt-1">{desc}</p>
    </div>
  );
}
