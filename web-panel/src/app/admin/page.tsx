'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Server, Users, Activity, AlertCircle, TrendingUp, HardDrive } from 'lucide-react';

const systemStats = [
  { label: 'Active Instances', value: '24', change: '+2', icon: Server, color: 'from-blue-500 to-cyan-500' },
  { label: 'Active Users', value: '156', change: '+12', icon: Users, color: 'from-purple-500 to-pink-500' },
  { label: 'System Health', value: '98%', change: '+1%', icon: Activity, color: 'from-green-500 to-emerald-500' },
  { label: 'Storage Used', value: '2.4TB', change: '+0.3TB', icon: HardDrive, color: 'from-orange-500 to-red-500' },
];

const cpuData = [
  { time: '00:00', usage: 35 },
  { time: '04:00', usage: 28 },
  { time: '08:00', usage: 52 },
  { time: '12:00', usage: 68 },
  { time: '16:00', usage: 75 },
  { time: '20:00', usage: 61 },
  { time: '24:00', usage: 48 },
];

const memoryData = [
  { time: '00:00', ram: 45, storage: 62 },
  { time: '04:00', ram: 38, storage: 60 },
  { time: '08:00', ram: 58, storage: 65 },
  { time: '12:00', ram: 72, storage: 70 },
  { time: '16:00', ram: 81, storage: 75 },
  { time: '20:00', ram: 68, storage: 72 },
  { time: '24:00', ram: 52, storage: 68 },
];

const instanceDistribution = [
  { name: 'Online', value: 20, color: '#10b981' },
  { name: 'Offline', value: 2, color: '#ef4444' },
  { name: 'Maintenance', value: 2, color: '#f59e0b' },
];

const recentActivity = [
  { id: 1, user: 'John Doe', action: 'Created new VM instance', time: '2 hours ago', type: 'success' },
  { id: 2, user: 'Jane Smith', action: 'Updated system configuration', time: '4 hours ago', type: 'info' },
  { id: 3, user: 'Admin', action: 'Restarted server cluster', time: '6 hours ago', type: 'warning' },
  { id: 4, user: 'Mike Johnson', action: 'Installed security patches', time: '8 hours ago', type: 'success' },
];

export default function AdminOverview() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your VDS administration panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-2 bg-card-foreground ${stat.color}`} />
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-green-700 bg-green-100 hover:bg-green-100">
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</h3>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPU Usage Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>CPU Usage Trend</CardTitle>
            <CardDescription>System CPU utilization over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: `1px solid var(--color-border)` }} />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Instance Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Instance Status</CardTitle>
            <CardDescription>24 total instances</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={instanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {instanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 w-full">
              {instanceDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RAM and Storage Usage */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
          <CardDescription>RAM and Storage usage over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: `1px solid var(--color-border)` }} />
              <Legend />
              <Bar dataKey="ram" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="storage" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0`}
                  style={{
                    backgroundColor: activity.type === 'success' ? '#10b981' : activity.type === 'warning' ? '#f59e0b' : '#3b82f6'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

