import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pveFetch } from "@/lib/proxmox";
import { queryApi, bucket } from "@/lib/influx";
import { checkPermission } from "@/lib/auth";

export async function GET() {
  if (!(await checkPermission("dashboard.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 1. POSTGRES DATA
    const [totalInstances, facultyCount, totalLabs, recentLogs] =
      await prisma.$transaction([
        prisma.vM.count(),
        prisma.user.count({
          where: { roleUsers: { some: { roles: { guardName: "FACULTY" } } } },
        }),
        prisma.lab.count(),
        prisma.log.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        }),
      ]);

    // 2. PROXMOX DATA (Correct: Use PVE API for hardware totals/counts)
    const pveResources = await pveFetch("/cluster/resources");
    const pveVms = pveResources.data.filter(
      (r: any) => r.type === "qemu" && r.template !== 1,
    );
    const storageRes = pveResources.data.filter(
      (r: any) => r.type === "storage",
    );
    const usedStorage = storageRes.reduce(
      (acc: number, s: any) => acc + (s.used || 0),
      0,
    );
    const totalStorage = storageRes.reduce(
      (acc: number, s: any) => acc + (s.maxdisk || 0),
      0,
    );
    const activeInstances = pveVms.filter(
      (v: any) => v.status === "running",
    ).length;

    const instanceDistribution = [
      { name: "Online", value: activeInstances, color: "#10b981" },
      {
        name: "Offline",
        value: pveVms.filter((v: any) => v.status === "stopped").length,
        color: "#ef4444",
      },
      {
        name: "Other",
        value:
          pveVms.length -
          activeInstances -
          pveVms.filter((v: any) => v.status === "stopped").length,
        color: "#f59e0b",
      },
    ];

    // 3. INFLUXDB DATA (Using Linux measurement names: cpu, mem)
    const cpuTrendQuery = `
      from(bucket: "${bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r["_measurement"] == "cpu" and r["_field"] == "usage_active" and r["cpu"] == "cpu-total")
        |> aggregateWindow(every: 2h, fn: mean)
    `;

    const weeklyUtilQuery = `
      from(bucket: "${bucket}")
        |> range(start: -7d)
        |> filter(fn: (r) => (r["_measurement"] == "mem" and r["_field"] == "used_percent") or (r["_measurement"] == "disk" and r["_field"] == "used_percent"))
        |> aggregateWindow(every: 1d, fn: mean)
        |> pivot(rowKey:["_time"], columnKey: ["_measurement"], valueColumn: "_value")
    `;

    const cpuTrend: any[] = [];
    const weeklyUtil: any[] = [];

    await Promise.all([
      new Promise((res) => {
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
      }),
      new Promise((res) => {
        queryApi.queryRows(weeklyUtilQuery, {
          next: (row, meta) => {
            const obj = meta.toObject(row);
            weeklyUtil.push({
              day: new Date(obj._time).toLocaleDateString("en-US", {
                weekday: "short",
              }),
              ram: Math.round(obj.mem || 0),
              storage: Math.round(obj.disk || 0),
            });
          },
          complete: () => res(true),
          error: () => res(false),
        });
      }),
    ]);

    return NextResponse.json({
      stats: {
        instances: { active: activeInstances, total: pveVms.length },
        faculties: facultyCount,
        labs: totalLabs,
        storage: { used: usedStorage, total: totalStorage },
      },
      cpuTrend,
      instanceDistribution,
      weeklyUtil,
      recentActivity: recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
