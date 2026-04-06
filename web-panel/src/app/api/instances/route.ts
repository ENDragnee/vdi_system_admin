// src/app/api/instances/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pveFetch, GetVmIp } from "@/lib/proxmox";

const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

export async function GET() {
  try {
    // 1. Fetch DB Data
    const dbVms = await prisma.vM.findMany({
      include: { lab: true },
      orderBy: { createdAt: "desc" },
    });
    const dbLabs = await prisma.lab.findMany();

    // 2. Fetch Proxmox Live Data
    const pveResponse = await pveFetch(`/nodes/${PROXMOX_NODE}/qemu`);
    const pveVms = pveResponse.data || [];

    // 3. Merge Data & Fetch IPs Concurrently
    const instances = await Promise.all(
      dbVms.map(async (dbVm) => {
        const pveVm = pveVms.find((p: any) => p.vmid === dbVm.proxmoxId);

        let status = "offline";
        let cpu = 0;
        let ram = 0;
        let storage = 0;
        let ip = "Offline";

        if (pveVm) {
          status = pveVm.status === "running" ? "online" : "offline";
          cpu = pveVm.cpu ? Math.round(pveVm.cpu * 100) : 0;
          ram =
            pveVm.maxmem && pveVm.mem
              ? Math.round((pveVm.mem / pveVm.maxmem) * 100)
              : 0;
          storage =
            pveVm.maxdisk && pveVm.disk
              ? Math.round((pveVm.disk / pveVm.maxdisk) * 100)
              : 0;

          // Only attempt to fetch the IP if the VM is actually running
          if (status === "online") {
            ip = await GetVmIp(PROXMOX_NODE, dbVm.proxmoxId);
          }
        }

        return {
          id: dbVm.id,
          proxmoxId: dbVm.proxmoxId,
          labId: dbVm.labId,
          labName: dbVm.lab?.name || "Unassigned",
          name: dbVm.hostname,
          os: "NixOS",
          ip, // The dynamically fetched IP!
          status,
          owner: "Admin",
          cpu,
          ram,
          storage,
          createdAt: dbVm.createdAt.toISOString(),
        };
      }),
    );

    return NextResponse.json({ labs: dbLabs, instances });
  } catch (error: any) {
    console.error("Instances Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch instances" },
      { status: 500 },
    );
  }
}
