// app/api/vm/package/bulk/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetVmIp } from "@/lib/proxmox";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CONFIG_DIR = process.env.NIXOS_CONFIG_DIR || "";
const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

export async function POST(req: Request) {
  try {
    const { vmIds, packageName, action } = await req.json(); // action: 'install' | 'uninstall' | 'sync'

    // 1. Modify Git (Only if it's an install/uninstall action)
    if (action !== "sync") {
      const packagesFilePath = path.join(CONFIG_DIR, "modules", "packages.nix");
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
        execSync(
          `git add modules/packages.nix && git commit -m "Bulk ${action}: ${packageName}" && git push`,
          { cwd: CONFIG_DIR },
        );
      } catch (e) {
        console.log("Git push skipped (likely no changes)");
      }
    }

    // 2. Process all selected VMs
    const vms = await prisma.vM.findMany({ where: { id: { in: vmIds } } });

    const results = await Promise.allSettled(
      vms.map(async (vm) => {
        // Update DB Status
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
          }
        }

        // Resolve IP and trigger Agent
        const ip = await GetVmIp(PROXMOX_NODE, vm.proxmoxId);
        if (!ip.includes("."))
          return { hostname: vm.hostname, status: "No IP" };

        await fetch(`http://${ip}:8081/api/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.AGENT_SECRET}`,
          },
          body: JSON.stringify({
            callbackUrl: `${process.env.NEXTJS_BASE_URL}/api/agent/log`,
          }),
        });

        return { hostname: vm.hostname, status: "Triggered" };
      }),
    );

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
