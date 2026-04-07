// app/api/agent/log/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.NEXTJS_API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, severity, message, targetName, vmId, details } = body;

    console.log(`📥 Webhook: ID ${vmId} | Host: ${targetName} | Type: ${type}`);

    // 1. Resolve VM
    let vm = null;
    if (vmId) {
      vm = await prisma.vM.findUnique({ where: { id: vmId } });
    }

    if (!vm && targetName) {
      vm = await prisma.vM.findFirst({
        where: { hostname: { equals: targetName, mode: "insensitive" } },
      });
    }

    // 2. Create the system log entry
    await prisma.log.create({
      data: {
        type: type,
        severity: severity,
        message: message,
        targetName: targetName || "unknown",
        targetId: vm?.id || vmId || null,
        details: details ? { output: details } : {},
      },
    });

    // 3. Process Build Results
    if (vm) {
      const isSuccess = type === "NIX_BUILD_SUCCESS";
      const isFailure = type === "NIX_BUILD_FAILED";

      if (isSuccess || isFailure) {
        // A. Update Package Statuses in DB
        await prisma.vMPackage.updateMany({
          where: { vmId: vm.id, status: "PENDING" },
          data: { status: isSuccess ? "INSTALLED" : "FAILED" },
        });

        // B. Create Persistent Notification in DB
        const notificationTitle = isSuccess ? "Sync Successful" : "Sync Failed";
        const notificationMessage = isSuccess
          ? `VM ${vm.hostname} has successfully applied the new package configuration.`
          : `VM ${vm.hostname} failed to rebuild. Manual intervention may be required.`;
        const notificationType = isSuccess ? "SUCCESS" : "ERROR";

        await prisma.notification.create({
          data: {
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            labId: vm.labId,
            link: `/admin/logs/system?search=${vm.hostname}`,
          },
        });

        // C. TRIGGER REAL-TIME POPUP (WebSocket)
        // Access the 'io' instance we attached to global in server.ts
        const io = (global as any).io;
        if (io) {
          io.emit("new-notification", {
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType, // Sonner listener uses this for color/icons
          });
        }

        console.log(`🔔 Notification & Socket emitted for ${vm.hostname}`);
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("🔴 Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
