'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpen, Cpu, Activity, TrendingUp, Eye, Download } from 'lucide-react';

const courseMetrics = [
  { course: 'CS101', activeStudents: 24, vmInstances: 8, avgCpuUsage: 45 },
  { course: 'CS201', activeStudents: 18, vmInstances: 6, avgCpuUsage: 38 },
  { course: 'CS301', activeStudents: 15, vmInstances: 5, avgCpuUsage: 52 },
  { course: 'CS401', activeStudents: 12, vmInstances: 4, avgCpuUsage: 61 },
  { course: 'CS501', activeStudents: 8, vmInstances: 3, avgCpuUsage: 68 },
];

const resourceUsageData = [
  { day: 'Mon', cpu: 35, memory: 45, storage: 62 },
  { day: 'Tue', cpu: 42, memory: 52, storage: 65 },
  { day: 'Wed', cpu: 38, memory: 48, storage: 63 },
  { day: 'Thu', cpu: 58, memory: 65, storage: 70 },
  { day: 'Fri', cpu: 72, memory: 78, storage: 75 },
  { day: 'Sat', cpu: 45, memory: 55, storage: 68 },
  { day: 'Sun', cpu: 28, memory: 38, storage: 64 },
];

const studentActivity = [
  { name: 'John Smith', course: 'CS101', status: 'Active', instances: 2, cpuUsage: 35 },
  { name: 'Sarah Johnson', course: 'CS201', status: 'Active', instances: 1, cpuUsage: 28 },
  { name: 'Mike Williams', course: 'CS301', status: 'Idle', instances: 0, cpuUsage: 0 },
  { name: 'Emily Davis', course: 'CS101', status: 'Active', instances: 3, cpuUsage: 52 },
  { name: 'David Brown', course: 'CS401', status: 'Active', instances: 2, cpuUsage: 42 },
];

export default function FacultyPanel() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Faculty Dashboard</h1>
            <p className="text-muted-foreground">Monitor your course resources and student activities</p>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="border-border">
              Go to Admin Panel
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold text-foreground">77</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                  <p className="text-2xl font-bold text-foreground">5</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">VM Instances</p>
                  <p className="text-2xl font-bold text-foreground">26</p>
                </div>
                <Cpu className="w-8 h-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg CPU Usage</p>
                  <p className="text-2xl font-bold text-foreground">53%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Metrics and Resource Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Resource Usage by Day</CardTitle>
              <CardDescription>Weekly system resource consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resourceUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: `1px solid var(--color-border)` }} />
                  <Legend />
                  <Bar dataKey="cpu" fill="var(--color-primary)" radius={[8, 8, 0, 0]} name="CPU %" />
                  <Bar dataKey="memory" fill="var(--color-accent)" radius={[8, 8, 0, 0]} name="Memory %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Common actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/faculty/metrics">
                <Button variant="outline" className="w-full justify-start gap-2 border-border">
                  <Eye className="w-4 h-4" />
                  View Detailed Metrics
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start gap-2 border-border">
                <Download className="w-4 h-4" />
                Export Reports
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 border-border">
                <BookOpen className="w-4 h-4" />
                Course Settings
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 border-border">
                <Cpu className="w-4 h-4" />
                Manage Resources
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Courses Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Courses Overview</CardTitle>
            <CardDescription>Active courses and their resource allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Active Students</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">VM Instances</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Avg CPU Usage</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courseMetrics.map((course) => (
                    <tr key={course.course} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground">{course.course}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{course.activeStudents}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{course.vmInstances}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${course.avgCpuUsage}%` }}
                            />
                          </div>
                          <span className="text-sm text-foreground w-10">{course.avgCpuUsage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Student Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Student Activity</CardTitle>
            <CardDescription>Current student sessions and resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentActivity.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
                          {student.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.course}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{student.instances} instances</p>
                      <Badge
                        variant="secondary"
                        className={
                          student.status === 'Active'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-0'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-0'
                        }
                      >
                        {student.status}
                      </Badge>
                    </div>
                    <div className="w-20">
                      <div className="flex items-center gap-1">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{student.cpuUsage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
