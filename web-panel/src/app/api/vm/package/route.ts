import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CONFIG_DIR = process.env.NIXOS_CONFIG_DIR || "";

export async function POST(req: Request) {
  try {
    const { vmId, ip, packageName, action } = await req.json();

    const vm = await prisma.vM.findUnique({ where: { id: vmId } });
    if (!vm)
      return NextResponse.json({ error: "VM not found" }, { status: 404 });

    if (!ip)
      return NextResponse.json(
        { error: "No IP address provided" },
        { status: 400 },
      );

    // 1. GitOps: Modify the Configuration File
    const packagesFilePath = path.join(CONFIG_DIR, "modules", "packages.nix");
    let fileContent = fs.readFileSync(packagesFilePath, "utf-8");

    if (action === "install") {
      if (!fileContent.includes(`\n    ${packageName}\n`)) {
        fileContent = fileContent.replace(
          /\n\s+\];\n\}/,
          `\n    ${packageName}\n  ];\n}`,
        );
      }
    } else if (action === "uninstall") {
      const regex = new RegExp(`\\n\\s+${packageName}\\b`, "g");
      fileContent = fileContent.replace(regex, "");
    }

    fs.writeFileSync(packagesFilePath, fileContent, "utf-8");

    // 2. GitOps: Commit and Push
    try {
      execSync(`git add modules/packages.nix`, { cwd: CONFIG_DIR });
      execSync(
        `git commit -m "API: ${action} ${packageName} for VM ${vm.hostname}"`,
        { cwd: CONFIG_DIR },
      );
      execSync(`git push origin main`, { cwd: CONFIG_DIR });
    } catch (gitErr) {
      console.log("Git push skipped (no changes).");
    }

    // 3. Database: Set Package to PENDING
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

    // 4. TRIGGER AGENT: Pass the Database ID (vmId) and Callback
    const agentUrl = `http://${ip}:8081/api/sync`;

    fetch(agentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AGENT_SECRET}`,
      },
      body: JSON.stringify({
        vmId: vm.id, // THE FIX: Inform agent of its DB ID
        callbackUrl: `${process.env.NEXTJS_BASE_URL}/api/agent/log`,
      }),
    }).catch((err) => console.error(`Agent at ${ip} unreachable:`, err));

    return NextResponse.json({ success: true, status: "Sync Initiated" });
  } catch (error: any) {
    console.error("Package API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
