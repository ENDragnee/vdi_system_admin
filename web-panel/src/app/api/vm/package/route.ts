import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CONFIG_DIR = process.env.NIXOS_CONFIG_DIR || "";

export async function POST(req: Request) {
  try {
    const { vmId, packageName, action } = await req.json(); // action: 'install' | 'uninstall'

    // 1. Validate VM
    const vm = await prisma.vM.findUnique({ where: { id: vmId } });
    if (!vm)
      return NextResponse.json({ error: "VM not found" }, { status: 404 });

    // 2. Modify the Nix Configuration File
    const packagesFilePath = path.join(CONFIG_DIR, "modules", "packages.nix");
    let fileContent = fs.readFileSync(packagesFilePath, "utf-8");

    if (action === "install") {
      // Regex to find the closing bracket of the packages list and inject the package
      if (!fileContent.includes(`\n    ${packageName}\n`)) {
        fileContent = fileContent.replace(
          /\n\s+\];\n\}/,
          `\n    ${packageName}\n  ];\n}`,
        );
      }
    } else if (action === "uninstall") {
      // Regex to remove the package from the list
      const regex = new RegExp(`\\n\\s+${packageName}\\b`, "g");
      fileContent = fileContent.replace(regex, "");
    }

    // Write changes to file
    fs.writeFileSync(packagesFilePath, fileContent, "utf-8");

    // 3. Commit and Push to Git
    try {
      execSync(`git add modules/packages.nix`, { cwd: CONFIG_DIR });
      execSync(
        `git commit -m "API: ${action} ${packageName} for VM ${vm.hostname}"`,
        { cwd: CONFIG_DIR },
      );
      execSync(`git push origin main`, { cwd: CONFIG_DIR }); // Change 'main' to your branch name if different
    } catch (gitErr) {
      console.log("Git push skipped or failed (maybe no changes).", gitErr);
    }

    // 4. Update Prisma Database (Set to PENDING)
    // Find or create the Package record
    const pkg = await prisma.package.upsert({
      where: { name: packageName },
      update: {},
      create: { name: packageName },
    });

    await prisma.vMPackage.upsert({
      where: { vmId_packageId: { vmId: vm.id, packageId: pkg.id } },
      update: { status: action === "install" ? "PENDING" : "MISSING" },
      create: {
        vmId: vm.id,
        packageId: pkg.id,
        status: action === "install" ? "PENDING" : "MISSING",
      },
    });

    // 5. Trigger the VM Agent to Pull and Rebuild
    const VM_IP = "192.168.122.8"; // TODO: In production, fetch this from Proxmox API or mDNS

    fetch(`http://${VM_IP}:8081/api/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AGENT_SECRET}`,
      },
      body: JSON.stringify({
        callbackUrl: `${process.env.NEXTJS_BASE_URL}/api/agent/log`,
      }),
    }).catch((err) => console.error("Agent unreachable:", err));

    return NextResponse.json({ success: true, status: "Sync Initiated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
