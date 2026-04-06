"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Modular Component Imports
import { OverviewStats } from '@/components/overview/overview-stats';
import { CpuTrendChart } from '@/components/overview/cpu-trend-chart';
import { InstancePieChart } from '@/components/overview/instance-pie-chart';
import { ResourceUtilizationChart } from '@/components/overview/resource-utilization-chart';
import { RecentActivity } from '@/components/overview/recent-activity';

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const response = await axios.get("/api/dashboard");
      return response.data;
    },
    refetchInterval: 60000 // Auto-refresh every minute
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-[400px] bg-muted rounded-xl" />
          <div className="h-[400px] bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) return <div className="p-8 text-red-500 font-bold">Error fetching dashboard telemetry.</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground font-medium">Infrastructure status and audit trail</p>
      </div>

      {/* 1. Main Metrics Cards */}
      <OverviewStats data={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. CPU Line Chart (InfluxDB) */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">CPU Load Velocity (24h)</CardTitle>
            <CardDescription>Aggregate compute utilization excluding templates</CardDescription>
          </CardHeader>
          <CardContent>
            <CpuTrendChart data={data.cpuTrend} />
          </CardContent>
        </Card>

        {/* 3. Instance Distribution Pie (Proxmox) */}
        <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Instance Status</CardTitle>
            <CardDescription>Live state breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <InstancePieChart data={data.instanceDistribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. Weekly Resource Bar Chart (InfluxDB) */}
        <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Utilization Trends</CardTitle>
            <CardDescription>7-Day historical average for RAM and Storage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceUtilizationChart data={data.weeklyUtil} />
          </CardContent>
        </Card>

        {/* 5. Recent Activity List (Postgres) */}
        <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Recent Activity</CardTitle>
            <CardDescription>Last 10 security and infrastructure events</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity logs={data.recentActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
