"use client";

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { cn } from '@/lib/utils';
import { Activity, TrendingUp, Wifi, Clock, Server, MonitorPause } from 'lucide-react';

// Reuse your modular components
import { MetricCard } from '@/components/metrics/metric-card';
import { ResourceChart } from '@/components/metrics/resource-chart';
import { NetworkChart } from '@/components/metrics/network-chart';
import { AlertItem } from '@/components/metrics/alert-item';
import { CardHeader, CardTitle, Card, CardContent } from '@/components/ui/card';

let socket: Socket;

export default function FacultyMetricsPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [metricsBuffer, setMetricsBuffer] = useState<any[]>([]);
  const [selectedVm, setSelectedVm] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  // 1. Fetch hostnames belonging to this Faculty's Lab
  const { data: myVms, isLoading: loadingVms } = useQuery({
    queryKey: ["my-lab-vms"],
    queryFn: async () => (await axios.get("/api/vm/managed")).data,
  });

  const myVmHostnames = useMemo(() => myVms?.map((v: any) => v.hostname) || [], [myVms]);

  // 2. WebSocket Connection with Client-Side Lab Filtering
  useEffect(() => {
    setHasMounted(true);
    socket = io();

    socket.on("vm-metrics-update", (data) => {
      // THE SECURITY FILTER:
      // Only process the message if the host belongs to this Faculty's lab
      if (isLive && myVmHostnames.includes(data.host)) {
        setMetricsBuffer((prev) => [...prev, data].slice(-40));
      }
    });

    return () => { socket.disconnect(); };
  }, [isLive, myVmHostnames]);

  // 3. Filter buffer based on UI selection (Individual VM vs Lab Total)
  const displayData = useMemo(() => {
    if (!selectedVm) return metricsBuffer;
    return metricsBuffer.filter(m => m.host === selectedVm);
  }, [metricsBuffer, selectedVm]);

  const current = displayData[displayData.length - 1] || { cpu: 0, ram: 0, netIn: 0, netOut: 0, uptime: 0 };

  if (!hasMounted || loadingVms) return <div className="p-8 animate-pulse font-black uppercase text-sm">Synchronizing Lab Stream...</div>;

  if (myVmHostnames.length === 0) return (
    <div className="p-8 flex flex-col items-center justify-center h-[60vh] text-center">
      <MonitorPause className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
      <h2 className="text-xl font-bold">No Active Lab Resources</h2>
      <p className="text-muted-foreground max-w-xs">There are currently no VMs assigned to your laboratory to monitor.</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Lab Telemetry</h1>
          <p className="text-muted-foreground font-medium">Real-time resource utilization for {myVms?.[0]?.labName}</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full border">
          <div className={cn("w-2 h-2 rounded-full", isLive ? "bg-green-500 animate-pulse" : "bg-gray-500")} />
          <span className="text-[10px] font-black uppercase tracking-widest">{isLive ? 'Live' : 'Paused'}</span>
        </div>
      </div>

      {/* Instance Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedVm(null)}
          className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border",
            !selectedVm ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-card border-border text-muted-foreground")}
        >
          Entire Lab
        </button>
        {myVms?.map((vm: any) => (
          <button
            key={vm.id}
            onClick={() => setSelectedVm(vm.hostname)}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border",
              selectedVm === vm.hostname ? "bg-primary text-primary-foreground border-primary shadow-lg" : "bg-card border-border text-muted-foreground")}
          >
            {vm.hostname}
          </button>
        ))}
      </div>

      {/* Real-time Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="CPU Usage" value={`${current.cpu.toFixed(1)}%`} icon={<Activity className="text-blue-500" />} color="from-blue-500 to-cyan-500" />
        <MetricCard title="Memory" value={`${current.ram.toFixed(1)}%`} icon={<TrendingUp className="text-purple-500" />} color="from-purple-500 to-pink-500" />
        <MetricCard title="IO Rate" value={`${(current.netIn + current.netOut).toFixed(2)} MB/s`} icon={<Wifi className="text-green-500" />} color="from-green-500 to-emerald-500" />
        <MetricCard title="Avg Uptime" value={`${Math.floor(current.uptime / 3600)}h`} icon={<Clock className="text-orange-500" />} color="from-orange-500 to-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md">
            <CardHeader><CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Compute & Memory Flow</CardTitle></CardHeader>
            <CardContent><ResourceChart data={displayData} /></CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card/40 backdrop-blur-md">
            <CardHeader><CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Bandwidth Consumption</CardTitle></CardHeader>
            <CardContent><NetworkChart data={displayData} /></CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-card/40">
            <CardHeader><CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest">Lab Thresholds</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <AlertItem active={current.cpu > 70} title="Load Warning" desc="VM is under heavy compute load" type="warning" />
              <AlertItem active={current.ram > 85} title="Memory Warning" desc="RAM utilization is critical" type="error" />
              <AlertItem active={true} title="Stream Healthy" desc="Receiving Kafka telemetry" type="info" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
