import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Lab } from '@/types/instance';

interface InstanceFiltersProps {
  labs: Lab[];
  selectedLab: string | null;
  setSelectedLab: (id: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function InstanceFilters({ labs, selectedLab, setSelectedLab, searchTerm, setSearchTerm }: InstanceFiltersProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Select Lab</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedLab === null ? 'default' : 'outline'}
            onClick={() => setSelectedLab(null)}
            className={selectedLab === null ? 'bg-primary text-primary-foreground' : 'border-border'}
          >
            View All
          </Button>
          {labs.map((lab) => (
            <Button
              key={lab.id}
              variant={selectedLab === lab.id ? 'default' : 'outline'}
              onClick={() => setSelectedLab(lab.id)}
              className={selectedLab === lab.id ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              {lab.name}
            </Button>
          ))}
        </div>
      </div>

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
      </div>
    </div>
  );
}
