'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Activity, Wifi, TrendingUp, AlertCircle, ChevronRight, Server } from 'lucide-react';

const mockLabs = [
  { id: 'lab-001', name: 'Lab A - Development' },
  { id: 'lab-002', name: 'Lab B - Production' },
  { id: 'lab-003', name: 'Lab C - Testing' },
];

const mockInstances: Record<string, Array<{ id: string; name: string }>> = {
  'lab-001': [
    { id: 'vm-001', name: 'Dev-Server-01' },
    { id: 'vm-002', name: 'Dev-Server-02' },
    { id: 'vm-003', name: 'Dev-Database' },
  ],
  'lab-002': [
    { id: 'vm-004', name: 'Prod-Web-01' },
    { id: 'vm-005', name: 'Prod-Web-02' },
    { id: 'vm-006', name: 'Prod-Database' },
  ],
  'lab-003': [
    { id: 'vm-007', name: 'Test-Server-01' },
    { id: 'vm-008', name: 'Test-Server-02' },
  ],
};

const metricsData = [
  { time: '00:00', cpu: 35, memory: 45, network: 120, disk: 62 },
  { time: '01:00', cpu: 38, memory: 48, network: 130, disk: 63 },
  { time: '02:00', cpu: 32, memory: 42, network: 110, disk: 64 },
  { time: '03:00', cpu: 28, memory: 38, network: 95, disk: 65 },
  { time: '04:00', cpu: 42, memory: 52, network: 140, disk: 66 },
  { time: '05:00', cpu: 48, memory: 58, network: 160, disk: 67 },
  { time: '06:00', cpu: 55, memory: 65, network: 180, disk: 68 },
  { time: '07:00', cpu: 65, memory: 72, network: 200, disk: 70 },
  { time: '08:00', cpu: 72, memory: 78, network: 220, disk: 72 },
  { time: '09:00', cpu: 68, memory: 75, network: 210, disk: 73 },
  { time: '10:00', cpu: 62, memory: 70, network: 190, disk: 74 },
  { time: '11:00', cpu: 58, memory: 68, network: 175, disk: 75 },
  { time: '12:00', cpu: 52, memory: 62, network: 160, disk: 76 },
];

const networkData = [
  { time: '12:00', inbound: 120, outbound: 95 },
  { time: '12:30', inbound: 145, outbound: 110 },
  { time: '13:00', inbound: 160, outbound: 125 },
  { time: '13:30', inbound: 175, outbound: 140 },
  { time: '14:00', inbound: 200, outbound: 160 },
  { time: '14:30', inbound: 185, outbound: 150 },
  { time: '15:00', inbound: 170, outbound: 135 },
  { time: '15:30', inbound: 155, outbound: 120 },
];

const processData = [
  { name: 'Apache', cpu: 15, memory: 280 },
  { name: 'PostgreSQL', cpu: 22, memory: 450 },
  { name: 'Node.js', cpu: 18, memory: 320 },
  { name: 'Docker', cpu: 12, memory: 200 },
  { name: 'Redis', cpu: 8, memory: 150 },
  { name: 'Others', cpu: 25, memory: 600 },
];

