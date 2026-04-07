import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash_password } from "@/lib/password-utils";
import { getActionSession, checkPermission } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { RequestParams } from "@/types/request-param";

const log = logger.child({ module: "user-security" });

export async function PUT(req: Request, { params }: RequestParams) {
  const startTime = Date.now();
  try {
    const admin = await getActionSession();
    const { id } = await params;

    // Security check: Only admins can reset passwords
    if (!(await checkPermission("user.password.reset"))) {
      log.warn({ admin: admin.email }, "Unauthorized password reset attempt");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const hashedPassword = await hash_password(newPassword);

    const targetUser = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: { email: true, name: true },
    });

    // Create Audit Log
    await prisma.log.create({
      data: {
        type: "AUTH_ROLE_CHANGED", // Using existing type for security events
        severity: "WARNING",
        message: `Admin ${admin.email} reset password for ${targetUser.email}`,
        userId: admin.id,
        targetId: id,
      },
    });

    log.info(
      {
        admin: admin.email,
        target: targetUser.email,
        duration: Date.now() - startTime,
      },
      "Password reset successful",
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    log.error({ err: error.message }, "Password reset API failure");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
