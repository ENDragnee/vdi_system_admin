import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pveFetch, GetVmIp } from "@/lib/proxmox";
import { getActionSession } from "@/lib/auth";

const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

export async function GET(req: NextRequest) {
  try {
    const user = await getActionSession();
    const { searchParams } = new URL(req.url);

    // 1. RESOLVE TARGET LAB ID
    let targetLabId: string | null = null;

    // PRIORITY 1: If user is an ADMIN, they see everything by default.
    // They can optionally filter by a labId provided in the URL.
    if (user.role.includes("ADMIN")) {
      targetLabId = searchParams.get("labId") || null;
    }
    // PRIORITY 2: If user is ONLY a FACULTY, force their session's labId.
    else if (user.role.includes("FACULTY")) {
      if (!user.labId) {
        return NextResponse.json(
          { error: "Forbidden: No lab assigned to this faculty account" },
          { status: 403 },
        );
      }
      targetLabId = user.labId;
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // 2. BUILD PRISMA FILTER
    // We only add the labId filter if targetLabId is not null.
    const where: any = {
      AND: [
        targetLabId ? { labId: targetLabId } : {},
        search ? { hostname: { contains: search, mode: "insensitive" } } : {},
      ],
    };

    // 3. FETCH DATABASE DATA
    const [dbVms, total] = await prisma.$transaction([
      prisma.vM.findMany({
        where,
        include: { lab: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vM.count({ where }),
    ]);

    // 4. FETCH LIVE DATA FROM PROXMOX
    const pveResponse = await pveFetch("/cluster/resources");
    const pveVms = pveResponse.data.filter((r: any) => r.type === "qemu");

    // 5. MERGE DATA & RESOLVE IPs
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
          cpu,
          ram,
          createdAt: dbVm.createdAt.toISOString(),
        };
      }),
    );

    return NextResponse.json({
      instances,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Instances API Error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
