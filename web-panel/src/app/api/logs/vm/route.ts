import { NextRequest, NextResponse } from "next/server";
import { queryApi, bucket } from "@/lib/influx";
import { checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await checkPermission("vm.logs.view"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const hostname = searchParams.get("hostname") || ""; // This is the 'host' tag
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  // Flux Query optimized for your schema
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -24h)
      |> filter(fn: (r) => r["_measurement"] == "proxmox")
      ${hostname ? `|> filter(fn: (r) => r["host"] == "${hostname}")` : ""}
      |> drop(columns: ["status"]) 
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit}, offset: ${skip})
  `;

  try {
    const data: any[] = [];
    return new Promise((resolve) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          data.push(tableMeta.toObject(row));
        },
        error(err) {
          console.error("Influx Query Error:", err.message);
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        },
        complete() {
          resolve(
            NextResponse.json({
              data,
              meta: {
                page,
                limit,
                hasMore: data.length === limit,
              },
            }),
          );
        },
      });
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
