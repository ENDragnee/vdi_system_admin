import { NextRequest, NextResponse } from "next/server";
import { queryApi, bucket } from "@/lib/influx"; // Assuming your influx client is in lib/influx.ts

// This is crucial for a monitoring API. It prevents Next.js from caching the response
// and ensures that every request fetches fresh data from InfluxDB.
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const hostId = params.id;

  if (!hostId) {
    return new NextResponse("Instance ID (hostname) is required", {
      status: 400,
    });
  }

  // This comprehensive Flux query performs several steps to gather all necessary data
  // for a single host and combines it into one result table.
  const fluxQuery = `
    import "influxdata/influxdb/schema"
    import "strings"

    // Define the target host based on the URL parameter
    targetHost = "${hostId}"

    // STEP 1: Get the last known metadata for the host.
    // We look back up to 30 days because this data is written infrequently.
    meta = from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r.host == targetHost)
      |> filter(fn: (r) => r._measurement == "system_meta" or r._measurement == "system" or r._measurement == "mem" or r._measurement == "disk")
      |> filter(fn: (r) => r._field == "os_type" or r._field == "ip_address" or r._field == "n_cpus" or r._field == "total")
      |> last() // Get the most recent value for each piece of metadata
      |> pivot(rowKey:["host"], columnKey: ["_field"], valueColumn: "_value")
      // After pivoting, fields with the same name (like 'total' for mem and disk) get renamed.
      // We give them clearer names for the final mapping.
      |> rename(columns: { total: "ram_total", total_1: "storage_total" })

    // STEP 2: Get the latest live metrics for the host.
    // We only look in the last 5 minutes to ensure the data is fresh.
    live = from(bucket: "${bucket}")
      |> range(start: -5m)
      |> filter(fn: (r) => r.host == targetHost)
      |> filter(fn: (r) =>
          (r._measurement == "cpu" and r._field == "usage_active" and r.cpu == "cpu-total") or
          (r._measurement == "mem" and r._field == "used") or
          (r._measurement == "disk" and r._field == "used" and r.path == "/")
      )
      |> last()
      |> pivot(rowKey:["host"], columnKey: ["_field"], valueColumn: "_value")
      // Rename collided 'used' fields for clarity.
      |> rename(columns: { used: "ram_used", used_1: "storage_used" })

    // STEP 3: Calculate the current network traffic rate.
    // This requires the derivative() function, which calculates the per-second rate of change.
    netRate = from(bucket: "${bucket}")
      |> range(start: -1m) // A 1-minute window is good for calculating a stable derivative
      |> filter(fn: (r) => r.host == targetHost and r._measurement == "net")
      |> filter(fn: (r) => r._field == "bytes_recv" or r._field == "bytes_sent")
      |> derivative(unit: 1s, nonNegative: true) // Calculate rate in bytes per second
      |> last()
      |> pivot(rowKey:["host"], columnKey: ["_field"], valueColumn: "_value")
      // Rename for the final output object.
      |> rename(columns: { bytes_recv: "network_in", bytes_sent: "network_out" })

    // STEP 4: Join all the data streams together.
    // We join the metadata table with the live metrics table, and then join that result
    // with the network rate table, all matched on the 'host' column.
    join(tables: {meta: meta, live: live}, on: ["host"])
      |> join(tables: {key1: _, key2: netRate}, on: ["host"])
      // STEP 5: Map the final joined table to the exact JSON structure the frontend expects.
      |> map(fn: (r) => ({
        id: r.host,
        name: r.host, // Using hostname as the primary name
        status: "online", // If we found data, we consider it online
        os_type: r.os_type,
        ip_address: r.ip_address,
        cpu_cores: r.n_cpus,
        cpu_usage: r.usage_active,
        ram_total: r.ram_total / 1024 / 1024, // Convert Bytes to Megabytes
        ram_used: r.ram_used / 1024 / 1024, // Convert Bytes to Megabytes
        storage_total: r.storage_total / 1024 / 1024 / 1024, // Convert Bytes to Gigabytes
        storage_used: r.storage_used / 1024 / 1024 / 1024, // Convert Bytes to Gigabytes
        network_in: r.network_in / 1024 / 1024, // Convert Bytes/s to Megabytes/s
        network_out: r.network_out / 1024 / 1024, // Convert Bytes/s to Megabytes/s
        created_at: string(v: r._time_meta) // Using the timestamp of the metadata as a proxy for creation time
      }))
  `;

  try {
    const data = await queryApi.collectRows(fluxQuery);

    // If the query returns no rows, it means the host ID doesn't exist
    // or hasn't reported data in the specified time ranges.
    if (data.length === 0) {
      return new NextResponse(`Instance with ID '${hostId}' not found`, {
        status: 404,
      });
    }

    // The query is designed to return a single row with all data combined.
    const instance = data[0] as any;

    // It's possible for network data to be missing if there's no traffic.
    // We provide default values to prevent frontend errors.
    instance.network_in = instance.network_in || 0;
    instance.network_out = instance.network_out || 0;

    // Add a 'last_updated' timestamp to show how fresh the data is.
    instance.last_updated = new Date().toISOString();

    return NextResponse.json(instance);
  } catch (error) {
    // Log the detailed error on the server for debugging purposes.
    console.error(
      `[API ERROR] Failed to query InfluxDB for instance '${hostId}':`,
      error,
    );

    // Return a generic error message to the client.
    return new NextResponse(
      "An error occurred while communicating with the database.",
      { status: 500 },
    );
  }
}
