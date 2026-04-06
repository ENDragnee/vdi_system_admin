// components/instance/create-vm-modal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateVmAction } from "@/app/actions/vm-actions";
import { Lab } from "@/types/instance";
import { Plus } from "lucide-react";

export function CreateVmModal({ labs }: { labs: Lab[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [proxmoxId, setProxmoxId] = useState("");
  const [name, setName] = useState("");
  const [hostname, setHostname] = useState("");
  const [labId, setLabId] = useState("");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    // Pass the parsed integer to the Server Action
    mutationFn: () => CreateVmAction(parseInt(proxmoxId, 10), name, hostname, labId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances"] });
      setIsOpen(false);
      // Reset state
      setProxmoxId("");
      setName("");
      setHostname("");
      setLabId("");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> New Instance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Provision New Instance</DialogTitle>
          <DialogDescription>Create a fast Linked Clone from Template 100.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="proxmoxId" className="text-right">VM ID</Label>
            <Input
              id="proxmoxId"
              type="number"
              value={proxmoxId}
              onChange={(e) => setProxmoxId(e.target.value)}
              placeholder="e.g., 105"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Worker 1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hostname" className="text-right">Hostname</Label>
            <Input
              id="hostname"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              placeholder="e.g., vdi-worker-01"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lab" className="text-right">Lab</Label>
            <Select value={labId} onValueChange={setLabId}>
              <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Lab" /></SelectTrigger>
              <SelectContent>
                {labs.map((lab) => (
                  <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {mutation.isError && <p className="text-red-500 text-sm">{mutation.error.message}</p>}
        <DialogFooter>
          <Button
            disabled={mutation.isPending || !proxmoxId || !name || !hostname || !labId}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Provisioning..." : "Create VM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
