// File: app/api/instances/[id]/metrics/route.ts

import { NextRequest, NextResponse } from "next/server";
import { queryApi, bucket } from "@/lib/influx";

export const dynamic = "force-dynamic";

interface MetricPoint {
  recorded_at: string;
  cpu_usage: number;
  ram_used: number;
  storage_used: number;
  network_in: number;
  network_out: number;
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const hostId = (await params).id;
  const timeRange = "-1h";
  const windowPeriod = "1m";

  if (!hostId) {
    return new NextResponse(
      JSON.stringify({ message: "Host ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const fluxQuery = `
    v_bucket = "${bucket}"
    v_host = "${hostId}"
    v_range = ${timeRange}
    v_window = ${windowPeriod}

    // 1. CPU Usage
    cpu = from(bucket: v_bucket)
      |> range(start: v_range)
      |> filter(fn: (r) => r._measurement == "cpu" and r.cpu == "cpu-total" and r._field == "usage_idle" and r.host == v_host)
      |> aggregateWindow(every: v_window, fn: mean, createEmpty: false)
      |> map(fn: (r) => ({ r with _value: 100.0 - r._value, _field: "cpu_usage" }))
      |> keep(columns: ["_time", "_field", "_value"])

    // 2. RAM Used
    ram = from(bucket: v_bucket)
      |> range(start: v_range)
      |> filter(fn: (r) => r._measurement == "mem" and r._field == "used" and r.host == v_host)
      |> aggregateWindow(every: v_window, fn: mean, createEmpty: false)
      |> map(fn: (r) => ({ r with _field: "ram_used" }))
      |> keep(columns: ["_time", "_field", "_value"])

    // 3. Storage Used
    storage = from(bucket: v_bucket)
      |> range(start: v_range)
      |> filter(fn: (r) => r._measurement == "disk" and r._field == "used" and r.path == "/" and r.host == v_host)
      |> aggregateWindow(every: v_window, fn: mean, createEmpty: false)
      |> map(fn: (r) => ({ r with _field: "storage_used" }))
      |> keep(columns: ["_time", "_field", "_value"])

    // 4. Network In Rate (Bytes/s) - UPDATED LOGIC
    net_in = from(bucket: v_bucket)
      |> range(start: v_range)
      |> filter(fn: (r) => r._measurement == "net" and r._field == "bytes_recv" and r.host == v_host)
      |> filter(fn: (r) => r.interface != "lo") // Exclude loopback
      |> group(columns: ["host", "_field", "_time"])
      |> sum(column: "_value") // Sum bytes across interfaces
      |> group(columns: ["host", "_field"])
      |> derivative(unit: 1s, nonNegative: true) // Calculate rate on the total
      |> aggregateWindow(every: v_window, fn: mean, createEmpty: false)
      |> map(fn: (r) => ({ r with _field: "network_in" }))
      |> keep(columns: ["_time", "_field", "_value"])

    // 5. Network Out Rate (Bytes/s) - UPDATED LOGIC
    net_out = from(bucket: v_bucket)
      |> range(start: v_range)
      |> filter(fn: (r) => r._measurement == "net" and r._field == "bytes_sent" and r.host == v_host)
      |> filter(fn: (r) => r.interface != "lo") // Exclude loopback
      |> group(columns: ["host", "_field", "_time"])
      |> sum(column: "_value") // Sum bytes across interfaces
      |> group(columns: ["host", "_field"])
      |> derivative(unit: 1s, nonNegative: true) // Calculate rate on the total
      |> aggregateWindow(every: v_window, fn: mean, createEmpty: false)
      |> map(fn: (r) => ({ r with _field: "network_out" }))
      |> keep(columns: ["_time", "_field", "_value"])

    // 6. Combine, pivot, and map to final structure
    union(tables: [cpu, ram, storage, net_in, net_out])
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"])
      |> map(fn: (r) => ({
          recorded_at: string(v: r._time),
          cpu_usage: if exists r.cpu_usage then r.cpu_usage else 0.0,
          ram_used: if exists r.ram_used then r.ram_used / 1024.0 / 1024.0 else 0.0,
          storage_used: if exists r.storage_used then r.storage_used / 1024.0 / 1024.0 / 1024.0 else 0.0,
          network_in: if exists r.network_in then r.network_in / 1024.0 / 1024.0 else 0.0,
          network_out: if exists r.network_out then r.network_out / 1024.0 / 1024.0 else 0.0
      }))
  `;

  try {
    const data = await queryApi.collectRows<MetricPoint>(fluxQuery);
    return NextResponse.json(data);
  } catch (error) {
    console.error("InfluxDB metrics query failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(
      JSON.stringify({
        message: "Error querying InfluxDB for metrics",
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
