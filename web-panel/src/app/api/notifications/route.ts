import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActionSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

// Initialize scoped child logger
const log = logger.child({ module: "notifications-api" });

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await getActionSession();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    log.info(
      { user: user.email, role: user.role },
      "Fetching notification feed",
    );

    // 1. Resolve Scoping Logic
    // Admins: {} (Global)
    // Faculty: userId OR labId
    const where: any = user.role.includes("ADMIN")
      ? {}
      : {
          OR: [{ userId: user.id }, { labId: user.labId }],
        };

    log.debug({ where, limit }, "Executing notification query with scoping");

    // 2. Database Fetch
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { ...where, isRead: false },
      }),
    ]);

    const duration = Date.now() - startTime;
    log.info(
      { duration, resultCount: notifications.length, unread: unreadCount },
      "Notifications successfully retrieved",
    );

    return NextResponse.json({ data: notifications, unreadCount });
  } catch (error: any) {
    log.error(
      {
        err: error.message,
        stack: error.stack,
        context: "GET /api/notifications",
      },
      "Internal error retrieving notifications",
    );

    return NextResponse.json(
      { error: "Unauthorized or server error" },
      { status: 500 },
    );
  }
}

export async function PUT() {
  try {
    const user = await getActionSession();

    const where: any = user.role.includes("ADMIN")
      ? { isRead: false }
      : { isRead: false, OR: [{ userId: user.id }, { labId: user.labId }] };

    const result = await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    log.info(
      { user: user.email, count: result.count },
      "Bulk mark-as-read complete",
    );
    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    log.error({ err: error.message }, "Mark all read failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const user = await getActionSession();

    const where: any = user.role.includes("ADMIN")
      ? {}
      : { OR: [{ userId: user.id }, { labId: user.labId }] };

    const result = await prisma.notification.deleteMany({ where });

    log.info(
      { user: user.email, count: result.count },
      "Deleted all notifications",
    );
    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    log.error({ err: error.message }, "Failed to clear notifications");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
