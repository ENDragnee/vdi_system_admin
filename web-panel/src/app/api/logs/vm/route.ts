import { NextRequest, NextResponse } from "next/server";
import { queryApi, bucket } from "@/lib/influx";
import { checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await checkPermission("vm.logs.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const hostname = searchParams.get("hostname") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const sortBy = searchParams.get("sortBy") || "_time";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "false" : "true";
  const startDate = searchParams.get("startDate") || "-24h";
  const endDate = searchParams.get("endDate") || "now()";

  const skip = (page - 1) * limit;

  // Optimized Flux Query for standard Telegraf data
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${startDate}, stop: ${endDate})
      |> filter(fn: (r) => 
        (r["_measurement"] == "cpu" and r["cpu"] == "cpu-total") or 
        (r["_measurement"] == "mem") or 
        (r["_measurement"] == "net") or
        (r["_measurement"] == "system")
      )
      ${hostname ? `|> filter(fn: (r) => r["host"] == "${hostname}")` : ""}
      |> pivot(rowKey:["_time", "host"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["${sortBy}"], desc: ${sortOrder})
      |> limit(n: ${limit}, offset: ${skip})
  `;

  try {
    const data: any[] = [];
    return new Promise((resolve) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const obj = tableMeta.toObject(row);
          data.push({
            ...obj,
            cpuload: obj.usage_active ? obj.usage_active / 100 : 0,
            mem_used_percentage: obj.used_percent || 0,
            disk_used_percentage: obj.used_percent || 0,
            status: "running",
          });
        },
        error(err) {
          console.error("Influx Error:", err);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        },
        complete() {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
