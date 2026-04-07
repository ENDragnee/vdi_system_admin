// app/api/vm/managed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetVmIp } from "@/lib/proxmox";
import { getActionSession } from "@/lib/auth";

const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

export async function GET(req: NextRequest) {
  try {
    const user = await getActionSession();
    const { searchParams } = new URL(req.url);

    // 1. RESOLVE SECURITY SCOPE
    let targetLabId: string | null = null;

    // Admin priority: See all labs by default, or filter by a specific one
    if (user.role.includes("ADMIN")) {
      targetLabId = searchParams.get("labId") || null;
    }
    // Faculty restriction: Strictly forced to their own labId
    else if (user.role.includes("FACULTY")) {
      if (!user.labId) {
        return NextResponse.json([], { status: 200 }); // Return empty if no lab assigned
      }
      targetLabId = user.labId;
    }

    // 2. FETCH VMS FROM POSTGRES
    const dbVms = await prisma.vM.findMany({
      where: targetLabId ? { labId: targetLabId } : {},
      include: { lab: true },
      orderBy: { hostname: "asc" },
    });

    // 3. RESOLVE IPS FROM PROXMOX AGENT
    const managedVms = await Promise.all(
      dbVms.map(async (vm) => {
        const ip = await GetVmIp(PROXMOX_NODE, vm.proxmoxId);
        return {
          id: vm.id,
          proxmoxId: vm.proxmoxId,
          hostname: vm.hostname,
          labName: vm.lab.name,
          ip: ip,
          // Helper flag for UI indicators
          isReady:
            !ip.includes("Waiting") &&
            !ip.includes("No IP") &&
            !ip.includes("Offline"),
        };
      }),
    );

    return NextResponse.json(managedVms);
  } catch (error: any) {
    console.error("Managed VMs API Error:", error.message);
    return NextResponse.json(
      { error: "Unauthorized or server error" },
      { status: 500 },
    );
  }
}
