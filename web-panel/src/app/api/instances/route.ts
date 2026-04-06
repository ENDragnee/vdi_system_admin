import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pveFetch, GetVmIp } from "@/lib/proxmox";
import { checkPermission } from "@/lib/auth";

const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

export async function GET(req: NextRequest) {
  if (!(await checkPermission("vm.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  // 1. Parse Query Parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const labId = searchParams.get("labId") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const skip = (page - 1) * limit;

  try {
    // 2. Build Prisma Filter
    const where: any = {
      AND: [
        labId ? { labId } : {},
        search
          ? {
              OR: [
                { hostname: { contains: search, mode: "insensitive" } },
                // Can add more searchable fields here
              ],
            }
          : {},
      ],
    };

    // 3. Fetch DB Data & Total Count
    const [dbVms, total] = await prisma.$transaction([
      prisma.vM.findMany({
        where,
        include: { lab: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.vM.count({ where }),
    ]);

    const dbLabs = await prisma.lab.findMany();

    // 4. Fetch Proxmox Live Data
    const pveResponse = await pveFetch(`/nodes/${PROXMOX_NODE}/qemu`);
    const pveVms = pveResponse.data || [];

    // 5. Merge Data Pivot on proxmoxId
    const instances = await Promise.all(
      dbVms.map(async (dbVm) => {
        const pveVm = pveVms.find((p: any) => p.vmid === dbVm.proxmoxId);

        let status = "offline";
        let cpu = 0,
          ram = 0,
          storage = 0;
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
          ip,
          status,
          owner: "Admin",
          cpu,
          ram,
          storage,
          createdAt: dbVm.createdAt.toISOString(),
        };
      }),
    );

    return NextResponse.json({
      labs: dbLabs,
      instances,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch instances" },
      { status: 500 },
    );
  }
}
