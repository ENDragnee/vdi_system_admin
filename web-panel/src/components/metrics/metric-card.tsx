"use client";

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden bg-card hover:shadow-md transition-all duration-500 hover:-translate-y-1">
      <div className={cn("h-1 w-full bg-gradient-to-r", color)} />
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{title}</p>
          <div className="p-2 bg-muted/50 rounded-lg">{icon}</div>
        </div>
        <p className="text-3xl font-bold tracking-tighter tabular-nums transition-all duration-1000">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
