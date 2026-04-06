// app/api/labs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await checkPermission("lab.view")))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  try {
    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [labs, total] = await prisma.$transaction([
      prisma.lab.findMany({
        where,
        include: {
          _count: { select: { users: true, vms: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lab.count({ where }),
    ]);

    return NextResponse.json({
      data: labs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch labs" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!(await checkPermission("lab.create")))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const lab = await prisma.lab.create({
      data: { name: body.name, description: body.description },
    });

    await prisma.log.create({
      data: {
        type: "LAB_CREATED",
        severity: "INFO",
        message: `Lab ${lab.name} created.`,
        targetId: lab.id,
      },
    });

    return NextResponse.json(lab);
  } catch (error) {
    return NextResponse.json(
      { error: "Lab name must be unique" },
      { status: 400 },
    );
  }
}
