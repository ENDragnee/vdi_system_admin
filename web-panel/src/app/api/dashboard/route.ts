// @/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pveFetch } from "@/lib/proxmox";
import { queryApi, bucket } from "@/lib/influx";
import { getActionSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getActionSession();
    const { searchParams } = new URL(req.url);

    // 1. RESOLVE SCOPE
    let targetLabId: string | null = null;

    // Admin can see everything (null) or filter by a specific labId from query
    if (user.role.includes("ADMIN")) {
      targetLabId = searchParams.get("labId") || null;
    }
    // Faculty is STRICTLY locked to their own labId
    else if (user.role.includes("FACULTY")) {
      if (!user.labId) {
        return NextResponse.json(
          { error: "No lab assigned to this faculty account" },
          { status: 403 },
        );
      }
      targetLabId = user.labId;
    }

    // 2. FETCH VM REFERENCE DATA
    // We get the hostnames and proxmoxIds for the filtered scope
    const labVms = await prisma.vM.findMany({
      where: targetLabId ? { labId: targetLabId } : {},
      select: { proxmoxId: true, hostname: true },
    });

    const hostnames = labVms.map((v) => v.hostname);

    // 3. CONCURRENT DATABASE FETCH
    const [vmCount, facultyCount, totalLabs, recentLogs, labInfo] =
      await Promise.all([
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

    // 4. PROXMOX DATA (Filtered by the current scope)
    const pveRes = await pveFetch("/cluster/resources");

    // Filter PVE resources: only QEMU VMs that exist in our database scope and are NOT templates
    const filteredPveVms = pveRes.data.filter(
      (r: any) =>
        r.type === "qemu" &&
        r.template !== 1 &&
        (targetLabId ? labVms.some((v) => v.proxmoxId === r.vmid) : true),
    );

    // Calculate Storage (Always show cluster-wide totals for Admin)
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

    // 5. INFLUXDB ANALYTICS (Filtered by the current scope's hostnames)
    // If we have no hostnames (empty lab), we return an empty chart instead of crashing
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
        error: () => res(false),
      });
    });

    // 6. RESPONSE
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
          value: filteredPveVms.length - activeCount,
          color: "#ef4444",
        },
      ],
      recentActivity: recentLogs,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
