"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trash2, Play, Square, Cpu, Activity,
  Terminal, Monitor, ExternalLink, Loader2
} from "lucide-react";
import {
  DeleteVmAction,
  StartVmAction,
  StopVmAction,
  GetVmConsoleAction
} from "@/app/actions/vm-actions";
import { VMInstance } from "@/types/instance";
import { cn } from "@/lib/utils";

export function InstanceCard({ instance }: { instance: VMInstance }) {
  const queryClient = useQueryClient();

  const consoleMutation = useMutation({
    mutationFn: (type: 'novnc' | 'xtermjs' | 'spice') =>
      GetVmConsoleAction(instance.proxmoxId, type),

    onSuccess: (res) => {
      if (res.type === 'url' && res.url) {
        window.open(res.url, "_blank", "width=1200,height=800");
        return;
      }

      if (res.type === 'file' && res.data) {
        const d = res.data;

        // 🔥 FIX: Force IP instead of hostname for SPICE proxy
        let proxy = d.proxy;
        try {
          const proxyUrl = new URL(d.proxy);

          // Use env if available, otherwise fallback
          const forcedIp =
            process.env.NEXT_PUBLIC_PROXMOX_IP || proxyUrl.hostname;

          proxyUrl.hostname = forcedIp;
          proxy = proxyUrl.toString();
        } catch (e) {
          console.warn("Failed to parse proxy URL, using original:", d.proxy);
        }

        const vvContent = [
          "[virt-viewer]",
          "type=spice",
          `title=VM ${instance.proxmoxId} - ${instance.name}`,
          "release-cursor=Ctrl+Alt+R",
          "toggle-fullscreen=Shift+F11",
          "secure-attention=Ctrl+Alt+Ins",
          `proxy=${proxy}`, // ✅ fixed here
          `tls-port=${d["tls-port"]}`,
          `password=${d.password}`,
          `host-subject=${d["host-subject"]}`,
          `host=${d.host}`,
        ];

        if (d.ca) {
          vvContent.push(`ca=${d.ca.replace(/\n/g, "\\n")}`);
        }

        vvContent.push("delete-this-file=1");

        const blob = new Blob([vvContent.join("\n")], {
          type: "application/x-virt-viewer",
        });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `console-${instance.proxmoxId}.vv`;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    },

    onError: (err: any) => alert(`Console Error: ${err.message}`),
  });

  const startMutation = useMutation({
    mutationFn: () => StartVmAction(instance.proxmoxId, instance.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instances"] }),
  });

  const stopMutation = useMutation({
    mutationFn: () => StopVmAction(instance.proxmoxId, instance.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instances"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => DeleteVmAction(instance.id, instance.proxmoxId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instances"] }),
  });

  const isOnline = instance.status === "online";
  const statusColor = isOnline
    ? "bg-green-500/10 text-green-600 border-green-200"
    : "bg-red-500/10 text-red-600 border-red-200";

  return (
    <Card className="border border-border hover:shadow-lg transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate font-bold">
              {instance.name}
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-black opacity-50 tracking-widest">
              {instance.labName}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(statusColor, "border-0 capitalize")}
          >
            {instance.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-muted/30 p-2 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">
              IP Address
            </span>
            <span className="font-mono font-bold">{instance.ip}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">
              PVE ID
            </span>
            <span className="font-mono">{instance.proxmoxId}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/50">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
              <Cpu className="w-3 h-3 text-blue-500" /> CPU
            </div>
            <span className="text-sm font-black tabular-nums">
              {instance.cpu}%
            </span>
          </div>
          <div className="space-y-1 border-l pl-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
              <Activity className="w-3 h-3 text-purple-500" /> RAM
            </div>
            <span className="text-sm font-black tabular-nums">
              {instance.ram}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase"
            disabled={!isOnline || consoleMutation.isPending}
            onClick={() => consoleMutation.mutate('xtermjs')}
          >
            <Terminal className="w-3 h-3 mr-1" /> SSH
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase"
            disabled={!isOnline || consoleMutation.isPending}
            onClick={() => consoleMutation.mutate('novnc')}
          >
            <Monitor className="w-3 h-3 mr-1" /> VNC
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase"
            disabled={!isOnline || consoleMutation.isPending}
            onClick={() => consoleMutation.mutate('spice')}
          >
            <ExternalLink className="w-3 h-3 mr-1" /> Spice
          </Button>
        </div>

        <div className="flex gap-2 pt-2">
          {isOnline ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 font-bold text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
            >
              {stopMutation.isPending ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Square className="w-4 h-4 mr-2 fill-current" />
              )}
              Stop
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 font-bold text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
            >
              {startMutation.isPending ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 mr-2 fill-current" />
              )}
              Start
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-10 h-9 p-0 text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
            onClick={() => {
              if (confirm("Permanently destroy this VM?"))
                deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending || isOnline}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
