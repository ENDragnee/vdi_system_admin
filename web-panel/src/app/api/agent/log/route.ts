import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.NEXTJS_API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, severity, message, targetName, details } = await req.json();

    const vm = await prisma.vM.findFirst({ where: { hostname: targetName } });

    // 1. Create the log entry
    const newLog = await prisma.log.create({
      data: {
        type: type,
        severity: severity,
        message: message,
        targetName: targetName,
        targetId: vm?.id || null,
        details: details ? JSON.stringify({ output: details }) : {},
      },
    });

    // 2. If build was successful, mark pending packages as installed
    if (type === "NIX_BUILD_SUCCESS" && vm) {
      await prisma.vMPackage.updateMany({
        where: { vmId: vm.id, status: "PENDING" },
        data: { status: "INSTALLED" },
      });
    }

    // 3. If build failed, mark pending packages as failed
    if (type === "NIX_BUILD_FAILED" && vm) {
      await prisma.vMPackage.updateMany({
        where: { vmId: vm.id, status: "PENDING" },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json(
      { success: true, logId: newLog.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
