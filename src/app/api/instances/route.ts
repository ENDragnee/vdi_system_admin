// File: app/api/instances/route.ts

import { NextResponse } from "next/server";
import { queryApi, bucket } from "@/lib/influx";

export const dynamic = "force-dynamic";

interface InfluxRow {
  id: string;
  name: string;
  status: "online" | "offline";
  os_type: string;
  ip_address: string;
  cpu_cores: number;
  cpu_usage: number;
  ram_total: number;
  ram_used: number;
  storage_total: number;
  storage_used: number;
  network_in: number;
  network_out: number;
  created_at: string;
}

export async function GET() {
  const fluxQuery = `
    import "influxdata/influxdb/schema"
    import "strings"
    import "join"

    // 1. Discover all hosts (use a wider range to capture all hosts ever seen)
    hosts = from(bucket: "${bucket}")
      |> range(start: -30d) // Increased range to ensure all hosts are captured
      |> filter(fn: (r) => exists r.host) // Ensure host tag exists
      |> keep(columns: ["host"])
      |> group() // Group to get all unique hosts
      |> distinct(column: "host")
      |> keep(columns: ["_value"])
      |> rename(columns: {_value: "host"}) // Prepare for filtering

    // 2a. Fetch STRING metadata
    meta_strings = from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "system_meta" and (r._field == "os_type" or r._field == "ip_address"))
      |> filter(fn: (r) => exists r.host)
      |> group(columns: ["host", "_field"])
      |> last()
      |> keep(columns: ["host", "_field", "_value"])

    // 2b. Fetch NUMERIC metadata
    meta_numerics = from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) =>
          (r._measurement == "system" and r._field == "n_cpus") or
          (r._measurement == "mem" and r._field == "total") or
          (r._measurement == "disk" and r._field == "total")
      )
      |> filter(fn: (r) => exists r.host)
      |> group(columns: ["host", "_measurement", "_field"])
      |> last()
      |> map(fn: (r) => ({
          host: r.host,
          _field:
              if r._measurement == "mem" and r._field == "total" then "ram_total"
              else if r._measurement == "disk" and r._field == "total" then "storage_total"
              else r._field,
          _value: float(v: r._value)
      }))

    // 3. Fetch live metrics
    live_data = from(bucket: "${bucket}")
      |> range(start: -5m)
      |> filter(fn: (r) =>
          (r._measurement == "cpu" and r._field == "usage_idle" and r.cpu == "cpu-total") or
          (r._measurement == "mem" and r._field == "used") or
          (r._measurement == "disk" and r._field == "used" and r.path == "/")
      )
      |> filter(fn: (r) => exists r.host)
      |> group(columns: ["host", "_measurement", "_field", "path", "cpu"])
      |> last()
      |> map(fn: (r) => ({
          host: r.host,
          _field:
              if r._measurement == "cpu" then "cpu_usage"
              else if r._measurement == "mem" then "ram_used"
              else "storage_used",
          _value:
              if r._measurement == "cpu" then 100.0 - float(v: r._value)
              else float(v: r._value)
      }))

    // 4. Calculate network rates
    net_data = from(bucket: "${bucket}")
      |> range(start: -2m)
      |> filter(fn: (r) => r._measurement == "net" and (r._field == "bytes_recv" or r._field == "bytes_sent"))
      |> filter(fn: (r) => exists r.host)
      |> filter(fn: (r) => r.interface != "lo")
      |> group(columns: ["host", "_field", "_time"])
      |> sum(column: "_value")
      |> group(columns: ["host", "_field"])
      |> derivative(unit: 1s, nonNegative: true)
      |> last()
      |> map(fn: (r) => ({
          host: r.host,
          _field: if r._field == "bytes_recv" then "network_in" else "network_out",
          _value: r._value
      }))

    // 5. Combine and pivot all metric data
    pivoted_data = union(tables: [meta_strings, meta_numerics, live_data, net_data])
      |> pivot(rowKey: ["host"], columnKey: ["_field"], valueColumn: "_value")

    // 6. Get creation time for each host
    creation_times = from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "system_meta" and r._field == "os_type")
      |> filter(fn: (r) => exists r.host)
      |> group(columns: ["host"])
      |> first()
      |> map(fn: (r) => ({ host: r.host, created_at_str: string(v: r._time) }))
      |> keep(columns: ["host", "created_at_str"])

    // 7. Join the creation time onto the main pivoted data
    allData = join.left(
        left: pivoted_data,
        right: creation_times,
        on: (l, r) => l.host == r.host,
        as: (l, r) => ({ l with created_at: r.created_at_str })
    )

    // 8. Final mapping
    allData
      |> map(fn: (r) => {
        ram_total_bytes = if exists r.ram_total then float(v: r.ram_total) else 0.0
        storage_total_bytes = if exists r.storage_total then float(v: r.storage_total) else 0.0
        ram_used_bytes = if exists r.ram_used then float(v: r.ram_used) else (if ram_total_bytes > 0.0 then ram_total_bytes * 0.5 else 0.0)
        storage_used_bytes = if exists r.storage_used then float(v: r.storage_used) else 0.0

        return {
          id: r.host,
          name: r.host,
          status: if exists r.cpu_usage or exists r.ram_used or exists r.storage_used or exists r.network_in or exists r.network_out then "online" else "offline",
          os_type: if exists r.os_type then string(v: r.os_type) else "unknown",
          ip_address: if exists r.ip_address then string(v: r.ip_address) else "unknown",
          cpu_cores: if exists r.n_cpus then float(v: r.n_cpus) else 0.0,
          cpu_usage: if exists r.cpu_usage then float(v: r.cpu_usage) else 0.0,
          ram_total: ram_total_bytes / 1024.0 / 1024.0,
          ram_used: ram_used_bytes / 1024.0 / 1024.0,
          storage_total: storage_total_bytes / 1024.0 / 1024.0 / 1024.0,
          storage_used: storage_used_bytes / 1024.0 / 1024.0 / 1024.0,
          network_in: if exists r.network_in then float(v: r.network_in) / 1024.0 / 1024.0 else 0.0,
          network_out: if exists r.network_out then float(v: r.network_out) / 1024.0 / 1024.0 else 0.0,
          created_at: if exists r.created_at then r.created_at else ""
        }
    })
  `;

  try {
    const data = await queryApi.collectRows<InfluxRow>(fluxQuery);
    return NextResponse.json(data);
  } catch (error) {
    console.error("InfluxDB query failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(
      JSON.stringify({
        message: "Error querying InfluxDB",
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
