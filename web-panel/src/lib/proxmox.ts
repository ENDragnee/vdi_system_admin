// src/lib/proxmox.ts
import axios from "axios";
import https from "https";

const PROXMOX_API = process.env.PROXMOX_URL || "";
const TOKEN = process.env.PROXMOX_API_TOKEN || "";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function pveFetch(endpoint: string, method = "GET", data?: any) {
  if (!PROXMOX_API || !TOKEN) {
    throw new Error("Missing Proxmox configuration in environment variables.");
  }

  // --- THE FIX ---
  // 1. POST and PUT require a body. If none is provided, send {} to avoid char 0 errors.
  // 2. DELETE and GET must not have any body content.
  let payload = data;
  if (method === "POST" || method === "PUT") {
    payload = data === undefined ? {} : data;
  } else if (method === "DELETE" || method === "GET") {
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
      data: payload, // Axios will correctly omit body if this is undefined
      httpsAgent,
    });

    return response.data;
  } catch (error: any) {
    let errorMsg = error.message;
    if (error.response?.data) {
      errorMsg =
        typeof error.response.data === "string"
          ? error.response.data
          : JSON.stringify(error.response.data);
    }
    throw new Error(errorMsg);
  }
}

export async function getNextVmId() {
  const clusterResources = await pveFetch("/cluster/resources");

  if (!clusterResources.data) return 101;

  const ids = clusterResources.data
    .filter((r: any) => r.type === "qemu")
    .map((r: any) => r.vmid);

  return ids.length > 0 ? Math.max(...ids) + 1 : 101;
}

export async function waitForTask(node: string, upid: string) {
  while (true) {
    const res = await pveFetch(`/nodes/${node}/tasks/${upid}/status`);
    if (res.data.status === "stopped") {
      if (res.data.exitstatus === "OK") {
        return;
      }
      throw new Error(`Task failed: ${res.data.exitstatus}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

export async function GetVmIp(node: string, vmid: number): Promise<string> {
  try {
    // Query the QEMU guest agent for network interfaces
    const res = await pveFetch(
      `/nodes/${node}/qemu/${vmid}/agent/network-get-interfaces`,
    );
    const interfaces = res.data?.result || [];

    // Loop through interfaces to find a valid IPv4 address
    for (const iface of interfaces) {
      // Skip the loopback (localhost) interface
      if (iface.name === "lo") continue;

      const ipAddrs = iface["ip-addresses"] || [];
      for (const ip of ipAddrs) {
        // Return the first valid IPv4 address
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
    // If the VM just started, the guest agent takes ~10 seconds to boot.
    // Proxmox throws an error if we query it before it's ready.
    return "Waiting for Agent...";
  }
}
