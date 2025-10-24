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

    // 1. Discover hosts
    hosts = from(bucket: "${bucket}")
      |> range(start: -24h)
      |> keep(columns: ["host"])
      |> distinct(column: "host")
      |> findColumn(fn: (key) => true, column: "_value")

    // 2a. Fetch STRING metadata
    meta_strings = from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "system_meta" and (r._field == "os_type" or r._field == "ip_address"))
      |> filter(fn: (r) => contains(value: r.host, set: hosts))
      |> group(columns: ["host", "_field"])
      |> last()
      |> keep(columns: ["_time", "host", "_field", "_value"])

    // 2b. Fetch NUMERIC metadata
    meta_numerics = from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) =>
          (r._measurement == "system" and r._field == "n_cpus") or
          (r._measurement == "mem" and r._field == "total") or
          (r._measurement == "disk" and r._field == "total")
      )
      |> filter(fn: (r) => contains(value: r.host, set: hosts))
      |> group(columns: ["host", "_measurement", "_field"])
      |> last()
      |> map(fn: (r) => ({
          _time: r._time,
          host: r.host,
          _field:
              if r._measurement == "mem" and r._field == "total" then "ram_total"
              else if r._measurement == "disk" and r._field == "total" then "storage_total"
              else r._field,
          _value: float(v: r._value)
      }))

    // 2c. Union metadata streams
    meta_data = union(tables: [meta_strings, meta_numerics])

    // 3. Fetch live metrics
    live_data = from(bucket: "${bucket}")
      |> range(start: -5m)
      |> filter(fn: (r) =>
          (r._measurement == "cpu" and r._field == "usage_idle" and r.cpu == "cpu-total") or
          (r._measurement == "mem" and r._field == "used") or
          (r._measurement == "disk" and r._field == "used" and r.path == "/")
      )
      |> filter(fn: (r) => contains(value: r.host, set: hosts))
      |> group(columns: ["host", "_measurement", "_field", "path", "cpu"])
      |> last()
      |> map(fn: (r) => ({
          _time: r._time,
          host: r.host,
          _field:
              if r._measurement == "cpu" then "cpu_usage"
              else if r._measurement == "mem" then "ram_used"
              else "storage_used",
          _value:
              if r._measurement == "cpu" then 100.0 - float(v: r._value)
              else float(v: r._value)
      }))

    // 4. Calculate network rates - UPDATED LOGIC
    net_data = from(bucket: "${bucket}")
      |> range(start: -2m)
      |> filter(fn: (r) => r._measurement == "net" and (r._field == "bytes_recv" or r._field == "bytes_sent"))
      |> filter(fn: (r) => contains(value: r.host, set: hosts))
      |> filter(fn: (r) => r.interface != "lo") // Exclude loopback interface
      |> group(columns: ["host", "_field", "_time"])
      |> sum(column: "_value") // Sum bytes from all interfaces at each timestamp
      |> group(columns: ["host", "_field"]) // Ungroup to calculate derivative across time
      |> derivative(unit: 1s, nonNegative: true) // Calculate rate on the summed series
      |> last()
      |> map(fn: (r) => ({
          _time: r._time,
          host: r.host,
          _field: if r._field == "bytes_recv" then "network_in" else "network_out",
          _value: r._value
      }))

    // 5. Combine all data streams
    allData = union(tables: [meta_data, live_data, net_data])
      |> group(columns: ["host", "_field"])
      |> last()
      |> pivot(rowKey: ["host"], columnKey: ["_field"], valueColumn: "_value")

    // 6. Final mapping
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
          created_at: if exists r._time then string(v: r._time) else ""
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
