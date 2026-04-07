// @/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pveFetch } from "@/lib/proxmox";
import { queryApi, bucket } from "@/lib/influx";
import { getActionSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

// Initialize child logger
const log = logger.child({ module: "dashboard-bff" });

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await getActionSession();
    const { searchParams } = new URL(req.url);

    log.info(
      { user: user.email, roles: user.role },
      "Dashboard metrics aggregation started",
    );

    // 1. RESOLVE SCOPE
    let targetLabId: string | null = null;

    if (user.role.includes("ADMIN")) {
      targetLabId = searchParams.get("labId") || null;
      if (targetLabId)
        log.debug({ targetLabId }, "Admin viewing scoped dashboard");
    } else if (user.role.includes("FACULTY")) {
      if (!user.labId) {
        log.warn(
          { user: user.email },
          "Faculty attempted dashboard access without labId",
        );
        return NextResponse.json(
          { error: "No lab assigned to this faculty account" },
          { status: 403 },
        );
      }
      targetLabId = user.labId;
    }

    // 2. FETCH REFERENCE DATA (Parallelized)
    log.debug("Fetching Postgres metadata and counts");
    const [labVms, vmCount, facultyCount, totalLabs, recentLogs, labInfo] =
      await Promise.all([
        prisma.vM.findMany({
          where: targetLabId ? { labId: targetLabId } : {},
          select: { proxmoxId: true, hostname: true },
        }),
        prisma.vM.count({ where: targetLabId ? { labId: targetLabId } : {} }),
        prisma.user.count({
          where: { roleUsers: { some: { roles: { guardName: "FACULTY" } } } },
        }),
        prisma.lab.count(),
        prisma.log.findMany({
          where: targetLabId ? { labId: targetLabId } : {},
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        }),
        targetLabId
          ? prisma.lab.findUnique({ where: { id: targetLabId } })
          : Promise.resolve(null),
      ]);

    const hostnames = labVms.map((v) => v.hostname);

    // 3. PROXMOX DATA
    log.debug("Requesting cluster resources from Proxmox");
    const pveRes = await pveFetch("/cluster/resources");

    const filteredPveVms = pveRes.data.filter(
      (r: any) =>
        r.type === "qemu" &&
        r.template !== 1 &&
        (targetLabId ? labVms.some((v) => v.proxmoxId === r.vmid) : true),
    );

    const storageRes = pveRes.data.filter((r: any) => r.type === "storage");
    const usedStorage = storageRes.reduce(
      (acc: number, s: any) => acc + (s.used || 0),
      0,
    );
    const totalStorage = storageRes.reduce(
      (acc: number, s: any) => acc + (s.maxdisk || 0),
      0,
    );
    const activeCount = filteredPveVms.filter(
      (v: any) => v.status === "running",
    ).length;

    log.debug(
      { active: activeCount, storageUsed: usedStorage },
      "Proxmox data resolved",
    );

    // 4. INFLUXDB ANALYTICS
    let hostFilter = "";
    if (targetLabId) {
      hostFilter =
        hostnames.length > 0
          ? `|> filter(fn: (r) => ${hostnames.map((h) => `r["host"] == "${h}"`).join(" or ")})`
          : `|> filter(fn: (r) => false)`;
    }

    const cpuTrendQuery = `
      from(bucket: "${bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r["_measurement"] == "cpu" and r["_field"] == "usage_active" and r["cpu"] == "cpu-total")
        ${hostFilter}
        |> aggregateWindow(every: 2h, fn: mean)
    `;

    log.trace({ cpuTrendQuery }, "Executing InfluxDB Flux query");

    const cpuTrend: any[] = [];
    await new Promise((res) => {
      queryApi.queryRows(cpuTrendQuery, {
        next: (row, meta) => {
          const obj = meta.toObject(row);
          cpuTrend.push({
            time: new Date(obj._time).getHours() + ":00",
            usage: Math.round(obj._value || 0),
          });
        },
        complete: () => res(true),
        error: (err) => {
          log.error(
            { err: err.message, query: cpuTrendQuery },
            "InfluxDB Query failed in Dashboard",
          );
          res(false);
        },
      });
    });

    const duration = Date.now() - startTime;
    log.info(
      { duration, lab: labInfo?.name || "Global" },
      "Dashboard aggregation complete",
    );

    // 5. RESPONSE
    return NextResponse.json({
      labName: labInfo?.name || "Global Infrastructure",
      stats: {
        instances: { active: activeCount, total: vmCount },
        storage: { used: usedStorage, total: totalStorage },
        faculties: facultyCount,
        labs: totalLabs,
      },
      cpuTrend,
      instanceDistribution: [
        { name: "Online", value: activeCount, color: "#10b981" },
        {
          name: "Offline",
          value: Math.max(0, filteredPveVms.length - activeCount),
          color: "#ef4444",
        },
      ],
      recentActivity: recentLogs,
    });
  } catch (error: any) {
    log.error(
      { err: error.message, stack: error.stack },
      "Internal failure in Dashboard BFF",
    );
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
