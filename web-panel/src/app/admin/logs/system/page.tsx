'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter, AlertCircle, CheckCircle2, Info, AlertTriangle, Server, ChevronRight } from 'lucide-react';

interface LogEntry {
  id: string;
  labId: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  user: string;
  action: string;
  resource: string;
  details: string;
}

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

const mockLogs: LogEntry[] = [
  {
    id: 'log-001',
    labId: 'lab-002',
    timestamp: '2024-03-17 14:32:45',
    level: 'success',
    user: 'admin',
    action: 'USER_LOGIN',
    resource: 'Authentication',
    details: 'Admin user logged in from 192.168.1.50',
  },
  {
    id: 'log-002',
    labId: 'lab-001',
    timestamp: '2024-03-17 14:28:12',
    level: 'info',
    user: 'john.doe',
    action: 'INSTANCE_CREATED',
    resource: 'VM: Dev-Server-02',
    details: 'New VM instance created with 8GB RAM and 100GB storage',
  },
  {
    id: 'log-003',
    labId: 'lab-002',
    timestamp: '2024-03-17 14:15:33',
    level: 'warning',
    user: 'system',
    action: 'HIGH_CPU_USAGE',
    resource: 'VM: Prod-Database',
    details: 'CPU usage exceeded 85% threshold on database server',
  },
  {
    id: 'log-004',
    labId: 'lab-003',
    timestamp: '2024-03-17 14:05:22',
    level: 'error',
    user: 'jane.smith',
    action: 'BACKUP_FAILED',
    resource: 'Backup: Daily-Backup-001',
    details: 'Daily backup failed: insufficient disk space on backup server',
  },
  {
    id: 'log-005',
    labId: 'lab-001',
    timestamp: '2024-03-17 13:55:10',
    level: 'success',
    user: 'admin',
    action: 'SECURITY_PATCH_INSTALLED',
    resource: 'System',
    details: 'Security patches successfully installed on all instances',
  },
  {
    id: 'log-006',
    labId: 'lab-002',
    timestamp: '2024-03-17 13:42:05',
    level: 'info',
    user: 'mike.johnson',
    action: 'CONFIGURATION_UPDATED',
    resource: 'Network Settings',
    details: 'Network configuration updated for vlan-10',
  },
  {
    id: 'log-007',
    labId: 'lab-003',
    timestamp: '2024-03-17 13:30:15',
    level: 'warning',
    user: 'system',
    action: 'DISK_SPACE_LOW',
    resource: 'Storage: /var',
    details: 'Disk space usage at 92% on /var partition',
  },
  {
    id: 'log-008',
    labId: 'lab-001',
    timestamp: '2024-03-17 13:15:42',
    level: 'success',
    user: 'admin',
    action: 'SYSTEM_RESTART',
    resource: 'System',
    details: 'System restart completed successfully in 45 seconds',
  },
  {
    id: 'log-009',
    labId: 'lab-002',
    timestamp: '2024-03-17 12:55:30',
    level: 'info',
    user: 'sarah.wilson',
    action: 'USER_ADDED',
    resource: 'User Management',
    details: 'New user emma.davis added to administrators group',
  },
  {
    id: 'log-010',
    labId: 'lab-003',
    timestamp: '2024-03-17 12:40:18',
    level: 'error',
    user: 'system',
    action: 'SERVICE_DOWN',
    resource: 'Service: Test-Server-01',
    details: 'Service became unresponsive, attempting restart',
  },
];

export default function SystemLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLab = !selectedLab || log.labId === selectedLab;
    const matchesLevel = !selectedLevel || log.level === selectedLevel;

    return matchesSearch && matchesLab && matchesLevel;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      success: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
      error: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
      warning: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-800 dark:text-amber-200' },
      info: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
    };
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.info;
    return (
      <Badge className={`${config.bg} ${config.text} border-0 capitalize`}>
        {level}
      </Badge>
    );
  };

  const logStats = {
    total: logs.length,
    errors: logs.filter((l) => l.level === 'error').length,
    warnings: logs.filter((l) => l.level === 'warning').length,
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">System Logs</h1>
        <p className="text-muted-foreground">
          {showAllLogs
            ? 'Monitor system activity and user actions across all labs'
            : selectedLab
              ? `System logs for ${mockLabs.find(l => l.id === selectedLab)?.name}`
              : 'Select a lab to view system logs'}
        </p>
      </div>

      {/* Lab Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Select Lab</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={showAllLogs ? 'default' : 'outline'}
              onClick={() => {
                setShowAllLogs(true);
                setSelectedLab(null);
              }}
              className={showAllLogs ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              View All
            </Button>
            {mockLabs.map((lab) => (
              <Button
                key={lab.id}
                variant={selectedLab === lab.id ? 'default' : 'outline'}
                onClick={() => {
                  setShowAllLogs(false);
                  setSelectedLab(lab.id);
                }}
                className={selectedLab === lab.id ? 'bg-primary text-primary-foreground' : 'border-border'}
              >
                {lab.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold text-foreground">{logStats.total}</p>
              </div>
              <Info className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{logStats.errors}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
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
              <AlertTriangle className="w-8 h-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search logs by user, action, resource, or details..."
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

      {/* Level Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={!selectedLevel ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedLevel(null)}
          className={!selectedLevel ? 'bg-primary text-primary-foreground' : 'border-border'}
        >
          All Logs
        </Button>
        {['success', 'info', 'warning', 'error'].map((level) => (
          <Button
            key={level}
            variant={selectedLevel === level ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedLevel(level)}
            className={selectedLevel === level ? 'bg-primary text-primary-foreground' : 'border-border'}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Button>
        ))}
      </div>

      {/* Logs Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>Showing {filteredLogs.length} of {logs.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">{getLevelIcon(log.level)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">{log.timestamp}</span>
                        {getLevelBadge(log.level)}
                      </div>
                    </div>
                    <p className="font-semibold text-foreground mb-1">{log.action}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">User: </span>
                        <span className="text-foreground font-mono">{log.user}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Resource: </span>
                        <span className="text-foreground">{log.resource}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{log.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
              <p className="text-muted-foreground">No logs found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
