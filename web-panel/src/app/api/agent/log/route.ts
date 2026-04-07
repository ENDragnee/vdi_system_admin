// app/api/agent/log/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";

const log = logger.child({ module: "agent-webhook" });
const CONFIG_DIR = process.env.NIXOS_CONFIG_DIR || "";

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.NEXTJS_API_KEY}`) {
      log.warn("Unauthorized webhook attempt blocked");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, severity, message, targetName, details } = body;
    const vmId = body.vmId || body.targetId;

    log.info({ vmId, host: targetName, type }, "📥 Webhook received");

    if (!vmId) {
      log.error("Webhook rejected: Missing VM ID");
      return NextResponse.json({ error: "vmId required" }, { status: 400 });
    }

    // 1. Resolve VM
    const vm = await prisma.vM.findUnique({ where: { id: vmId } });

    // 2. Create the system log entry
    await prisma.log.create({
      data: {
        type: type,
        severity: severity,
        message: message,
        targetName: targetName || "unknown",
        targetId: vmId,
        details: details ? { output: details } : {},
      },
    });

    // 3. Process Build Results
    if (vm) {
      const isSuccess = type === "NIX_BUILD_SUCCESS";
      const isFailure = type === "NIX_BUILD_FAILED";

      if (isSuccess) {
        log.info(
          { hostname: vm.hostname },
          "Refining package states via Git Source of Truth",
        );

        // A. Read the current packages.nix file
        const packagesFilePath = path.join(
          CONFIG_DIR,
          "modules",
          "packages.nix",
        );
        const fileContent = fs.readFileSync(packagesFilePath, "utf-8");

        // B. Find all packages for this VM that are currently PENDING
        const pendingPackages = await prisma.vMPackage.findMany({
          where: { vmId: vm.id, status: "PENDING" },
          include: { package: true },
        });

        // C. Update each pending package based on its presence in the Nix file
        for (const vmp of pendingPackages) {
          // Check if the package name exists as a standalone word in the nix list
          const isInFile = new RegExp(`\\b${vmp.package.name}\\b`).test(
            fileContent,
          );

          const finalStatus = isInFile ? "INSTALLED" : "MISSING";

          await prisma.vMPackage.update({
            where: { id: vmp.id },
            data: { status: finalStatus },
          });

          log.debug(
            { pkg: vmp.package.name, finalStatus },
            "Package state synchronized with Git",
          );
        }

        // D. Create Success Notification
        await createNotification(vm, "Sync Successful", message, "SUCCESS");
      } else if (isFailure) {
        // If build failed, move all PENDING to FAILED
        await prisma.vMPackage.updateMany({
          where: { vmId: vm.id, status: "PENDING" },
          data: { status: "FAILED" },
        });
        await createNotification(
          vm,
          "Sync Failed",
          "The NixOS rebuild failed. Check logs.",
          "ERROR",
        );
      }
    }

    const duration = Date.now() - startTime;
    log.info({ duration, vmId }, "Webhook processed successfully");
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    log.error({ err: error.message }, "🔴 Webhook failure");
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// Helper to handle DB and WebSocket notifications
async function createNotification(
  vm: any,
  title: string,
  message: string,
  type: any,
) {
  await prisma.notification.create({
    data: {
      title,
      message: `VM ${vm.hostname}: ${message}`,
      type,
      labId: vm.labId,
      link: `/admin/logs/system?search=${vm.hostname}`,
    },
  });

  const io = (global as any).io;
  if (io) {
    io.emit("new-notification", {
      title,
      message: `VM ${vm.hostname}: ${message}`,
      type,
    });
  }
}
