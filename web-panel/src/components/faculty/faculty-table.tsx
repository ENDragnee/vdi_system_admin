"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Mail, Landmark, KeyRound } from "lucide-react";
import { format } from "date-fns";

export function FacultyTable({ data, onEdit, onDelete, onPasswordReset }: any) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="text-[10px] font-black uppercase">Faculty Member</TableHead>
            <TableHead className="text-[10px] font-black uppercase">Assigned Lab</TableHead>
            <TableHead className="text-[10px] font-black uppercase">Joined Date</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((member: any) => (
            <TableRow key={member.id} className="group hover:bg-muted/20 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{member.name || "Unnamed"}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" /> {member.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {member.lab ? (
                  <Badge variant="outline" className="gap-1.5 py-1 font-bold text-[10px] uppercase border-primary/20 bg-primary/5">
                    <Landmark className="w-3 h-3" /> {member.lab.name}
                  </Badge>
                ) : (
                  <span className="text-[10px] uppercase font-bold opacity-30 italic">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-medium">
                {format(new Date(member.createdAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {/* Password Reset Trigger */}
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10" onClick={() => onPasswordReset(member)}>
                    <KeyRound className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => onEdit(member)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(member.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
