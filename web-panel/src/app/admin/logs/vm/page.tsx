
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter, Server, Play, Square, Zap } from 'lucide-react';

interface VMLogEntry {
  id: string;
  vmName: string;
  timestamp: string;
  event: string;
  severity: 'critical' | 'warning' | 'info' | 'debug';
  message: string;
  source: string;
}

const mockVMLogs: VMLogEntry[] = [
  {
    id: 'vmlog-001',
    vmName: 'Database-Primary',
    timestamp: '2024-03-17 15:45:32',
    event: 'HIGH_CPU_USAGE',
    severity: 'critical',
    message: 'CPU usage reached 92% - potential performance degradation',
    source: 'System Monitor',
  },
  {
    id: 'vmlog-002',
    vmName: 'Development-01',
    timestamp: '2024-03-17 15:38:15',
    event: 'SERVICE_STARTED',
    severity: 'info',
    message: 'Apache web server started successfully on port 80',
    source: 'Service Manager',
  },
  {
    id: 'vmlog-003',
    vmName: 'Analytics-Engine',
    timestamp: '2024-03-17 15:32:48',
    event: 'MEMORY_WARNING',
    severity: 'warning',
    message: 'Available memory below 512MB threshold',
    source: 'Memory Monitor',
  },
  {
    id: 'vmlog-004',
    vmName: 'Testing-Web-Server',
    timestamp: '2024-03-17 15:25:20',
    event: 'DISK_ERROR',
    severity: 'critical',
    message: 'I/O error detected on disk /dev/sdb - check disk health',
    source: 'Disk Manager',
  },
  {
    id: 'vmlog-005',
    vmName: 'Database-Primary',
    timestamp: '2024-03-17 15:18:10',
    event: 'BACKUP_COMPLETED',
    severity: 'info',
    message: 'Database backup completed successfully - 45GB transferred',
    source: 'Backup Service',
  },
  {
    id: 'vmlog-006',
    vmName: 'Development-01',
    timestamp: '2024-03-17 15:10:55',
    event: 'NETWORK_LATENCY',
    severity: 'warning',
    message: 'Network latency increased to 150ms on eth0',
    source: 'Network Monitor',
  },
  {
    id: 'vmlog-007',
    vmName: 'Legacy-App-Server',
    timestamp: '2024-03-17 15:05:33',
    event: 'SERVICE_STOPPED',
    severity: 'warning',
    message: 'Oracle Database service stopped unexpectedly',
    source: 'Service Manager',
  },
  {
    id: 'vmlog-008',
    vmName: 'Analytics-Engine',
    timestamp: '2024-03-17 14:58:12',
    event: 'PROCESS_RESTARTED',
    severity: 'info',
    message: 'Analytics daemon restarted after crash - PID 4521',
    source: 'Process Monitor',
  },
  {
    id: 'vmlog-009',
    vmName: 'Backup-Storage',
    timestamp: '2024-03-17 14:52:45',
    event: 'STORAGE_FULL',
    severity: 'critical',
    message: 'Backup storage reached 98% capacity - urgent cleanup needed',
    source: 'Storage Monitor',
  },
  {
    id: 'vmlog-010',
    vmName: 'Testing-Web-Server',
    timestamp: '2024-03-17 14:45:20',
    event: 'CONFIG_UPDATED',
    severity: 'info',
    message: 'Nginx configuration reloaded successfully',
    source: 'Configuration Manager',
  },
];

export default function VMLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVM, setSelectedVM] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [logs, setLogs] = useState<VMLogEntry[]>(mockVMLogs);

  const vmList = Array.from(new Set(logs.map((log) => log.vmName)));

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.vmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVM = !selectedVM || log.vmName === selectedVM;
    const matchesSeverity = !selectedSeverity || log.severity === selectedSeverity;

    return matchesSearch && matchesVM && matchesSeverity;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Zap className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Square className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Play className="w-5 h-5 text-blue-500" />;
      default:
        return <Play className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      critical: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
      warning: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-800 dark:text-amber-200' },
      info: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
      debug: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200' },
    };
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.debug;
    return (
      <Badge className={`${config.bg} ${config.text} border-0 capitalize`}>
        {severity}
      </Badge>
    );
  };

  const logStats = {
    total: logs.length,
    critical: logs.filter((l) => l.severity === 'critical').length,
    warnings: logs.filter((l) => l.severity === 'warning').length,
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">VM Logs</h1>
        <p className="text-muted-foreground">Monitor virtual machine events and performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-foreground">{logStats.total}</p>
              </div>
              <Server className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{logStats.critical}</p>
              </div>
              <Zap className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-amber-600">{logStats.warnings}</p>
              </div>
              <Square className="w-8 h-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search logs by VM name, event, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2 border-border">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* VM Filter */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3">Filter by VM</p>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!selectedVM ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedVM(null)}
            className={!selectedVM ? 'bg-primary text-primary-foreground' : 'border-border'}
          >
            All VMs
          </Button>
          {vmList.map((vm) => (
            <Button
              key={vm}
              variant={selectedVM === vm ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedVM(vm)}
              className={selectedVM === vm ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              {vm}
            </Button>
          ))}
        </div>
      </div>

      {/* Severity Filter */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3">Filter by Severity</p>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!selectedSeverity ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeverity(null)}
            className={!selectedSeverity ? 'bg-primary text-primary-foreground' : 'border-border'}
          >
            All Severities
          </Button>
          {['critical', 'warning', 'info', 'debug'].map((severity) => (
            <Button
              key={severity}
              variant={selectedSeverity === severity ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeverity(severity)}
              className={selectedSeverity === severity ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
          <CardDescription>Showing {filteredLogs.length} of {logs.length} events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">{getSeverityIcon(log.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-0">{log.vmName}</Badge>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <span className="font-mono text-sm text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="font-semibold text-foreground mb-2">{log.event}</p>
                    <p className="text-sm text-foreground mb-1">{log.message}</p>
                    <p className="text-xs text-muted-foreground">Source: {log.source}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
              <p className="text-muted-foreground">No logs found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
