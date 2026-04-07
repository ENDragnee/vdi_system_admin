import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission, getActionSession } from "@/lib/auth";
import { RequestParams } from "@/types/request-param";
import { logger } from "@/lib/logger";
import { createNotification } from "@/lib/notification-service";

// Initialize scoped child logger
const log = logger.child({ module: "faculty-mgmt" });

export async function PUT(req: Request, { params }: RequestParams) {
  const startTime = Date.now();

  try {
    const user = await getActionSession();
    if (!(await checkPermission("faculty.manage"))) {
      log.warn(
        { user: user.email },
        "Unauthorized PUT attempt on faculty member",
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    log.info(
      { admin: user.email, targetId: id },
      "Updating faculty member details",
    );

    // Perform Update
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        labId: body.labId === "none" ? null : body.labId || null,
      },
      include: { lab: true },
    });

    const duration = Date.now() - startTime;
    log.info({ duration, userId: id }, "Faculty member updated successfully");

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    log.error(
      {
        err: error.message,
        stack: error.stack,
        targetId: (await params).id,
      },
      "Failed to update faculty member",
    );

    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RequestParams) {
  const startTime = Date.now();

  try {
    const user = await getActionSession();
    if (!(await checkPermission("faculty.manage"))) {
      log.warn(
        { user: user.email },
        "Unauthorized DELETE attempt on faculty member",
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // 1. Fetch user info before deletion for the notification/logs
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true },
    });

    if (!targetUser) {
      log.warn({ targetId: id }, "Delete aborted: Faculty member not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    log.info(
      { admin: user.email, target: targetUser.email },
      "Permanently deleting faculty member",
    );

    // 2. Execute Deletion
    await prisma.user.delete({ where: { id } });

    // 3. System Notification (Audit Trail)
    await createNotification({
      title: "Faculty Removed",
      message: `${targetUser.name || targetUser.email} has been removed from the registry by ${user.name}.`,
      type: "WARNING",
    });

    // 4. Audit Log
    await prisma.log.create({
      data: {
        type: "AUTH_ROLE_CHANGED",
        severity: "WARNING",
        message: `Admin ${user.email} deleted faculty member: ${targetUser.email}`,
        userId: user.id,
        targetId: id,
        targetName: targetUser.name,
      },
    });

    const duration = Date.now() - startTime;
    log.info(
      { duration, targetEmail: targetUser.email },
      "Faculty member deleted and notified",
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    log.error(
      {
        err: error.message,
        stack: error.stack,
      },
      "Critical failure during faculty deletion",
    );

    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
