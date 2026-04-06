import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { InstanceCard } from './instance-card';
import { VMInstance } from '@/types/instance';

interface InstanceGridProps {
  instances: VMInstance[];
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  totalCount: number;
}

export function InstanceGrid({ instances, isExpanded, setIsExpanded, totalCount }: InstanceGridProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Virtual Instances</CardTitle>
          <CardDescription>Showing {instances.length} of {totalCount} instances</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2">
          {isExpanded ? <><ChevronUp className="w-4 h-4" /> Collapse</> : <><ChevronDown className="w-4 h-4" /> Expand</>}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {instances.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
              <p className="text-muted-foreground">No instances found matching your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {instances.map((instance) => (
                <InstanceCard key={instance.id} instance={instance} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
