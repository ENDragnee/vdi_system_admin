"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server, Cpu, HardDrive, Activity, ArrowLeft, Calendar, Clock, Network, RefreshCw } from "lucide-react";

// Interface for the main instance details
interface Instance {
  id: string;
  name: string;
  status: "online" | "offline";
  os_type: string;
  ip_address: string;
  cpu_cores: number;
  cpu_usage: number;
  ram_used: number;    // in MB
  ram_total: number;   // in MB
  storage_used: number;// in GB
  storage_total: number;// in GB
  network_in: number;  // in MB/s
  network_out: number; // in MB/s
  created_at: string;
  last_updated: string;
}

// Interface for a single point of historical data from the metrics API
interface MetricPoint {
  recorded_at: string;
  cpu_usage: number;
  ram_used: number;      // in MB
  storage_used: number;  // in GB
  network_in: number;    // in MB/s
  network_out: number;   // in MB/s
}

// Dynamically import charts to prevent SSR issues, with a loading state
const ResourceChart = dynamic(
  () => import("@/components/ResourceChart").then((mod) => ({ default: mod.ResourceChart })),
  {
    ssr: false,
    loading: () => <div className="h-[300px] flex items-center justify-center text-slate-400">Loading chart...</div>,
  }
);

const NetworkChart = dynamic(() => import("@/components/NetworkChart").then((mod) => ({ default: mod.NetworkChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center text-slate-400">Loading chart...</div>,
});

// Define the polling interval in milliseconds
const POLLING_INTERVAL = 5000; // 30 seconds

export default function InstanceDetailPage() {
  const params = useParams();
  const instanceId = params.id as string;

  // State variables to hold data and manage UI state
  const [instance, setInstance] = useState<Instance | null>(null);
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For the initial page load
  const [isRefetching, setIsRefetching] = useState(false); // For manual/polling refresh
  const [error, setError] = useState<string | null>(null);

  // Memoize the data fetching function with useCallback
  const fetchData = useCallback(async (isRefresh = false) => {
    // Only show the full-page loader on the initial fetch
    if (!isRefresh) {
      setIsLoading(true);
    }
    setIsRefetching(true);
    setError(null);

    try {
      // Fetch instance details and historical metrics in parallel for efficiency
      const [allInstancesRes, metricsRes] = await Promise.all([
        axios.get("/api/instances"),
        axios.get(`/api/instances/${instanceId}/metrics`)
      ]);

      const allInstances: Instance[] = allInstancesRes.data;
      const metricsData: MetricPoint[] = metricsRes.data;

      const currentInstance = allInstances.find(inst => inst.id === instanceId);

      if (!currentInstance) {
        throw new Error("Instance not found.");
      }

      // Determine the last updated time from the latest metric point
      const lastUpdatedTime = metricsData.length > 0
        ? metricsData[metricsData.length - 1].recorded_at
        : currentInstance.created_at;

      setInstance({ ...currentInstance, last_updated: lastUpdatedTime });
      setMetrics(metricsData);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Failed to fetch instance data:", e);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [instanceId]);

  // useEffect for the initial data load
  useEffect(() => {
    if (instanceId) {
      fetchData();
    }
  }, [instanceId, fetchData]);

  // useEffect for setting up the polling interval
  useEffect(() => {
    if (!instanceId) return;

    // Set up an interval to refetch data periodically
    const intervalId = setInterval(() => {
      fetchData(true); // Pass true to indicate it's a background refresh
    }, POLLING_INTERVAL);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [instanceId, fetchData]);

  // UI state for initial loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 flex items-center justify-center text-white text-lg">
        <Activity className="w-6 h-6 mr-3 animate-spin" />
        Loading Instance Data...
      </div>
    );
  }

  // UI state for error or if the instance is not found
  if (error || !instance) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{error || "Instance Not Found"}</h2>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-600 hover:bg-green-700">Online</Badge>;
      case "offline":
        return <Badge className="bg-red-600 hover:bg-red-700">Offline</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Helper to format data for the resource chart, with null-safety
  const formatChartData = () => {
    return metrics.map((metric) => ({
      time: new Date(metric.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      cpu: Number((metric.cpu_usage || 0).toFixed(2)),
      ram: Number((((metric.ram_used || 0) / (instance.ram_total || 1)) * 100).toFixed(2)),
      storage: Number((((metric.storage_used || 0) / (instance.storage_total || 1)) * 100).toFixed(2)),
    }));
  };

  // Helper to format data for the network chart, with null-safety
  const formatNetworkData = () => {
    return metrics.map((metric) => ({
      time: new Date(metric.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      in: Number((metric.network_in || 0).toFixed(2)),
      out: Number((metric.network_out || 0).toFixed(2)),
    }));
  };

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">{instance.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(true)}
                disabled={isRefetching}
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                {isRefetching ? 'Refreshing...' : 'Refresh'}
              </Button>
              {getStatusBadge(instance.status)}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Operating System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{instance.os_type}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">IP Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{instance.ip_address || "N/A"}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">CPU Cores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{instance.cpu_cores} Cores</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-blue-400" />
                  CPU Usage
                </CardTitle>
                <span className="text-2xl font-bold text-white">{instance.cpu_usage.toFixed(1)}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={instance.cpu_usage} className="h-3" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  RAM Usage
                </CardTitle>
                <span className="text-2xl font-bold text-white">
                  {((instance.ram_used / instance.ram_total) * 100).toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={(instance.ram_used / instance.ram_total) * 100} className="h-3" />
              <p className="text-sm text-slate-400 mt-2">
                {instance.ram_used.toFixed(0)} MB / {instance.ram_total.toFixed(0)} MB
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <HardDrive className="w-5 h-5 mr-2 text-purple-400" />
                  Storage
                </CardTitle>
                <span className="text-2xl font-bold text-white">
                  {((instance.storage_used / instance.storage_total) * 100).toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={(instance.storage_used / instance.storage_total) * 100} className="h-3" />
              <p className="text-sm text-slate-400 mt-2">
                {instance.storage_used.toFixed(2)} GB / {instance.storage_total.toFixed(2)} GB
              </p>
            </CardContent>
          </Card>
        </div>

        {metrics.length > 0 ? (
          <>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur mb-8">
              <CardHeader>
                <CardTitle className="text-white">Resource Usage Over Time</CardTitle>
                <CardDescription className="text-slate-400">CPU, RAM, and Storage utilization for the last hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceChart data={formatChartData()} />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Network className="w-5 h-5 mr-2 text-cyan-400" />
                  Network Traffic
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Incoming and outgoing network traffic (MB/s) for the last hour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NetworkChart data={formatNetworkData()} />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="py-16 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Historical Data</h3>
              <p className="text-slate-400">Metrics history for the last hour will appear here.</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Instance Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div className="flex items-center text-slate-300">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                Created At
              </div>
              <span className="text-white">{new Date(instance.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div className="flex items-center text-slate-300">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                Last Updated
              </div>
              <span className="text-white">{new Date(instance.last_updated).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center text-slate-300">
                <Server className="w-4 h-4 mr-2 text-slate-400" />
                Instance ID
              </div>
              <span className="text-white font-mono text-sm">{instance.id}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
