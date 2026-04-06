"use client";

import { useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { Activity, Wifi, Server, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResourceChart } from './resource-chart';

let socket: Socket;

export function LiveMetricsContainer() {
  const [metricsBuffer, setMetricsBuffer] = useState<any[]>([]);
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the custom server's websocket
    socket = io();

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("vm-metrics-update", (data) => {
      setMetricsBuffer((prev) => {
        const next = [...prev, data];
        return next.slice(-60); // Keep last 60 seconds (assuming 1s interval)
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const chartData = useMemo(() => {
    return selectedHost
      ? metricsBuffer.filter(m => m.host === selectedHost)
      : metricsBuffer;
  }, [metricsBuffer, selectedHost]);

  const current = chartData[chartData.length - 1] || { cpu: 0, ram: 0, netIn: 0, netOut: 0, uptime: 0 };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight">Live Telemetry</h1>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-border shadow-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono font-black uppercase">
            {isConnected ? 'WS Stream Active' : 'WS Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="CPU" value={`${current.cpu.toFixed(1)}%`} icon={<Activity className="text-blue-500" />} color="bg-blue-500" />
        <MetricCard title="RAM" value={`${current.ram.toFixed(1)}%`} icon={<Zap className="text-purple-500" />} color="bg-purple-500" />
        <MetricCard title="Net In" value={`${current.netIn.toFixed(2)} MB/s`} icon={<Wifi className="text-green-500" />} color="bg-green-500" />
        <MetricCard title="Uptime" value={`${Math.floor(current.uptime / 3600)}h`} icon={<Clock className="text-amber-500" />} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader><CardTitle className="text-xs uppercase opacity-40">System Resource Flow</CardTitle></CardHeader>
          <CardContent><ResourceChart data={chartData} /></CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-xs uppercase opacity-40">Connected VM List</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Array.from(new Set(metricsBuffer.map(m => m.host))).map(host => (
              <button
                key={host}
                onClick={() => setSelectedHost(host === selectedHost ? null : host)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedHost === host ? 'bg-primary/10 border-primary' : 'hover:bg-muted border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4" />
                  <span className="text-sm font-bold">{host}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden bg-card">
      <div className={`h-1 w-full ${color}`} />
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">{title}</p>
          {icon}
        </div>
        <p className="text-3xl font-bold tracking-tighter">{value}</p>
      </CardContent>
    </Card>
  );
}
