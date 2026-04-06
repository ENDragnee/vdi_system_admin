import { Card, CardContent } from '@/components/ui/card';
import { Activity, CheckCircle2, AlertCircle, Power } from 'lucide-react';
import { VMInstance } from '@/types/instance';

export function InstanceStats({ instances }: { instances: VMInstance[] }) {
  const online = instances.filter(i => i.status === 'online').length;
  const offline = instances.filter(i => i.status === 'offline').length;
  const maintenance = instances.filter(i => i.status === 'maintenance').length;

  return (
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
              <p className="text-2xl font-bold text-green-600">{online}</p>
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
              <p className="text-2xl font-bold text-red-600">{offline}</p>
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
              <p className="text-2xl font-bold text-amber-600">{maintenance}</p>
            </div>
            <Power className="w-8 h-8 text-amber-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
