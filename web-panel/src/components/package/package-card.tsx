// @/components/package/package-card.tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Edit2, Loader2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  pkg: any;
  vmId: string;   // Database CUID
  vmIp: string;   // Dynamic IP from Proxmox Agent (The new required prop)
  onEdit: (p: any) => void;
  isBulk?: boolean;
  onAction?: (action: "install" | "uninstall") => void;
}

export function PackageCard({ pkg, vmId, vmIp, onEdit, isBulk = false, onAction }: PackageCardProps) {
  const queryClient = useQueryClient();

  // Pivot on the provided vmId to show if it's currently installed on the "primary" selection
  const vmStatus = pkg.vmStatuses?.find((s: any) => s.vmId === vmId)?.status || "MISSING";

  // Local Mutation for Single VM Installation (Used when NOT in bulk mode)
  const installMutation = useMutation({
    mutationFn: (action: "install" | "uninstall") =>
      axios.post("/api/vm/package", {
        vmId,
        ip: vmIp, // Pass the dynamic IP to the API
        packageName: pkg.name,
        action
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });

  // Mutation for deleting from the Master Repository (Database only)
  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`/api/packages/${pkg.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packages"] }),
  });

  const isPending = installMutation.isPending || vmStatus === "PENDING";

  const handleMainAction = () => {
    const action = vmStatus === "INSTALLED" ? "uninstall" : "install";

    // If in bulk mode, use the parent's handler
    if (isBulk && onAction) {
      onAction(action);
    } else {
      installMutation.mutate(action);
    }
  };

  return (
    <Card className={cn(
      "border-0 shadow-sm hover:shadow-md transition-all relative overflow-hidden",
      isBulk && "ring-2 ring-primary/20 bg-primary/[0.02]"
    )}>
      {isBulk && (
        <div className="absolute top-0 right-0 p-1 bg-primary text-[8px] font-bold text-primary-foreground uppercase tracking-tighter rounded-bl-lg">
          Bulk Mode
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{pkg.name}</CardTitle>
            <CardDescription className="text-xs">
              v{pkg.version || "stable"}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            {vmStatus === "INSTALLED" && (
              <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-0">
                Installed
              </Badge>
            )}
            {vmStatus === "PENDING" && (
              <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 animate-pulse border-0">
                Syncing...
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground min-h-[40px] line-clamp-2">
          {pkg.description || "No description provided for this package."}
        </p>

        <div className="flex gap-2">
          {vmStatus === "INSTALLED" ? (
            <Button
              variant="outline"
              className={cn(
                "flex-1 text-destructive hover:bg-destructive/10 border-border",
                isBulk && "border-primary/30"
              )}
              onClick={handleMainAction}
              disabled={isPending || (vmIp === "No IP Assigned" && !isBulk)}
            >
              {isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  {isBulk ? <Layers className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  {isBulk ? "Bulk Uninstall" : "Uninstall"}
                </>
              )}
            </Button>
          ) : (
            <Button
              className="flex-1 gap-2"
              onClick={handleMainAction}
              disabled={isPending || (vmIp === "No IP Assigned" && !isBulk)}
            >
              {isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  {isBulk ? <Layers className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  {isBulk ? "Bulk Install" : "Install"}
                </>
              )}
            </Button>
          )}

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 border border-transparent hover:border-border"
              onClick={() => onEdit(pkg)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
              onClick={() => { if (confirm("Remove from repository?")) deleteMutation.mutate() }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
