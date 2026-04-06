"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FacultyUpsertModal({ isOpen, onClose, editingMember }: any) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", labId: "" });

  const { data: labs } = useQuery({ queryKey: ["labs-list"], queryFn: async () => (await axios.get("/api/labs")).data });

  useEffect(() => {
    if (editingMember) setFormData({ ...editingMember, labId: editingMember.labId || "none" });
    else setFormData({ name: "", email: "", password: "", labId: "none" });
  }, [editingMember, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = { ...data, labId: data.labId === "none" ? null : data.labId };
      return editingMember ? axios.put(`/api/faculty/${editingMember.id}`, payload) : axios.post("/api/faculty", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editingMember ? "Edit Faculty" : "Add Faculty Member"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Email Address</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
          {!editingMember && (
            <div className="space-y-1">
              <Label>Initial Password</Label>
              <Input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
          )}
          <div className="space-y-1">
            <Label>Assign to Lab</Label>
            <Select value={formData.labId} onValueChange={v => setFormData({ ...formData, labId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Lab Assigned</SelectItem>
                {labs?.data?.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending}>Save Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
