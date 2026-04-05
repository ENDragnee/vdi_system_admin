'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Edit2, Power, CheckCircle2, AlertCircle, Cpu, HardDrive, Activity, ChevronDown, ChevronUp, Server } from 'lucide-react';

interface VMInstance {
  id: string;
  labId: string;
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

const mockLabs = [
  { id: 'lab-001', name: 'Lab A - Development' },
  { id: 'lab-002', name: 'Lab B - Production' },
  { id: 'lab-003', name: 'Lab C - Testing' },
];

const mockInstances: VMInstance[] = [
  // Lab 001 instances
  {
    id: 'vm-001',
    labId: 'lab-001',
    name: 'Dev-Server-01',
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
    labId: 'lab-001',
    name: 'Dev-Server-02',
    os: 'Ubuntu 22.04',
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
    labId: 'lab-001',
    name: 'Dev-Database',
    os: 'Ubuntu 22.04',
    ip: '192.168.1.102',
    status: 'online',
    owner: 'Mike Johnson',
    cpu: 78,
    ram: 88,
    storage: 92,
    createdAt: '2024-01-10',
  },
  // Lab 002 instances
  {
    id: 'vm-004',
    labId: 'lab-002',
    name: 'Prod-Web-01',
    os: 'Ubuntu 22.04',
    ip: '192.168.2.100',
    status: 'online',
    owner: 'Sarah Wilson',
    cpu: 65,
    ram: 85,
    storage: 78,
    createdAt: '2023-11-05',
  },
  {
    id: 'vm-005',
    labId: 'lab-002',
    name: 'Prod-Web-02',
    os: 'Ubuntu 22.04',
    ip: '192.168.2.101',
    status: 'online',
    owner: 'Tom Brown',
    cpu: 72,
    ram: 80,
    storage: 85,
    createdAt: '2023-12-01',
  },
  {
    id: 'vm-006',
    labId: 'lab-002',
    name: 'Prod-Database',
    os: 'Ubuntu 22.04',
    ip: '192.168.2.102',
    status: 'online',
    owner: 'Emma Davis',
    cpu: 52,
    ram: 71,
    storage: 58,
    createdAt: '2024-02-01',
  },
  // Lab 003 instances
  {
    id: 'vm-007',
    labId: 'lab-003',
    name: 'Test-Server-01',
    os: 'CentOS 8',
    ip: '192.168.3.100',
    status: 'online',
    owner: 'Alex Chen',
    cpu: 35,
    ram: 55,
    storage: 70,
    createdAt: '2024-02-10',
  },
  {
    id: 'vm-008',
    labId: 'lab-003',
    name: 'Test-Server-02',
    os: 'Windows Server 2022',
    ip: '192.168.3.101',
    status: 'maintenance',
    owner: 'Lisa Park',
    cpu: 0,
    ram: 0,
    storage: 65,
    createdAt: '2024-01-25',
  },
];

export default function InstanceManagement() {
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllInstances, setShowAllInstances] = useState(true);
  const [isInstanceListExpanded, setIsInstanceListExpanded] = useState(true);
  const [instances, setInstances] = useState<VMInstance[]>(mockInstances);

  const filteredInstances = instances.filter((instance) => {
    const matchesSearch =
      instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.ip.includes(searchTerm);

    const matchesLab = !selectedLab || instance.labId === selectedLab;

    return matchesSearch && matchesLab;
  });

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
        <h1 className="text-4xl font-bold text-foreground mb-2">Instance Management</h1>
        <p className="text-muted-foreground">
          {showAllInstances
            ? 'Manage virtual instances and monitor resource usage across all labs'
            : selectedLab
              ? `Manage instances in ${mockLabs.find(l => l.id === selectedLab)?.name}`
              : 'Select a lab to manage instances'}
        </p>
      </div>

      {/* Lab Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Select Lab</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={showAllInstances ? 'default' : 'outline'}
              onClick={() => {
                setShowAllInstances(true);
                setSelectedLab(null);
                setSearchTerm('');
              }}
              className={showAllInstances ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              View All
            </Button>
            {mockLabs.map((lab) => (
              <Button
                key={lab.id}
                variant={selectedLab === lab.id ? 'default' : 'outline'}
                onClick={() => {
                  setShowAllInstances(false);
                  setSelectedLab(lab.id);
                  setSearchTerm('');
                }}
                className={selectedLab === lab.id ? 'bg-primary text-primary-foreground' : 'border-border'}
              >
                {lab.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by instance name or IP address..."
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

      {/* Instances Grid */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Virtual Instances</CardTitle>
            <CardDescription>Showing {filteredInstances.length} of {(selectedLab ? instances.filter(i => i.labId === selectedLab) : instances).length} instances</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsInstanceListExpanded(!isInstanceListExpanded)}
            className="flex items-center gap-2"
          >
            {isInstanceListExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Expand
              </>
            )}
          </Button>
        </CardHeader>

        {isInstanceListExpanded && (
          <CardContent>
            {filteredInstances.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                <p className="text-muted-foreground">No instances found matching your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredInstances.map((instance) => {
                  const statusColor = getStatusColor(instance.status);
                  return (
                    <Card key={instance.id} className="border border-border hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{instance.name}</CardTitle>
                            <CardDescription className="text-xs">{instance.os}</CardDescription>
                          </div>
                          <Badge className={`${statusColor.bg} ${statusColor.text} border-0 flex-shrink-0`}>
                            <span className={`w-2 h-2 rounded-full ${statusColor.dot} mr-1 inline-block`}></span>
                            {instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">IP Address:</span>
                            <span className="font-mono text-foreground">{instance.ip}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Owner:</span>
                            <span className="text-foreground">{instance.owner}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Cpu className="w-3 h-3" />
                              CPU
                            </div>
                            <span className="text-sm font-medium text-foreground">{instance.cpu}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Activity className="w-3 h-3" />
                              RAM
                            </div>
                            <span className="text-sm font-medium text-foreground">{instance.ram}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <HardDrive className="w-3 h-3" />
                              Storage
                            </div>
                            <span className="text-sm font-medium text-foreground">{instance.storage}%</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1 h-8">
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 hover:text-destructive hover:border-destructive"
                            onClick={() => handleDelete(instance.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
