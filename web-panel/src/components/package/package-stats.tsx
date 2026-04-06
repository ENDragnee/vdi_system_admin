"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Download, CheckCircle2, AlertCircle } from "lucide-react";

export function PackageStats({ packages, vmId }: { packages: any[], vmId: string }) {
  const total = packages?.length || 0;
  const installed = packages?.filter(p =>
    p.vmStatuses?.some((s: any) => s.vmId === vmId && s.status === "INSTALLED")
  ).length;
  const pending = packages?.filter(p =>
    p.vmStatuses?.some((s: any) => s.vmId === vmId && s.status === "PENDING")
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total in Repository</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <Download className="w-8 h-8 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Installed on VM</p>
              <p className="text-2xl font-bold text-green-600">{installed}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Syncing / Pending</p>
              <p className="text-2xl font-bold text-amber-600">{pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
