// app/api/logs/system/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await checkPermission("logs.export"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const where: any = {};

  // Replicate same filters as main API
  const labId = searchParams.get("labId");
  const severity = searchParams.get("severity");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (labId && labId !== "all") where.labId = labId;
  if (severity && severity !== "all") where.severity = severity;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const logs = await prisma.log.findMany({
    where,
    include: {
      user: { select: { name: true } },
      lab: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Manual CSV Generation
  const header = "Timestamp,Severity,Type,Message,Target,Lab,User\n";
  const rows = logs
    .map(
      (l) =>
        `${l.createdAt.toISOString()},${l.severity},${l.type},"${l.message.replace(/"/g, '""')}",${l.targetName || ""},${l.lab?.name || ""},${l.user?.name || "System"}`,
    )
    .join("\n");

  const csv = header + rows;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=system-logs-${new Date().toISOString()}.csv`,
    },
  });
}
