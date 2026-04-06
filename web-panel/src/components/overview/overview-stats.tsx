"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Server, Users, Landmark, HardDrive } from 'lucide-react';

interface OverviewStatsProps {
  data: {
    instances: { active: number; total: number };
    faculties: number;
    labs: number;
    storage: { used: number; total: number };
  };
}

export function OverviewStats({ data }: OverviewStatsProps) {
  const stats = [
    {
      label: 'Instances',
      value: `${data.instances.active}/${data.instances.total}`,
      sub: 'Active / Total',
      icon: Server,
      color: 'text-blue-500'
    },
    {
      label: 'Faculties',
      value: data.faculties.toString(),
      sub: 'Registered Staff',
      icon: Users,
      color: 'text-purple-500'
    },
    {
      label: 'Active Labs',
      value: data.labs.toString(),
      sub: 'Configured Labs',
      icon: Landmark,
      color: 'text-green-500'
    },
    {
      label: 'Cluster Storage',
      value: `${(data.storage.used / Math.pow(1024, 4)).toFixed(1)} TB`,
      sub: `of ${(data.storage.total / Math.pow(1024, 4)).toFixed(1)} TB`,
      icon: HardDrive,
      color: 'text-orange-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-md transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-muted shadow-inner">
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</h3>
            <p className="text-3xl font-black tracking-tighter mt-1">{stat.value}</p>
            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-tight opacity-70">
              {stat.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
