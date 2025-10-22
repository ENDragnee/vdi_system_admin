"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Server, Cpu, HardDrive, Activity, LogOut, Plus, ArrowUpDown } from "lucide-react"

const DUMMY_INSTANCES = [
  {
    id: "1",
    name: "Production Server 1",
    status: "online",
    os_type: "Ubuntu 22.04",
    ip_address: "192.168.1.100",
    cpu_usage: 45.2,
    ram_used: 8192,
    ram_total: 16384,
    storage_used: 250,
    storage_total: 500,
    network_in: 125.5,
    network_out: 89.3,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Development Server",
    status: "online",
    os_type: "Ubuntu 20.04",
    ip_address: "192.168.1.101",
    cpu_usage: 28.7,
    ram_used: 4096,
    ram_total: 8192,
    storage_used: 120,
    storage_total: 300,
    network_in: 45.2,
    network_out: 32.1,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Database Server",
    status: "online",
    os_type: "CentOS 8",
    ip_address: "192.168.1.102",
    cpu_usage: 62.5,
    ram_used: 12288,
    ram_total: 16384,
    storage_used: 450,
    storage_total: 500,
    network_in: 256.8,
    network_out: 198.4,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Backup Server",
    status: "maintenance",
    os_type: "Ubuntu 22.04",
    ip_address: "192.168.1.103",
    cpu_usage: 15.3,
    ram_used: 2048,
    ram_total: 8192,
    storage_used: 380,
    storage_total: 1000,
    network_in: 12.5,
    network_out: 8.2,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function DashboardPage() {
  const [instances] = useState(DUMMY_INSTANCES)
  const router = useRouter()

  const handleSignOut = () => {
    router.push("/")
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
              <span className="text-slate-400 text-sm">admin@example.com</span>
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
            <h1 className="text-3xl font-bold text-white mb-2">Virtual Desktop Instances</h1>
            <p className="text-slate-400">Monitor and manage your VDS infrastructure</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Instance
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <Link key={instance.id} href={`/dashboard/instance/${instance.id}`}>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:bg-slate-800/70 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-white text-lg">{instance.name}</CardTitle>
                    {getStatusBadge(instance.status)}
                  </div>
                  <div className="flex items-center text-slate-400 text-sm space-x-2">
                    <span>{instance.os_type}</span>
                    {instance.ip_address && (
                      <>
                        <span>•</span>
                        <span>{instance.ip_address}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-slate-300">
                        <Cpu className="w-4 h-4 mr-2 text-blue-400" />
                        CPU
                      </div>
                      <span className="text-slate-400">{instance.cpu_usage.toFixed(1)}%</span>
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
                        {instance.ram_used} / {instance.ram_total} MB
                      </span>
                    </div>
                    <Progress value={(instance.ram_used / instance.ram_total) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-slate-300">
                        <HardDrive className="w-4 h-4 mr-2 text-purple-400" />
                        Storage
                      </div>
                      <span className="text-slate-400">
                        {instance.storage_used} / {instance.storage_total} GB
                      </span>
                    </div>
                    <Progress value={(instance.storage_used / instance.storage_total) * 100} className="h-2" />
                  </div>

                  <div className="pt-2 border-t border-slate-700">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-slate-400">
                        <ArrowUpDown className="w-3 h-3 mr-1" />
                        Network
                      </div>
                      <div className="text-slate-400">
                        <span className="text-green-400">↓ {instance.network_in.toFixed(2)}</span>
                        {" / "}
                        <span className="text-blue-400">↑ {instance.network_out.toFixed(2)}</span>
                        {" MB/s"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
