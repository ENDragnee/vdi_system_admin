
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Info, Download as DownloadIcon, Eye, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  size: string;
  author: string;
  downloads: number;
  rating: number;
  installed: boolean;
  compatible: boolean;
  releaseDate: string;
}

const mockPackages: Package[] = [
  {
    id: 'pkg-001',
    name: 'OpenSSH',
    version: '8.9p1',
    category: 'Security',
    description: 'Secure Shell Protocol implementation for remote access and command execution',
    size: '2.5 MB',
    author: 'OpenSSH Team',
    downloads: 15420,
    rating: 4.9,
    installed: true,
    compatible: true,
    releaseDate: '2024-01-15',
  },
  {
    id: 'pkg-002',
    name: 'Docker',
    version: '24.0.6',
    category: 'Containerization',
    description: 'Containerization platform for deploying and managing applications',
    size: '125 MB',
    author: 'Docker Inc',
    downloads: 28540,
    rating: 4.8,
    installed: true,
    compatible: true,
    releaseDate: '2024-02-10',
  },
  {
    id: 'pkg-003',
    name: 'Nginx',
    version: '1.25.3',
    category: 'Web Server',
    description: 'High-performance web server and reverse proxy with load balancing capabilities',
    size: '1.2 MB',
    author: 'Nginx Inc',
    downloads: 31200,
    rating: 4.7,
    installed: false,
    compatible: true,
    releaseDate: '2024-01-20',
  },
  {
    id: 'pkg-004',
    name: 'PostgreSQL',
    version: '15.4',
    category: 'Database',
    description: 'Advanced relational database management system with ACID compliance',
    size: '45 MB',
    author: 'PostgreSQL Team',
    downloads: 22100,
    rating: 4.9,
    installed: true,
    compatible: true,
    releaseDate: '2024-01-10',
  },
  {
    id: 'pkg-005',
    name: 'MongoDB',
    version: '7.0.2',
    category: 'Database',
    description: 'NoSQL document database with flexible schema and horizontal scaling',
    size: '85 MB',
    author: 'MongoDB Inc',
    downloads: 19850,
    rating: 4.6,
    installed: false,
    compatible: true,
    releaseDate: '2024-02-05',
  },
  {
    id: 'pkg-006',
    name: 'Git',
    version: '2.42.0',
    category: 'Version Control',
    description: 'Distributed version control system for tracking code changes',
    size: '15 MB',
    author: 'Git Project',
    downloads: 42300,
    rating: 4.95,
    installed: true,
    compatible: true,
    releaseDate: '2024-01-25',
  },
  {
    id: 'pkg-007',
    name: 'Python',
    version: '3.11.6',
    category: 'Development',
    description: 'High-level programming language with extensive libraries and frameworks',
    size: '35 MB',
    author: 'Python Software Foundation',
    downloads: 50120,
    rating: 4.92,
    installed: true,
    compatible: true,
    releaseDate: '2024-02-15',
  },
  {
    id: 'pkg-008',
    name: 'Node.js',
    version: '20.10.0',
    category: 'Development',
    description: 'JavaScript runtime for building scalable network applications',
    size: '52 MB',
    author: 'OpenJS Foundation',
    downloads: 38750,
    rating: 4.85,
    installed: false,
    compatible: true,
    releaseDate: '2024-02-20',
  },
  {
    id: 'pkg-009',
    name: 'Apache Kafka',
    version: '3.6.1',
    category: 'Messaging',
    description: 'Distributed event streaming platform for real-time data pipelines',
    size: '180 MB',
    author: 'Apache Software Foundation',
    downloads: 12450,
    rating: 4.7,
    installed: true,
    compatible: true,
    releaseDate: '2024-01-30',
  },
  {
    id: 'pkg-010',
    name: 'Redis',
    version: '7.2.1',
    category: 'Cache',
    description: 'In-memory data structure store for caching and real-time applications',
    size: '8.5 MB',
    author: 'Redis Labs',
    downloads: 26800,
    rating: 4.88,
    installed: false,
    compatible: true,
    releaseDate: '2024-02-08',
  },
];

export default function PackageManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>(mockPackages);

  const categories = Array.from(new Set(packages.map((pkg) => pkg.category))).sort();

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || pkg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (id: string) => {
    setPackages(packages.map((pkg) => (pkg.id === id ? { ...pkg, installed: true } : pkg)));
  };

  const handleUninstall = (id: string) => {
    setPackages(packages.map((pkg) => (pkg.id === id ? { ...pkg, installed: false } : pkg)));
  };

  const stats = {
    total: packages.length,
    installed: packages.filter((p) => p.installed).length,
    available: packages.filter((p) => !p.installed).length,
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Package Management</h1>
        <p className="text-muted-foreground">Install and manage software packages across your infrastructure</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Packages</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Download className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Installed</p>
                <p className="text-2xl font-bold text-green-600">{stats.installed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search packages by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground mb-3">Filter by Category</p>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={!selectedCategory ? 'bg-primary text-primary-foreground' : 'border-border'}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    v{pkg.version} • {pkg.size}
                  </CardDescription>
                </div>
                {pkg.installed && (
                  <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-0">
                    Installed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{pkg.description}</p>

              <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Author</p>
                  <p className="text-sm font-medium text-foreground">{pkg.author}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-foreground">{pkg.rating}</span>
                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <Badge variant="secondary" className="border-0">{pkg.category}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Downloads</p>
                  <p className="text-sm font-medium text-foreground">{(pkg.downloads / 1000).toFixed(1)}K</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {!pkg.installed ? (
                  <Button
                    onClick={() => handleInstall(pkg.id)}
                    className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Install
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUninstall(pkg.id)}
                    variant="outline"
                    className="flex-1 gap-2 border-border text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Uninstall
                  </Button>
                )}
                <Button variant="outline" size="icon" className="border-border">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-border">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
            <p className="text-muted-foreground">No packages found matching your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
