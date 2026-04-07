import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestParams } from "@/types/request-param";
import { logger } from "@/lib/logger";

// Initialize scoped child logger
const log = logger.child({ module: "notifications-api" });

export async function PUT(req: Request, { params }: RequestParams) {
  const startTime = Date.now();

  try {
    const { id } = await params;

    log.debug(
      { notificationId: id },
      "Attempting to mark notification as read",
    );

    // 1. Execute Update
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const duration = Date.now() - startTime;
    log.info(
      {
        duration,
        notificationId: id,
        type: updatedNotification.type,
      },
      "Notification marked as read",
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Determine if it's a "Record not found" error or a logic crash
    const isNotFound = error.code === "P2025";

    log.error(
      {
        err: error.message,
        notificationId: (await params).id,
        code: error.code,
      },
      isNotFound
        ? "Failed to mark read: Notification not found"
        : "Critical failure in single-read API",
    );

    return NextResponse.json(
      { error: isNotFound ? "Notification not found" : "Update failed" },
      { status: isNotFound ? 404 : 400 },
    );
  }
}