export default function LiveMetrics() {
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [showAllMetrics, setShowAllMetrics] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [metrics, setMetrics] = useState(metricsData);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate live WebSocket data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics((prev) => {
        const newData = [...prev.slice(1)];
        const lastMetric = prev[prev.length - 1];
        newData.push({
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          cpu: Math.max(20, Math.min(85, lastMetric.cpu + (Math.random() - 0.5) * 15)),
          memory: Math.max(30, Math.min(90, lastMetric.memory + (Math.random() - 0.5) * 10)),
          network: Math.max(80, Math.min(250, lastMetric.network + (Math.random() - 0.5) * 30)),
          disk: lastMetric.disk + (Math.random() * 0.3),
        });
        return newData;
      });
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const currentMetrics = metrics[metrics.length - 1];
  const availableInstances = selectedLab ? mockInstances[selectedLab] : [];

  const handleLabSelect = (labId: string) => {
    setSelectedLab(labId);
    setSelectedInstance(null);
    setShowAllMetrics(false);
  };

  const handleInstanceSelect = (instanceId: string) => {
    setSelectedInstance(instanceId);
  };

  const handleViewAll = () => {
    setShowAllMetrics(true);
    setSelectedLab(null);
    setSelectedInstance(null);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Live Metrics</h1>
          <p className="text-muted-foreground">
            {showAllMetrics
              ? 'Real-time system performance monitoring across all instances'
              : selectedInstance
                ? `Real-time metrics for ${selectedInstance}`
                : 'Select a lab to view metrics'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-muted-foreground">
              {isLive ? 'Live' : 'Paused'} • Updated {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className="px-3 py-1 text-sm font-medium rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Lab Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Select Lab</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={showAllMetrics ? 'default' : 'outline'}
              onClick={handleViewAll}
              className={showAllMetrics ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              View All
            </Button>
            {mockLabs.map((lab) => (
              <Button
                key={lab.id}
                variant={selectedLab === lab.id ? 'default' : 'outline'}
                onClick={() => handleLabSelect(lab.id)}
                className={selectedLab === lab.id ? 'bg-primary text-primary-foreground' : 'border-border'}
              >
                {lab.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Instance Selection - Only show if lab is selected */}
        {selectedLab && availableInstances.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Select Instance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableInstances.map((instance) => (
                <Button
                  key={instance.id}
                  variant={selectedInstance === instance.id ? 'default' : 'outline'}
                  onClick={() => handleInstanceSelect(instance.id)}
                  className={`justify-start gap-2 ${selectedInstance === instance.id ? 'bg-primary text-primary-foreground' : 'border-border'}`}
                >
                  <Server className="w-4 h-4" />
                  {instance.name}
                  {selectedInstance === instance.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">CPU Usage</p>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {currentMetrics.cpu.toFixed(1)}%
            </p>
            <p className="text-xs text-green-600 mt-2">↓ 5% from peak</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Memory Usage</p>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {currentMetrics.memory.toFixed(1)}%
            </p>
            <p className="text-xs text-amber-600 mt-2">↑ 8% from minimum</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Network I/O</p>
              <Wifi className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {currentMetrics.network.toFixed(0)} MB/s
            </p>
            <p className="text-xs text-green-600 mt-2">Healthy traffic</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Disk Usage</p>
              <AlertCircle className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {currentMetrics.disk.toFixed(1)}%
            </p>
            <p className="text-xs text-amber-600 mt-2">Monitor growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPU, Memory, Disk Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
            <CardDescription>CPU, Memory, and Disk usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: `1px solid var(--color-border)` }} />
                <Area type="monotone" dataKey="cpu" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                <Area type="monotone" dataKey="memory" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorMemory)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>3 active alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">High CPU Usage</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">CPU usage exceeded 70% threshold</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Disk Space Low</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Disk usage at 76% of capacity</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">High Network I/O</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Sustained high network traffic detected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Traffic */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Network Traffic</CardTitle>
          <CardDescription>Inbound and outbound data transfer</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={networkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: `1px solid var(--color-border)` }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="inbound"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                name="Inbound (MB/s)"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="outbound"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={false}
                name="Outbound (MB/s)"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Processes */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Top Processes</CardTitle>
          <CardDescription>Processes using the most CPU and Memory</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={processData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: `1px solid var(--color-border)` }} />
              <Legend />
              <Bar dataKey="cpu" fill="var(--color-primary)" name="CPU %" radius={[8, 8, 0, 0]} />
              <Line
                type="monotone"
                dataKey="memory"
                stroke="var(--color-accent)"
                strokeWidth={2}
                name="Memory (MB)"
                yAxisId="right"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
