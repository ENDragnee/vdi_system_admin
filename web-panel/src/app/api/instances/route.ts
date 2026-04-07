// app/api/instances/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pveFetch, GetVmIp } from "@/lib/proxmox";
import { getActionSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";
const log = logger.child({ module: "instance-api" });

export async function GET(req: NextRequest) {
  try {
    const user = await getActionSession();
    const { searchParams } = new URL(req.url);

    // 1. RESOLVE TARGET LAB ID
    let targetLabId: string | null = null;
    if (user.role.includes("ADMIN")) {
      targetLabId = searchParams.get("labId") || null;
    } else if (user.role.includes("FACULTY")) {
      if (!user.labId)
        return NextResponse.json({ error: "No lab assigned" }, { status: 403 });
      targetLabId = user.labId;
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // 2. BUILD PRISMA FILTER
    const where: any = {
      AND: [
        // Only apply labId filter if it's not null and not "all"
        targetLabId && targetLabId !== "all" ? { labId: targetLabId } : {},
        search ? { hostname: { contains: search, mode: "insensitive" } } : {},
      ],
    };

    // 3. FETCH DATA & LABS LIST
    const [dbVms, total, allLabs] = await prisma.$transaction([
      prisma.vM.findMany({
        where,
        include: { lab: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vM.count({ where }),
      // FETCH ALL LABS so the dropdown isn't empty!
      prisma.lab.findMany({ select: { id: true, name: true } }),
    ]);

    const pveResponse = await pveFetch("/cluster/resources");
    const pveVms = pveResponse.data.filter((r: any) => r.type === "qemu");

    const instances = await Promise.all(
      dbVms.map(async (dbVm) => {
        const pveVm = pveVms.find((p: any) => p.vmid === dbVm.proxmoxId);
        let status = "offline",
          cpu = 0,
          ram = 0,
          ip = "Offline";

        if (pveVm) {
          status = pveVm.status === "running" ? "online" : "offline";
          cpu = Math.round((pveVm.cpu || 0) * 100);
          ram = pveVm.maxmem ? Math.round((pveVm.mem / pveVm.maxmem) * 100) : 0;
          if (status === "online")
            ip = await GetVmIp(PROXMOX_NODE, dbVm.proxmoxId);
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
          cpu,
          ram,
          createdAt: dbVm.createdAt.toISOString(),
        };
      }),
    );

    // 4. RETURN MERGED PAYLOAD
    return NextResponse.json({
      instances,
      labs: allLabs, // Critical: populated labs list
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    log.error({ err: error.message }, "Instances GET Failure");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
