// app/api/agent/log/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Initialize child logger for the webhook handler
const log = logger.child({ module: "agent-webhook" });

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // 1. Authorization Check
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.NEXTJS_API_KEY}`) {
      log.warn(
        {
          authHeader: authHeader ? "Present (Hidden)" : "Missing",
          context: "Security Breach",
        },
        "Unauthorized webhook attempt blocked",
      );

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, severity, message, targetName, vmId, details } = body;

    log.info(
      { vmId, host: targetName, eventType: type, severity },
      "Received agent telemetry webhook",
    );

    // 2. Resolve VM (Primary: ID, Fallback: Hostname)
    let vm = null;
    if (vmId) {
      vm = await prisma.vM.findUnique({ where: { id: vmId } });
    }

    if (!vm && targetName) {
      log.debug(
        { targetName },
        "VM ID not provided, attempting hostname fallback resolution",
      );
      vm = await prisma.vM.findFirst({
        where: { hostname: { equals: targetName, mode: "insensitive" } },
      });
    }

    if (!vm) {
      log.error(
        { vmId, targetName, payload: body },
        "Webhook processing stalled: VM could not be identified in Database",
      );
      // We continue to create the Log entry anyway for audit purposes, but skip status updates
    }

    // 3. Create the System Log Entry (Postgres Audit)
    log.debug(
      { vmId: vm?.id || vmId },
      "Persisting system audit log to Postgres",
    );
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

    // 4. Process Build Results (Business Logic)
    if (vm) {
      const isSuccess = type === "NIX_BUILD_SUCCESS";
      const isFailure = type === "NIX_BUILD_FAILED";

      if (isSuccess || isFailure) {
        log.info(
          { hostname: vm.hostname, outcome: isSuccess ? "SUCCESS" : "FAILURE" },
          "Processing build completion logic",
        );

        // A. Update Package Statuses
        const updateResult = await prisma.vMPackage.updateMany({
          where: { vmId: vm.id, status: "PENDING" },
          data: { status: isSuccess ? "INSTALLED" : "FAILED" },
        });
        log.debug(
          { count: updateResult.count },
          "Batch updated PENDING packages",
        );

        // B. Create Persistent Notification
        const notificationTitle = isSuccess ? "Sync Successful" : "Sync Failed";
        const notificationMessage = isSuccess
          ? `VM ${vm.hostname} has successfully applied the new configuration.`
          : `VM ${vm.hostname} failed to rebuild. Check system logs.`;
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

        // C. Trigger Real-time Socket Pop-up
        const io = (global as any).io;
        if (io) {
          log.debug("Emitting real-time notification to WebSocket cluster");
          io.emit("new-notification", {
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    log.info({ duration, vmId: vm?.id }, "Webhook processed successfully");

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    log.error(
      {
        err: error.message,
        stack: error.stack,
        context: "Webhook Crash",
      },
      "Critical failure in agent log webhook",
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
