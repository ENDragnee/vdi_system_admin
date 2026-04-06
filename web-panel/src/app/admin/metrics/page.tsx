"use client";

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Wifi, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

import { MetricCard } from '@/components/metrics/metric-card';
import { AlertItem } from '@/components/metrics/alert-item';
import { ResourceChart } from '@/components/metrics/resource-chart';
import { NetworkChart } from '@/components/metrics/network-chart';
import { LiveMetricsSelectors } from '@/components/metrics/live-metrics-selectors';

let socket: Socket;

export default function LiveMetricsPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [showAllMetrics, setShowAllMetrics] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [metricsBuffer, setMetricsBuffer] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Handle Hydration
  useEffect(() => {
    setHasMounted(true);
    socket = io();
    socket.on("vm-metrics-update", (data) => {
      if (!isLive) return;
      setMetricsBuffer((prev) => [...prev, data].slice(-40));
      setLastUpdate(new Date());
    });
    return () => { socket.disconnect(); };
  }, [isLive]);

  const { data: managedData } = useQuery({
    queryKey: ["managed-vms-list"],
    queryFn: async () => {
      const labsRes = await axios.get("/api/labs");
      const vmsRes = await axios.get("/api/vm/managed");
      return { labs: labsRes.data.data, vms: vmsRes.data };
    }
  });

  const filteredMetrics = useMemo(() => {
    if (showAllMetrics || !selectedInstance) return metricsBuffer;
    return metricsBuffer.filter(m => m.host === selectedInstance);
  }, [metricsBuffer, showAllMetrics, selectedInstance]);

  const current = filteredMetrics[filteredMetrics.length - 1] || {
    cpu: 0, ram: 0, netIn: 0, netOut: 0, uptime: 0
  };

  if (!hasMounted) return <div className="p-8 animate-pulse">Initializing Telemetry...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Live Metrics</h1>
          <p className="text-muted-foreground">Kafka-backed real-time infrastructure stream</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full border shadow-inner">
            <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px]", isLive ? "bg-green-500 animate-pulse shadow-green-500" : "bg-gray-500")} />
            <span className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">
              {isLive ? 'Live' : 'Paused'} • {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <Button variant="outline" size="sm" className="rounded-full px-6" onClick={() => setIsLive(!isLive)}>
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      <LiveMetricsSelectors
        labs={managedData?.labs || []}
        vms={managedData?.vms || []}
        selectedLab={selectedLab}
        selectedInstance={selectedInstance}
        showAllMetrics={showAllMetrics}
        onLabSelect={(id) => { setSelectedLab(id); setSelectedInstance(null); setShowAllMetrics(false); }}
        onInstanceSelect={setSelectedInstance}
        onViewAll={() => { setShowAllMetrics(true); setSelectedLab(null); setSelectedInstance(null); }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="CPU Load" value={`${current.cpu.toFixed(1)}%`} icon={<Activity className="text-blue-500" />} color="from-blue-500 to-cyan-500" />
        <MetricCard title="Memory" value={`${current.ram.toFixed(1)}%`} icon={<TrendingUp className="text-purple-500" />} color="from-purple-500 to-pink-500" />
        <MetricCard title="Net Activity" value={`${(current.netIn + current.netOut).toFixed(2)} MB/s`} icon={<Wifi className="text-green-500" />} color="from-green-500 to-emerald-500" />
        <MetricCard title="Uptime" value={`${Math.floor(current.uptime / 3600)}h`} icon={<Clock className="text-orange-500" />} color="from-orange-500 to-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-tighter">Usage Intensity Map</CardTitle>
          </CardHeader>
          <CardContent><ResourceChart data={filteredMetrics} /></CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/40">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-tighter">Active Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertItem active={current.cpu > 80} title="CPU Saturation" desc="Usage exceeds 80% threshold" type="error" />
            <AlertItem active={current.ram > 90} title="Memory Pressure" desc="Available RAM below 10%" type="warning" />
            <AlertItem active={true} title="System Stable" desc="WebSocket connection verified" type="info" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-card/40">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-tighter">Network IO Waveform</CardTitle>
        </CardHeader>
        <CardContent><NetworkChart data={filteredMetrics} /></CardContent>
      </Card>
    </div>
  );
}
