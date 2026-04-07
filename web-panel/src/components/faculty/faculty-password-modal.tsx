"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

export function FacultyPasswordModal({ isOpen, onClose, member }: PasswordModalProps) {
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: (newPassword: string) => axios.put(`/api/faculty/${member?.id}/password`, { newPassword }),
    onSuccess: () => {
      toast.success("Password Updated", { description: `Security credentials for ${member?.name || member?.email} updated.` });
      setPassword("");
      onClose();
    },
    onError: (err: any) => {
      toast.error("Failed", { description: err.response?.data?.error || "Server error" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <KeyRound size={24} />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight">Security Override</DialogTitle>
          <DialogDescription className="text-xs uppercase font-bold tracking-widest opacity-60">
            Target: {member?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pass" className="text-[10px] font-black uppercase">New Secure Password</Label>
            <Input
              id="new-pass"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters..."
              className="bg-muted/50 border-0 h-11"
            />
          </div>
        </div>

        <DialogFooter className="bg-muted/30 p-4 -mx-6 -mb-6 mt-2">
          <Button variant="ghost" onClick={onClose} className="font-bold text-xs uppercase">Cancel</Button>
          <Button
            onClick={() => mutation.mutate(password)}
            disabled={mutation.isPending || password.length < 8}
            className="rounded-xl px-6 font-bold uppercase text-xs gap-2"
          >
            {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            Confirm Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
