import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash_password } from "@/lib/password-utils";
import { getActionSession, checkPermission } from "@/lib/auth";
import { createNotification } from "@/lib/notification-service";

export async function GET(req: NextRequest) {
  if (!(await checkPermission("faculty.manage"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
  const skip = (page - 1) * limit;

  try {
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

    return NextResponse.json({
      data: faculty,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!(await checkPermission("faculty.manage"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminUser = await getActionSession();

  try {
    const body = await req.json();
    const { name, email, password, labId } = body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: "Email registered" }, { status: 409 });

    const facultyRole = await prisma.role.findFirst({
      where: { guardName: "FACULTY" },
    });
    if (!facultyRole) throw new Error("FACULTY role not found");

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

    // 1. Create Persistent Notification in DB
    const notifTitle = "New Faculty Registered";
    const notifMessage = `${newUser.name} (${newUser.email}) has been registered and assigned to ${newUser.lab ? newUser.lab.name : "the general pool"}.`;

    await createNotification({
      title: notifTitle,
      message: notifMessage,
      type: "SUCCESS",
    });

    await prisma.notification.create({
      data: {
        userId: newUser.id,
        labId: newUser.labId,
        title: notifTitle,
        message: notifMessage,
        type: "SUCCESS",
        link: "/admin/faculty-management",
      },
    });

    // 3. Create Audit Log
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

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Faculty Creation Error:", error.message);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
