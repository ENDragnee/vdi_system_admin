import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetVmIp } from "@/lib/proxmox";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { logger } from "@/lib/logger";

const CONFIG_DIR = process.env.NIXOS_CONFIG_DIR || "";
const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

// Initialize child logger for bulk operations
const log = logger.child({ module: "bulk-package-manager" });

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { vmIds, packageName, action } = body;

    log.info(
      { action, packageName, targetCount: vmIds?.length },
      "Bulk package operation initiated",
    );

    // 1. Modify Git (Only if it's an install/uninstall action)
    if (action !== "sync") {
      const packagesFilePath = path.join(CONFIG_DIR, "modules", "packages.nix");
      log.debug({ path: packagesFilePath }, "Updating Nix configuration file");

      let fileContent = fs.readFileSync(packagesFilePath, "utf-8");

      if (
        action === "install" &&
        !fileContent.includes(`\n    ${packageName}\n`)
      ) {
        fileContent = fileContent.replace(
          /\n\s+\];\n\}/,
          `\n    ${packageName}\n  ];\n}`,
        );
      } else if (action === "uninstall") {
        const regex = new RegExp(`\\n\\s+${packageName}\\b`, "g");
        fileContent = fileContent.replace(regex, "");
      }

      fs.writeFileSync(packagesFilePath, fileContent, "utf-8");

      try {
        const commitMsg = `Bulk ${action}: ${packageName}`;
        execSync(
          `git add modules/packages.nix && git commit -m "${commitMsg}" && git push`,
          {
            cwd: CONFIG_DIR,
          },
        );
        log.info({ commitMsg }, "GitOps bulk push successful");
      } catch (gitErr: any) {
        log.warn(
          { err: gitErr.message },
          "GitOps push skipped (no changes to repository)",
        );
      }
    }

    // 2. Process all selected VMs
    const vms = await prisma.vM.findMany({ where: { id: { in: vmIds } } });
    log.info({ foundCount: vms.length }, "Resolved target VMs from database");

    const results = await Promise.allSettled(
      vms.map(async (vm) => {
        // A. Update DB Status
        if (action !== "sync") {
          const pkg = await prisma.package.findUnique({
            where: { name: packageName },
          });
          if (pkg) {
            await prisma.vMPackage.upsert({
              where: { vmId_packageId: { vmId: vm.id, packageId: pkg.id } },
              update: { status: action === "install" ? "PENDING" : "MISSING" },
              create: {
                vmId: vm.id,
                packageId: pkg.id,
                status: action === "install" ? "PENDING" : "MISSING",
              },
            });
            log.debug(
              { hostname: vm.hostname, pkg: packageName },
              "Updated VMPackage status to PENDING",
            );
          }
        }

        // B. Resolve IP and trigger Agent
        const ip = await GetVmIp(PROXMOX_NODE, vm.proxmoxId);

        if (!ip || ip.includes("Waiting") || ip.includes("Offline")) {
          log.warn(
            { hostname: vm.hostname, ip },
            "Skipping agent trigger: No valid IP resolved",
          );
          return { hostname: vm.hostname, status: "No IP" };
        }

        const agentUrl = `http://${ip}:8081/api/sync`;
        log.debug(
          { hostname: vm.hostname, agentUrl },
          "Dispatching sync request to VM Agent",
        );

        await fetch(agentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.AGENT_SECRET}`,
          },
          body: JSON.stringify({
            vmId: vm.id,
            callbackUrl: `${process.env.NEXTJS_BASE_URL}/api/agent/log`,
          }),
        });

        return { hostname: vm.hostname, status: "Triggered" };
      }),
    );

    const duration = Date.now() - startTime;
    log.info(
      { duration, successCount: vms.length },
      "Bulk action processing completed",
    );

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    log.error(
      { err: error.message, stack: error.stack },
      "Critical failure in bulk package route",
    );
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
