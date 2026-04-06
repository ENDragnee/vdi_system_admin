// app/api/packages/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await checkPermission("packages.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  // Parse Parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";

  const skip = (page - 1) * limit;

  try {
    // 1. Build dynamic where clause
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // 2. Fetch data and count in parallel
    const [packages, total] = await prisma.$transaction([
      prisma.package.findMany({
        where,
        include: { vmStatuses: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.package.count({ where }),
    ]);

    return NextResponse.json({
      data: packages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!(await checkPermission("packages.create"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const pkg = await prisma.package.create({
      data: {
        name: body.name,
        description: body.description,
        version: body.version,
      },
    });
    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json(
      { error: "Duplicate package name or invalid data" },
      { status: 400 },
    );
  }
}
