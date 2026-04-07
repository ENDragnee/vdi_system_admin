// app/api/labs/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/auth";
import { RequestParams } from "@/types/request-param";
import { createNotification } from "@/lib/notification-service";

export async function PUT(req: Request, { params }: RequestParams) {
  if (!(await checkPermission("lab.update")))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();
    const lab = await prisma.lab.update({
      where: { id },
      data: { name: body.name, description: body.description },
    });
    return NextResponse.json(lab);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RequestParams) {
  if (!(await checkPermission("lab.delete")))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const lab = await prisma.lab.delete({ where: { id } });

    await createNotification({
      title: "Lab Deleted",
      message: `Laboratory resources have been decommissioned.`,
      type: "ERROR",
    });

    await prisma.log.create({
      data: {
        type: "LAB_DELETED",
        severity: "WARNING",
        message: `Lab ${lab.name} deleted.`,
        targetId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Cannot delete lab with active VMs" },
      { status: 400 },
    );
  }
}
