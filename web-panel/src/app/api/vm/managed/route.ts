// app/api/vm/managed/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetVmIp } from "@/lib/proxmox";
import { checkPermission } from "@/lib/auth";

const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

export async function GET() {
  if (!(await checkPermission("vm.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const dbVms = await prisma.vM.findMany({
      include: { lab: true },
    });

    // Resolve IPs in parallel for all VMs
    const managedVms = await Promise.all(
      dbVms.map(async (vm) => {
        const ip = await GetVmIp(PROXMOX_NODE, vm.proxmoxId);
        return {
          id: vm.id, // Prisma CUID
          proxmoxId: vm.proxmoxId,
          hostname: vm.hostname,
          labName: vm.lab.name,
          ip: ip,
          isReady: !ip.includes("Waiting") && !ip.includes("No IP"),
        };
      }),
    );

    return NextResponse.json(managedVms);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch managed VMs" },
      { status: 500 },
    );
  }
}
