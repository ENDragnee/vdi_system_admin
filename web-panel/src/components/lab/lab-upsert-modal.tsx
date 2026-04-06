"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LabUpsertModal({ isOpen, onClose, editingLab }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (editingLab) setFormData({ name: editingLab.name, description: editingLab.description || "" });
    else setFormData({ name: "", description: "" });
  }, [editingLab, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => editingLab ? axios.put(`/api/labs/${editingLab.id}`, data) : axios.post("/api/labs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labs"] });
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editingLab ? "Edit Lab" : "Create New Lab"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Lab Name</Label>
            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Computer Science Lab A" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the purpose of this lab..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending}>
            {editingLab ? "Update Lab" : "Create Lab"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
