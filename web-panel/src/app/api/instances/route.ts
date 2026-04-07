import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pveFetch, GetVmIp } from "@/lib/proxmox";
import { getActionSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

// Initialize scoped logger
const log = logger.child({ module: "instance-api" });

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await getActionSession();
    const { searchParams } = new URL(req.url);

    log.info(
      { user: user.email, roles: user.role },
      "Instance fetch request initiated",
    );

    // 1. RESOLVE TARGET LAB ID
    let targetLabId: string | null = null;

    if (user.role.includes("ADMIN")) {
      targetLabId = searchParams.get("labId") || null;
      if (targetLabId)
        log.debug({ targetLabId }, "Admin filtering by specific lab");
    } else if (user.role.includes("FACULTY")) {
      if (!user.labId) {
        log.warn(
          { user: user.email },
          "Faculty access denied: No labId in session",
        );
        return NextResponse.json(
          { error: "Forbidden: No lab assigned to this faculty account" },
          { status: 403 },
        );
      }
      targetLabId = user.labId;
    }

    // 2. PARSE PAGINATION
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // 3. FETCH DATABASE DATA
    const where: any = {
      AND: [
        targetLabId ? { labId: targetLabId } : {},
        search ? { hostname: { contains: search, mode: "insensitive" } } : {},
      ],
    };

    log.debug({ page, limit, search }, "Querying Postgres for VM records");
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
    log.debug("Requesting live cluster resources from Proxmox");
    const pveResponse = await pveFetch("/cluster/resources");
    const pveVms = pveResponse.data.filter((r: any) => r.type === "qemu");

    // 5. MERGE DATA & RESOLVE IPs
    log.debug(
      { count: dbVms.length },
      "Merging DB records with live Proxmox metrics",
    );
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
            // We use debug here because this can be slow if many VMs are starting
            log.trace({ vmid: dbVm.proxmoxId }, "Resolving IP via Guest Agent");
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

    const duration = Date.now() - startTime;
    log.info(
      { duration, resultCount: instances.length, totalCount: total },
      "Instance fetch completed successfully",
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
    log.error(
      {
        err: error.message,
        stack: error.stack,
        context: "Instance API Failure",
      },
      "Failed to process instances GET request",
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
