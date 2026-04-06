// app/api/logs/system/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await checkPermission("logs.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const labId = searchParams.get("labId") || "";
  const type = searchParams.get("type") || "";
  const severity = searchParams.get("severity") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (labId && labId !== "all") where.labId = labId;
    if (type && type !== "all") where.type = type;
    if (severity && severity !== "all") where.severity = severity;

    // --- DATE RANGE FILTER ---
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { message: { contains: search, mode: "insensitive" } },
        { targetName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total, labs] = await prisma.$transaction([
      prisma.log.findMany({
        where,
        include: {
          user: { select: { name: true } },
          lab: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.log.count({ where }),
      prisma.lab.findMany({ select: { id: true, name: true } }),
    ]);

    return NextResponse.json({
      data: logs,
      labs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
