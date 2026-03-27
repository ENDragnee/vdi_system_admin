
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Edit2, Power, CheckCircle2, AlertCircle, Cpu, HardDrive, Activity } from 'lucide-react';

interface VMInstance {
  id: string;
  name: string;
  os: string;
  ip: string;
  status: 'online' | 'offline' | 'maintenance';
  owner: string;
  cpu: number;
  ram: number;
  storage: number;
  createdAt: string;
}

const mockInstances: VMInstance[] = [
  {
    id: 'vm-001',
    name: 'Development-01',
    os: 'Ubuntu 22.04',
    ip: '192.168.1.100',
    status: 'online',
    owner: 'John Doe',
    cpu: 45,
    ram: 62,
    storage: 75,
    createdAt: '2024-01-15',
  },
  {
    id: 'vm-002',
    name: 'Testing-Web-Server',
    os: 'CentOS 8',
    ip: '192.168.1.101',
    status: 'online',
    owner: 'Jane Smith',
    cpu: 28,
    ram: 48,
    storage: 82,
    createdAt: '2024-01-20',
  },
  {
    id: 'vm-003',
    name: 'Database-Primary',
    os: 'Ubuntu 22.04',
    ip: '192.168.1.102',
    status: 'online',
    owner: 'Mike Johnson',
    cpu: 78,
    ram: 88,
    storage: 92,
    createdAt: '2024-01-10',
  },
  {
    id: 'vm-004',
    name: 'Legacy-App-Server',
    os: 'Windows Server 2022',
    ip: '192.168.1.103',
    status: 'maintenance',
    owner: 'Sarah Wilson',
    cpu: 0,
    ram: 0,
    storage: 65,
    createdAt: '2023-11-05',
  },
  {
    id: 'vm-005',
    name: 'Backup-Storage',
    os: 'Ubuntu 22.04',
    ip: '192.168.1.104',
    status: 'offline',
    owner: 'Tom Brown',
    cpu: 0,
    ram: 0,
    storage: 95,
    createdAt: '2023-12-01',
  },
  {
    id: 'vm-006',
    name: 'Analytics-Engine',
    os: 'Ubuntu 22.04',
    ip: '192.168.1.105',
    status: 'online',
    owner: 'Emma Davis',
    cpu: 52,
    ram: 71,
    storage: 58,
    createdAt: '2024-02-01',
  },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [instances, setInstances] = useState<VMInstance[]>(mockInstances);

  const filteredInstances = instances.filter(
    (instance) =>
      instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.ip.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-500' };
      case 'offline':
        return { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', dot: 'bg-red-500' };
      case 'maintenance':
        return { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-800 dark:text-amber-200', dot: 'bg-amber-500' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200', dot: 'bg-gray-500' };
    }
  };

  const handleDelete = (id: string) => {
    setInstances(instances.filter((inst) => inst.id !== id));
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage virtual instances and user assignments</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by instance name, owner, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          + New Instance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Instances</p>
                <p className="text-2xl font-bold text-foreground">{instances.length}</p>
              </div>
              <Activity className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{instances.filter((i) => i.status === 'online').length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">{instances.filter((i) => i.status === 'offline').length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-amber-600">{instances.filter((i) => i.status === 'maintenance').length}</p>
              </div>
              <Power className="w-8 h-8 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instances Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Virtual Instances</CardTitle>
          <CardDescription>Showing {filteredInstances.length} of {instances.length} instances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Instance</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Owner</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">IP Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">CPU</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">RAM</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Storage</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstances.map((instance) => {
                  const statusColor = getStatusColor(instance.status);
                  return (
                    <tr key={instance.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{instance.name}</p>
                          <p className="text-xs text-muted-foreground">{instance.os}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{instance.owner}</td>
                      <td className="py-3 px-4 text-sm font-mono text-foreground">{instance.ip}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${statusColor.bg} ${statusColor.text} border-0`}>
                          <span className={`w-2 h-2 rounded-full ${statusColor.dot} mr-2 inline-block`}></span>
                          {instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{instance.cpu}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{instance.ram}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{instance.storage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(instance.id)}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredInstances.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
              <p className="text-muted-foreground">No instances found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
