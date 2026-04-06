"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPackage?: any;
}

export function PackageUpsertModal({ isOpen, onClose, editingPackage }: PackageModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "", version: "", description: "" });

  useEffect(() => {
    if (editingPackage) setFormData(editingPackage);
    else setFormData({ name: "", version: "", description: "" });
  }, [editingPackage, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingPackage) return axios.put(`/api/packages/${editingPackage.id}`, data);
      return axios.post("/api/packages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editingPackage ? "Edit Package" : "Add to Repository"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Package Name (Must match Nixpkgs)</Label>
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. firefox" />
          </div>
          <div className="space-y-2">
            <Label>Version Display</Label>
            <Input value={formData.version} onChange={e => setFormData({ ...formData, version: e.target.value })} placeholder="e.g. 124.0" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Web Browser" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending}>Save Package</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
