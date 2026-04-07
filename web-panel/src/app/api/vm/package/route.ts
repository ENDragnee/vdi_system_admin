import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { logger } from "@/lib/logger";

const CONFIG_DIR = process.env.NIXOS_CONFIG_DIR || "";

// Initialize child logger for this route
const log = logger.child({ module: "vm-package-manager" });

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { vmId, ip, packageName, action } = body;

    log.info(
      { vmId, packageName, action, ip },
      "Package operation request received",
    );

    // 1. Validate VM
    const vm = await prisma.vM.findUnique({ where: { id: vmId } });
    if (!vm) {
      log.warn({ vmId }, "VM validation failed: Record not found");
      return NextResponse.json({ error: "VM not found" }, { status: 404 });
    }

    if (!ip) {
      log.warn(
        { vmId, hostname: vm.hostname },
        "IP validation failed: No target IP provided",
      );
      return NextResponse.json(
        { error: "No IP address provided" },
        { status: 400 },
      );
    }

    // 2. Modify the Nix Configuration File
    const packagesFilePath = path.join(CONFIG_DIR, "modules", "packages.nix");
    log.debug({ path: packagesFilePath }, "Reading Nix configuration file");

    let fileContent = fs.readFileSync(packagesFilePath, "utf-8");

    if (action === "install") {
      if (!fileContent.includes(`\n    ${packageName}\n`)) {
        fileContent = fileContent.replace(
          /\n\s+\];\n\}/,
          `\n    ${packageName}\n  ];\n}`,
        );
        log.info({ packageName }, "Injected package into Nix configuration");
      }
    } else if (action === "uninstall") {
      const regex = new RegExp(`\\n\\s+${packageName}\\b`, "g");
      fileContent = fileContent.replace(regex, "");
      log.info({ packageName }, "Removed package from Nix configuration");
    }

    fs.writeFileSync(packagesFilePath, fileContent, "utf-8");

    // 3. GitOps: Commit and Push
    try {
      log.debug({ cwd: CONFIG_DIR }, "Executing GitOps push sequence");
      execSync(`git add modules/packages.nix`, { cwd: CONFIG_DIR });
      const commitMsg = `API: ${action} ${packageName} for VM ${vm.hostname}`;
      execSync(`git commit -m "${commitMsg}"`, { cwd: CONFIG_DIR });
      execSync(`git push origin main`, { cwd: CONFIG_DIR });
      log.info({ commitMsg }, "GitOps push successful");
    } catch (gitErr: any) {
      // We log as info because git often returns non-zero if there's nothing to commit
      log.info(
        { error: gitErr.message },
        "GitOps push skipped or returned non-zero",
      );
    }

    // 4. Update Prisma Database (Set to PENDING)
    log.debug({ vmId, packageName }, "Updating VMPackage status to PENDING");
    const pkg = await prisma.package.upsert({
      where: { name: packageName },
      update: {},
      create: { name: packageName },
    });

    await prisma.vMPackage.upsert({
      where: { vmId_packageId: { vmId: vm.id, packageId: pkg.id } },
      update: { status: "PENDING" },
      create: {
        vmId: vm.id,
        packageId: pkg.id,
        status: "PENDING",
      },
    });

    // 5. TRIGGER AGENT
    const agentUrl = `http://${ip}:8081/api/sync`;
    log.info({ agentUrl, vmId: vm.id }, "Triggering VM Agent sync");

    fetch(agentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AGENT_SECRET}`,
      },
      body: JSON.stringify({
        vmId: vm.id,
        callbackUrl: `${process.env.NEXTJS_BASE_URL}/api/agent/log`,
      }),
    }).catch((err) => {
      log.error(
        { err: err.message, ip, vmId: vm.id },
        "Network error triggering VM Agent",
      );
    });

    const duration = Date.now() - startTime;
    log.info(
      { duration, vmId: vm.id },
      "POST /api/vm/package completed successfully",
    );

    return NextResponse.json({ success: true, status: "Sync Initiated" });
  } catch (error: any) {
    log.error(
      {
        err: error.message,
        stack: error.stack,
        context: "Critical Route Failure",
      },
      "Internal Server Error in package route",
    );

    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
