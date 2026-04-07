"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Landmark, Server, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Modular Component Imports (Reusing Admin Components)
import { CpuTrendChart } from '@/components/overview/cpu-trend-chart';
import { RecentActivity } from '@/components/overview/recent-activity';

export default function FacultyDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["faculty-dashboard-data"],
    queryFn: async () => (await axios.get("/api/dashboard")).data,
    refetchInterval: 60000
  });

  if (isLoading) return <div className="p-8 animate-pulse text-2xl font-bold">Loading Lab Data...</div>;
  if (isError) return <div className="p-8 text-red-500">You must be assigned to a lab to view this dashboard.</div>;

  // Custom Stat structure for Faculty (simplified compared to Admin)
  const facultyStats = {
    instances: data.stats.instances,
    faculties: 1, // Always 1 for them
    labs: 1,      // Always 1 for them
    storage: { used: 0, total: 0 } // Proxmox storage is usually cluster-wide, we can omit for Faculty
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Landmark className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">{data.labName}</h1>
          <p className="text-muted-foreground font-medium text-sm uppercase tracking-widest">Faculty Control Panel</p>
        </div>
      </div>

      {/* Grid for Active Instances and Basic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <Server className="w-8 h-8 mb-4 opacity-50" />
            <h3 className="text-sm font-bold uppercase opacity-80">Lab Instances</h3>
            <p className="text-4xl font-black tracking-tighter">
              {data.stats.instances.active} <span className="text-xl opacity-60">/ {data.stats.instances.total}</span>
            </p>
            <p className="text-[10px] uppercase font-bold mt-2 opacity-70 border-t border-white/20 pt-2">
              Running vs Allocated
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> 24h Resource Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CpuTrendChart data={data.cpuTrend} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity for this Lab Only */}
        <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Lab Activity Trail</CardTitle>
            <CardDescription>Recent actions within your assigned laboratory</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity logs={data.recentActivity} />
          </CardContent>
        </Card>

        {/* Placeholder for Quick Links */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-muted/50 to-muted/20 border-l-4 border-primary">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Quick Management</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start font-bold text-xs" asChild>
                <a href="/faculty/instances">Manage Instances</a>
              </Button>
              <Button variant="outline" className="justify-start font-bold text-xs" asChild>
                <a href="/faculty/metrics">Live Telemetry</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
