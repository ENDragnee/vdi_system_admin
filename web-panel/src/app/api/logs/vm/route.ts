import { NextRequest, NextResponse } from "next/server";
import { queryApi, bucket } from "@/lib/influx";
import { prisma } from "@/lib/prisma";
import { getActionSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

// Initialize child logger
const log = logger.child({ module: "vm-logs-api" });

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await getActionSession();
    const { searchParams } = new URL(req.url);

    log.info({ user: user.email }, "VM History logs request received");

    // 1. RESOLVE SECURITY SCOPE
    let targetLabId: string | null = null;

    if (user.role.includes("ADMIN")) {
      targetLabId = searchParams.get("labId") || null;
    } else if (user.role.includes("FACULTY")) {
      if (!user.labId) {
        log.warn(
          { user: user.email },
          "Unauthorized access: Faculty has no labId",
        );
        return NextResponse.json({ error: "No lab assigned" }, { status: 403 });
      }
      targetLabId = user.labId;
    }

    // 2. FETCH ALLOWED HOSTNAMES
    log.debug({ targetLabId }, "Fetching allowed hostnames from Postgres");
    const labVms = targetLabId
      ? await prisma.vM.findMany({
          where: { labId: targetLabId },
          select: { hostname: true },
        })
      : [];

    const allowedHosts = labVms.map((v) => v.hostname);

    // 3. PARSE FILTERS
    const hostnameFilter = searchParams.get("hostname") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const startDate = searchParams.get("startDate") || "-24h";
    const endDate = searchParams.get("endDate") || "now()";

    // 4. CONSTRUCT DYNAMIC HOST FILTER
    let hostFilter = "";
    if (targetLabId) {
      if (allowedHosts.length === 0) {
        hostFilter = `|> filter(fn: (r) => false)`;
      } else {
        const finalHosts = hostnameFilter
          ? allowedHosts.filter((h) => h === hostnameFilter)
          : allowedHosts;

        if (finalHosts.length === 0) {
          hostFilter = `|> filter(fn: (r) => false)`;
        } else {
          hostFilter = `|> filter(fn: (r) => ${finalHosts.map((h) => `r["host"] == "${h}"`).join(" or ")})`;
        }
      }
    } else if (hostnameFilter) {
      hostFilter = `|> filter(fn: (r) => r["host"] == "${hostnameFilter}")`;
    }

    // 5. BUILD FINAL FLUX QUERY
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: ${startDate}, stop: ${endDate})
        |> filter(fn: (r) => 
          (r["_measurement"] == "cpu" and r["cpu"] == "cpu-total") or 
          (r["_measurement"] == "mem") or 
          (r["_measurement"] == "system")
        )
        ${hostFilter}
        |> pivot(rowKey:["_time", "host"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: ${limit}, offset: ${skip})
    `;

    // Log the generated query at debug level for troubleshooting
    log.debug({ fluxQuery }, "Generated Flux Query for InfluxDB");

    const data: any[] = [];
    return new Promise((resolve) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          data.push({
            ...obj,
            cpuload: obj.usage_active ? obj.usage_active / 100 : 0,
            mem_used_percentage: obj.used_percent || 0,
            status: "running",
          });
        },
        error(err) {
          log.error(
            { err: err.message, query: fluxQuery },
            "InfluxDB execution error",
          );
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        },
        complete() {
          const duration = Date.now() - startTime;
          log.info(
            { duration, count: data.length, page },
            "Successfully fetched VM logs from InfluxDB",
          );
          resolve(
            NextResponse.json({
              data,
              meta: { page, limit, hasMore: data.length === limit },
            }),
          );
        },
      });
    });
  } catch (error: any) {
    log.error(
      { err: error.message, stack: error.stack },
      "Internal server error in VM logs API",
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
