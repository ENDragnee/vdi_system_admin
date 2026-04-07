import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash_password } from "@/lib/password-utils";
import { getActionSession, checkPermission } from "@/lib/auth";
import { createNotification } from "@/lib/notification-service";
import { logger } from "@/lib/logger";

// Initialize scoped child logger
const log = logger.child({ module: "faculty-mgmt" });

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    if (!(await checkPermission("faculty.manage"))) {
      log.warn("Unauthorized attempt to access faculty registry");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";
    const skip = (page - 1) * limit;

    log.info({ search, page, limit }, "Querying faculty members");

    const where = {
      roleUsers: { some: { roles: { guardName: "FACULTY" } } },
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [faculty, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: { lab: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const duration = Date.now() - startTime;
    log.info(
      { duration, count: faculty.length, total },
      "Faculty registry fetched successfully",
    );

    return NextResponse.json({
      data: faculty,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    log.error(
      { err: error.message, stack: error.stack },
      "Failed to fetch faculty list",
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();

  if (!(await checkPermission("faculty.manage"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminUser = await getActionSession();

  try {
    const body = await req.json();
    const { name, email, password, labId } = body;

    log.info(
      { admin: adminUser.email, targetEmail: email },
      "Faculty registration initiated",
    );

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      log.warn({ email }, "Faculty registration blocked: Email already exists");
      return NextResponse.json({ error: "Email registered" }, { status: 409 });
    }

    const facultyRole = await prisma.role.findFirst({
      where: { guardName: "FACULTY" },
    });

    if (!facultyRole) {
      log.fatal(
        "Prisma error: Role 'FACULTY' not found in database. Check seeders.",
      );
      throw new Error("FACULTY role not found");
    }

    log.debug({ email }, "Hashing new faculty password");
    const hashedPassword = await hash_password(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        labId: labId || null,
        roleUsers: { create: { roleId: facultyRole.id } },
      },
      include: { lab: true },
    });

    log.info(
      { userId: newUser.id, lab: newUser.lab?.name },
      "Faculty user created in database",
    );

    // 1. Create Notification (This helper handles both DB write and WebSocket emit)
    const notifTitle = "New Faculty Registered";
    const notifMessage = `${newUser.name} (${newUser.email}) has been assigned to ${newUser.lab ? newUser.lab.name : "the general pool"}.`;

    log.debug({ userId: newUser.id }, "Dispatching welcome notifications");
    await createNotification({
      title: notifTitle,
      message: notifMessage,
      type: "SUCCESS",
      userId: newUser.id, // Direct to the new user
      labId: newUser.labId, // And visible to the lab
      link: "/admin/faculty-management",
    });

    // 2. Create Audit Log (Immutable record)
    await prisma.log.create({
      data: {
        type: "AUTH_ROLE_CHANGED",
        severity: "INFO",
        message: `Admin ${adminUser.email} registered new faculty member: ${email}`,
        userId: adminUser.id,
        targetId: newUser.id,
        targetName: newUser.name,
      },
    });

    const duration = Date.now() - startTime;
    log.info(
      { duration, userId: newUser.id },
      "Faculty onboarding process complete",
    );

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    log.error(
      { err: error.message, stack: error.stack },
      "Fatal error during faculty registration",
    );
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
