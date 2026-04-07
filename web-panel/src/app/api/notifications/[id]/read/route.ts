import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestParams } from "@/types/request-param";

export async function PUT(req: Request, { params }: RequestParams) {
  try {
    const { id } = await params;
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}
