import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActionSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getActionSession();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Scoping: Admins see all, Faculty see their specific userId or their assigned labId
    const where = user.role.includes("ADMIN")
      ? {}
      : { OR: [{ userId: user.id }, { labId: user.labId }] };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { ...where, isRead: false },
    });

    return NextResponse.json({ data: notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT() {
  try {
    const user = await getActionSession();
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
