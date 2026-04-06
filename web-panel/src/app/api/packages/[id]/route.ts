// app/api/packages/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";
import { RequestParams } from "@/types/request-param";

export async function PUT(req: Request, { params }: RequestParams) {
  if (!(await checkPermission("packages.update"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id } = await params;

    const pkg = await prisma.package.update({
      where: { id: id },
      data: {
        name: body.name,
        description: body.description,
        version: body.version,
      },
    });
    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RequestParams) {
  if (!(await checkPermission("packages.delete"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.package.delete({ where: { id: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
