"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  LogOut,
  Plus,
  ArrowUpDown,
  AlertTriangle,
} from "lucide-react";
import { auth } from "../../lib/auth";
import { signOut } from "@/lib/actions/auth-actions";

type Session = typeof auth.$Infer.Session;

// --- Type Definition for Instance Data ---
// This should match the structure returned by your /api/instances endpoint.
interface InstanceData {
  id: string;
  name: string;
  status: "online" | "offline" | "maintenance";
  os_type: string;
  ip_address: string;
  cpu_usage: number;
  ram_used: number; // in MB
  ram_total: number; // in MB
  storage_used: number; // in GB
  storage_total: number; // in GB
  network_in: number; // in MB/s
  network_out: number; // in MB/s
}

export default function DashboardPage({ session }: { session: Session }) {
  // --- State Management for Dynamic Data ---
  const [instances, setInstances] = useState<InstanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- Data Fetching and Polling Logic ---
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const res = await fetch("/api/instances");
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch instance data: ${errorText}`);
        }
        const data: InstanceData[] = await res.json();
        setInstances(data);
        setError(null); // Clear previous errors on success
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        // Only set loading to false on the initial fetch
        if (isLoading) {
          setIsLoading(false);
        }
      }
    };

    fetchInstances(); // Initial fetch

    // Set up an interval to poll for new data every 10 seconds
    const interval = setInterval(fetchInstances, 10000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [isLoading]); // Rerun effect if isLoading changes (though it won't in this setup)

  // --- Helper Functions (Unchanged) ---
  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">Online</Badge>
        );
      case "offline":
        return <Badge className="bg-red-600 hover:bg-red-700">Offline</Badge>;
      case "maintenance":
        return (
          <Badge className="bg-amber-600 hover:bg-amber-700">Maintenance</Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // --- Main Render Function ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-slate-400 py-16">
          <Activity className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-lg">Discovering instances...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg text-center text-red-300">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Failed to Load Instances
          </h3>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (instances.length === 0) {
      return (
        <div className="text-center text-slate-400 py-16 bg-slate-800/30 rounded-lg">
          <Server className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Instances Found
          </h3>
          <p>
            As soon as a server with Telegraf starts reporting, it will appear
            here.
          </p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((instance) => (
          <Link key={instance.id} href={`/dashboard/instance/${instance.id}`}>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all cursor-pointer h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle
                    className="text-white text-lg truncate"
                    title={instance.name}
                  >
                    {instance.name}
                  </CardTitle>
                  {getStatusBadge(instance.status)}
                </div>
                <div className="flex items-center text-slate-400 text-sm space-x-2">
                  <span className="truncate">{instance.os_type}</span>
                  {instance.ip_address && (
                    <>
                      <span>•</span>
                      <span>{instance.ip_address}</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 grow flex flex-col justify-end">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-300">
                      <Cpu className="w-4 h-4 mr-2 text-blue-400" />
                      CPU
                    </div>
                    <span className="text-slate-400">
                      {instance.cpu_usage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={instance.cpu_usage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-300">
                      <Activity className="w-4 h-4 mr-2 text-green-400" />
                      RAM
                    </div>
                    <span className="text-slate-400">
                      {instance.ram_used.toFixed(0)} /{" "}
                      {instance.ram_total.toFixed(0)} MB
                    </span>
                  </div>
                  <Progress
                    value={(instance.ram_used / instance.ram_total) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-300">
                      <HardDrive className="w-4 h-4 mr-2 text-purple-400" />
                      Storage
                    </div>
                    <span className="text-slate-400">
                      {instance.storage_used.toFixed(1)} /{" "}
                      {instance.storage_total.toFixed(1)} GB
                    </span>
                  </div>
                  <Progress
                    value={
                      (instance.storage_used / instance.storage_total) * 100
                    }
                    className="h-2"
                  />
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-400">
                      <ArrowUpDown className="w-3 h-3 mr-1" />
                      Network
                    </div>
                    <div className="text-slate-400">
                      <span className="text-green-400">
                        ↓ {instance.network_in.toFixed(2)}
                      </span>
                      {" / "}
                      <span className="text-blue-400">
                        ↑ {instance.network_out.toFixed(2)}
                      </span>
                      {" MB/s"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VDS Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm">{session.user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Virtual Desktop Instances
            </h1>
            <p className="text-slate-400">
              Live overview of your VDS infrastructure
            </p>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
