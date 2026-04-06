"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Mail, Landmark } from "lucide-react";
import { format } from "date-fns";

export function FacultyTable({ data, onEdit, onDelete }: any) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Faculty Member</TableHead>
            <TableHead>Assigned Lab</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((member: any) => (
            <TableRow key={member.id} className="group">
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
                  <Badge variant="outline" className="gap-1.5 py-1">
                    <Landmark className="w-3 h-3" /> {member.lab.name}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Unassigned</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {format(new Date(member.createdAt), "PPP")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(member)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(member.id)}>
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
