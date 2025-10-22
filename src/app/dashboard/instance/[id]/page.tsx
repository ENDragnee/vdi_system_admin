"use client"

import { useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Server, Cpu, HardDrive, Activity, ArrowLeft, Calendar, Clock, Network } from "lucide-react"

const DUMMY_INSTANCES: Record<string, any> = {
  "1": {
    id: "1",
    name: "Production Server 1",
    status: "online",
    os_type: "Ubuntu 22.04",
    ip_address: "192.168.1.100",
    cpu_cores: 8,
    cpu_usage: 45.2,
    ram_used: 8192,
    ram_total: 16384,
    storage_used: 250,
    storage_total: 500,
    network_in: 125.5,
    network_out: 89.3,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_updated: new Date().toISOString(),
  },
  "2": {
    id: "2",
    name: "Development Server",
    status: "online",
    os_type: "Ubuntu 20.04",
    ip_address: "192.168.1.101",
    cpu_cores: 4,
    cpu_usage: 28.7,
    ram_used: 4096,
    ram_total: 8192,
    storage_used: 120,
    storage_total: 300,
    network_in: 45.2,
    network_out: 32.1,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_updated: new Date().toISOString(),
  },
  "3": {
    id: "3",
    name: "Database Server",
    status: "online",
    os_type: "CentOS 8",
    ip_address: "192.168.1.102",
    cpu_cores: 16,
    cpu_usage: 62.5,
    ram_used: 12288,
    ram_total: 16384,
    storage_used: 450,
    storage_total: 500,
    network_in: 256.8,
    network_out: 198.4,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    last_updated: new Date().toISOString(),
  },
  "4": {
    id: "4",
    name: "Backup Server",
    status: "maintenance",
    os_type: "Ubuntu 22.04",
    ip_address: "192.168.1.103",
    cpu_cores: 4,
    cpu_usage: 15.3,
    ram_used: 2048,
    ram_total: 8192,
    storage_used: 380,
    storage_total: 1000,
    network_in: 12.5,
    network_out: 8.2,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    last_updated: new Date().toISOString(),
  },
}

const generateDummyMetrics = (instanceId: string) => {
  const metrics = []
  const now = Date.now()
  const instance = DUMMY_INSTANCES[instanceId]

  for (let i = 50; i > 0; i--) {
    const timestamp = now - i * 60 * 1000 // 1 minute intervals
    const variance = Math.sin(i / 10) * 20

    metrics.push({
      id: `metric-${i}`,
      vds_id: instanceId,
      cpu_usage: Math.max(5, Math.min(95, instance.cpu_usage + variance + (Math.random() - 0.5) * 10)),
      ram_used: Math.max(1024, Math.min(instance.ram_total - 1024, instance.ram_used + (Math.random() - 0.5) * 2048)),
      storage_used: instance.storage_used + (Math.random() - 0.5) * 10,
      network_in: Math.max(0, instance.network_in + (Math.random() - 0.5) * 50),
      network_out: Math.max(0, instance.network_out + (Math.random() - 0.5) * 40),
      recorded_at: new Date(timestamp).toISOString(),
    })
  }

  return metrics
}

const ResourceChart = dynamic(
  () => import("@/components/ResourceChart").then((mod) => ({ default: mod.ResourceChart })),
  {
    ssr: false,
    loading: () => <div className="h-[300px] flex items-center justify-center text-slate-400">Loading chart...</div>,
  },
)

const NetworkChart = dynamic(() => import("@/components/NetworkChart").then((mod) => ({ default: mod.NetworkChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center text-slate-400">Loading chart...</div>,
})

export default function InstanceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const instanceId = params.id as string

  const instance = DUMMY_INSTANCES[instanceId]
  const metrics = useMemo(() => generateDummyMetrics(instanceId), [instanceId])

  if (!instance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Instance Not Found</h2>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-600 hover:bg-green-700">Online</Badge>
      case "offline":
        return <Badge className="bg-red-600 hover:bg-red-700">Offline</Badge>
      case "maintenance":
        return <Badge className="bg-amber-600 hover:bg-amber-700">Maintenance</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatChartData = () => {
    return metrics.map((metric) => ({
      time: new Date(metric.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      cpu: Number(metric.cpu_usage.toFixed(2)),
      ram: Number(((metric.ram_used / (instance?.ram_total || 1)) * 100).toFixed(2)),
      storage: Number(((metric.storage_used / (instance?.storage_total || 1)) * 100).toFixed(2)),
    }))
  }

  const formatNetworkData = () => {
    return metrics.map((metric) => ({
      time: new Date(metric.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      in: Number(metric.network_in.toFixed(2)),
      out: Number(metric.network_out.toFixed(2)),
    }))
  }

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
            <div className="flex items-center space-x-3">{getStatusBadge(instance.status)}</div>
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
                {instance.ram_used} MB / {instance.ram_total} MB
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
                {instance.storage_used} GB / {instance.storage_total} GB
              </p>
            </CardContent>
          </Card>
        </div>

        {metrics.length > 0 ? (
          <>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur mb-8">
              <CardHeader>
                <CardTitle className="text-white">Resource Usage Over Time</CardTitle>
                <CardDescription className="text-slate-400">CPU, RAM, and Storage utilization history</CardDescription>
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
                  Incoming and outgoing network traffic (MB/s)
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
              <p className="text-slate-400">Metrics history will appear here once data is collected</p>
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
  )
}
