// src/lib/proxmox.ts
import axios from "axios";
import https from "https";

const PROXMOX_API = process.env.PROXMOX_URL || "";
const TOKEN = process.env.PROXMOX_API_TOKEN || "";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

/**
 * Executes a network request to the Proxmox Virtual Environment (PVE) API.
 * Uses the pre-configured auth tokens and insecure SSL settings for local intranets.
 * 
 * @param endpoint - The target Proxmox API route (e.g., '/nodes/pve/qemu/101/status/start')
 * @param method - The HTTP method to run: 'GET' | 'POST' | 'PUT' | 'DELETE' (defaults to 'GET')
 * @param data - The optional request body to pass along with POST/PUT operations.
 * @returns The deserialized JSON response data structure from the Proxmox API.
 * @throws An error on configuration absence or PVE API server failure.
 */
export async function pveFetch<T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: unknown
): Promise<T> {
  if (!PROXMOX_API || !TOKEN) {
    throw new Error("Missing Proxmox configuration in environment variables.");
  }

  let payload = data;

  // Standardize the request payload context to ensure POST/PUT always have valid objects
  if (method === "POST" || method === "PUT") {
    payload = data === undefined ? {} : data;
  } else {
    payload = undefined;
  }

  try {
    const response = await axios({
      url: `${PROXMOX_API}${endpoint}`,
      method,
      headers: {
        Authorization: `PVEAPIToken=${TOKEN}`,
        "Content-Type": "application/json",
      },
      data: payload,
      httpsAgent,
    });

    // Return the response directly to standardise internal client consumption
    return response.data;
  } catch (error: any) {
    let errorMsg = error.message;

    // Handle deep nested error messages propagated from the Proxmox backend
    if (error.response?.data) {
      errorMsg =
        typeof error.response.data === "string"
          ? error.response.data
          : JSON.stringify(error.response.data);
    }

    throw new Error(`Proxmox API Error: ${errorMsg}`);
  }
}

/**
 * Scans the Proxmox cluster resources to identify existing virtual machines
 * and calculate the next available high VM ID (minimum 101).
 * 
 * @returns The next consecutive unused QEMU VM ID.
 */
export async function getNextVmId(): Promise<number> {
  const clusterResources = await pveFetch<any>("/cluster/resources");

  if (!clusterResources.data) return 101;

  // Filter out QEMU type instances and isolate their VM IDs
  const ids: number[] = clusterResources.data
    .filter((r: any) => r.type === "qemu")
    .map((r: any) => r.vmid);

  return ids.length > 0 ? Math.max(...ids) + 1 : 101;
}

/**
 * Periodically polls the Proxmox task queue to block execution until
 * an asynchronous process (like cloning, creation, or deletion) finishes.
 * 
 * @param node - The target Proxmox host node where the task is running.
 * @param upid - The unique Proxmox task process identifier (UPID).
 * @throws An error if the process exits with a status other than OK.
 */
export async function waitForTask(node: string, upid: string): Promise<void> {
  while (true) {
    const res = await pveFetch<any>(`/nodes/${node}/tasks/${upid}/status`);
    if (res.data.status === "stopped") {
      if (res.data.exitstatus === "OK") {
        return;
      }
      throw new Error(`Proxmox Task failed: ${res.data.exitstatus}`);
    }
    // Wait for 2 seconds before requesting status update again to avoid API rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

/**
 * Queries the QEMU Guest Agent inside a running VM to fetch its assigned IPv4 address.
 * 
 * @param node - The Proxmox cluster node where the VM is hosted.
 * @param vmid - The target virtual machine ID.
 * @returns A promise resolving to the assigned IP address, 'No IP Assigned', or 'Waiting for Agent...'.
 */
export async function GetVmIp(node: string, vmid: number): Promise<string> {
  try {
    // Query the QEMU guest agent for active network interfaces
    const res = await pveFetch<any>(
      `/nodes/${node}/qemu/${vmid}/agent/network-get-interfaces`,
    );
    const interfaces = res.data?.result || [];

    // Loop through interfaces to find a valid non-loopback IPv4 address
    for (const iface of interfaces) {
      if (iface.name === "lo") continue; // Ignore loopback interface

      const ipAddrs = iface["ip-addresses"] || [];
      for (const ip of ipAddrs) {
        // Return the first valid IPv4 address that is not loopback
        if (
          ip["ip-address-type"] === "ipv4" &&
          ip["ip-address"] !== "127.0.0.1"
        ) {
          return ip["ip-address"];
        }
      }
    }
    return "No IP Assigned";
  } catch (error) {
    // Guest agent takes ~10-15 seconds to boot after a VM starts.
    // PVE API returns a HTTP 500/agent error if queried before it's running.
    return "Waiting for Agent...";
  }
}
