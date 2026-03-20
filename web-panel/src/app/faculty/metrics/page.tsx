
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Download, TrendingUp, Cpu, HardDrive, Activity } from 'lucide-react';

const performanceData = [
  { date: 'Mar 10', cpu: 35, memory: 42, disk: 58 },
  { date: 'Mar 11', cpu: 38, memory: 45, disk: 59 },
  { date: 'Mar 12', cpu: 42, memory: 48, disk: 61 },
  { date: 'Mar 13', cpu: 58, memory: 62, disk: 65 },
  { date: 'Mar 14', cpu: 72, memory: 75, disk: 70 },
  { date: 'Mar 15', cpu: 65, memory: 70, disk: 72 },
  { date: 'Mar 16', cpu: 52, memory: 58, disk: 74 },
  { date: 'Mar 17', cpu: 45, memory: 52, disk: 75 },
];

const courseDistribution = [
  { name: 'CS101', value: 24, color: '#3b82f6' },
  { name: 'CS201', value: 18, color: '#8b5cf6' },
  { name: 'CS301', value: 15, color: '#ec4899' },
  { name: 'CS401', value: 12, color: '#f59e0b' },
  { name: 'CS501', value: 8, color: '#10b981' },
];

const coursePerformance = [
  { course: 'CS101', avgCPU: 45, peakCPU: 78, avgMemory: 52, instances: 8 },
  { course: 'CS201', avgCPU: 38, peakCPU: 65, avgMemory: 45, instances: 6 },
  { course: 'CS301', avgCPU: 52, peakCPU: 82, avgMemory: 58, instances: 5 },
  { course: 'CS401', avgCPU: 61, peakCPU: 88, avgMemory: 68, instances: 4 },
  { course: 'CS501', avgCPU: 68, peakCPU: 92, avgMemory: 75, instances: 3 },
]
export default function FacultyMetrics() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/faculty">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-1">Detailed Metrics</h1>
              <p className="text-muted-foreground">Comprehensive analysis of resource usage and performance</p>
            </div>
          </div>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Avg CPU Usage</p>
                <Cpu className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">52.4%</p>
              <p className="text-xs text-green-600 mt-2">↓ 3% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Avg Memory Usage</p>
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">57.6%</p>
              <p className="text-xs text-amber-600 mt-2">↑ 2% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Peak CPU Usage</p>
                <TrendingUp className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">92%</p>
              <p className="text-xs text-red-600 mt-2">Reached on Mar 14</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Active VM Instances</p>
                <HardDrive className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">26</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Across 5 courses</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Over Time */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>CPU, Memory, and Disk usage over the last 8 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: `1px solid var(--color-border)` }} />
                <Legend />
                <Area type="monotone" dataKey="cpu" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" isAnimationActive={false} />
                <Area type="monotone" dataKey="memory" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorMemory)" name="Memory %" isAnimationActive={false} />
                <Area type="monotone" dataKey="disk" stroke="#10b981" fillOpacity={1} fill="url(#colorDisk)" name="Disk %" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Distribution and Course Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Student Distribution</CardTitle>
              <CardDescription>Active students by course</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {courseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-2 w-full">
                {courseDistribution.map((item) => (
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

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>CPU usage comparison by course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="course" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: `1px solid var(--color-border)` }} />
                  <Legend />
                  <Bar dataKey="avgCPU" fill="var(--color-primary)" name="Avg CPU %" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="peakCPU" fill="var(--color-accent)" name="Peak CPU %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Course Performance Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Course Performance Details</CardTitle>
            <CardDescription>Detailed metrics for each course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Avg CPU</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Peak CPU</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Avg Memory</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Instances</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coursePerformance.map((course) => (
                    <tr key={course.course} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">{course.course}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2 w-16">
                            <div className="bg-primary rounded-full h-2" style={{ width: `${course.avgCPU}%` }} />
                          </div>
                          <span className="text-foreground font-mono">{course.avgCPU}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{course.peakCPU}%</td>
                      <td className="py-3 px-4 text-foreground">{course.avgMemory}%</td>
                      <td className="py-3 px-4 text-foreground">{course.instances}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-0">
                          Healthy
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
            <CardDescription>Analysis and optimization suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Peak Usage Pattern</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                CPU usage peaks on Fridays (73% avg). Consider distributing workloads or scaling resources before end of week.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">Efficient Courses</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                CS101 and CS201 show optimal resource utilization with low peak-to-average ratios.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">Resource Optimization</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Consider consolidating CS501 instances during low-usage periods to reduce operational costs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
