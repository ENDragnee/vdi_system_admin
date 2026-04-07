// src/app/actions/vm-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { pveFetch, waitForTask } from "@/lib/proxmox";
import {
  checkPermission,
  checkAnyPermission,
  getActionSession,
} from "@/lib/auth";
import { revalidatePath } from "next/cache";

const TEMPLATE_ID = 100;
const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

export async function CreateVmAction(
  proxmoxId: number,
  name: string,
  hostname: string,
  labId: string,
) {
  const hasPermission = await checkPermission("vm.create");
  if (!hasPermission) throw new Error("Unauthorized");
  const user = await getActionSession();

  try {
    const vmid = parseInt(String(proxmoxId), 10);
    const templateId = parseInt(String(TEMPLATE_ID), 10);

    // 1. Proxmox Clone
    const cloneResponse = await pveFetch(
      `/nodes/${PROXMOX_NODE}/qemu/${templateId}/clone`,
      "POST",
      { newid: vmid, name: name, full: 0 },
    );
    await waitForTask(PROXMOX_NODE, cloneResponse.data);

    // 2. Proxmox Config
    await pveFetch(`/nodes/${PROXMOX_NODE}/qemu/${vmid}/config`, "POST", {
      name: name,
      hostname: hostname,
    });

    // 3. Start
    await pveFetch(`/nodes/${PROXMOX_NODE}/qemu/${vmid}/status/start`, "POST");

    // 4. Database Write
    const newVm = await prisma.vM.create({
      data: { proxmoxId: vmid, hostname, labId },
      include: { lab: true },
    });

    // 5. System Log
    await prisma.log.create({
      data: {
        type: "VM_PROVISIONED",
        severity: "INFO",
        message: `Provisioned VM '${name}' (ID: ${vmid}).`,
        targetId: newVm.id,
        userId: user.id,
        labId,
      },
    });

    // 6. CREATE NOTIFICATION
    await prisma.notification.create({
      data: {
        title: "New VM Provisioned",
        message: `Instance ${hostname} was successfully created in ${newVm.lab.name}.`,
        type: "SUCCESS",
        labId: labId,
        link: "/admin/instances",
      },
    });
    const io = (global as any).io;
    if (io) {
      io.emit("new-notification", {
        title: "VM Provisioned",
        message: `Instance ${hostname} is ready for use.`,
        type: "SUCCESS",
      });
    }
    revalidatePath("/admin/instances");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function DeleteVmAction(vmId: string, proxmoxId: number) {
  const hasPermission = await checkPermission("vm.delete");
  if (!hasPermission) throw new Error("Unauthorized");
  const user = await getActionSession();

  try {
    // Fetch info before deletion for the notification
    const vm = await prisma.vM.findUnique({
      where: { id: vmId },
      include: { lab: true },
    });
    if (!vm) throw new Error("VM not found");

    // 1. Stop
    try {
      await pveFetch(
        `/nodes/${PROXMOX_NODE}/qemu/${proxmoxId}/status/stop`,
        "POST",
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (e) {
      /* ignore if already stopped */
    }

    // 2. Delete
    const deleteResponse = await pveFetch(
      `/nodes/${PROXMOX_NODE}/qemu/${proxmoxId}`,
      "DELETE",
    );
    if (deleteResponse.data)
      await waitForTask(PROXMOX_NODE, deleteResponse.data);

    // 3. DB Cleanup
    await prisma.vM.delete({ where: { id: vmId } });

    // 4. Notification
    await prisma.notification.create({
      data: {
        title: "VM Destroyed",
        message: `Instance ${vm.hostname} has been permanently deleted from ${vm.lab.name}.`,
        type: "WARNING",
        labId: vm.labId,
      },
    });
    const io = (global as any).io;
    if (io) {
      io.emit("new-notification", {
        title: "VM Destroyed",
        message: `Instance ${vm.hostname} has been permanently removed.`,
        type: "WARNING",
      });
    }
    revalidatePath("/admin/instances");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function StartVmAction(proxmoxId: number, vmId: string) {
  // THE FIX: Allow both Admin (vm.start) and Faculty (faculty.vm.control)
  const hasAccess = await checkAnyPermission([
    "vm.start",
    "faculty.vm.control",
  ]);
  if (!hasAccess) throw new Error("Unauthorized");

  try {
    await pveFetch(
      `/nodes/${PROXMOX_NODE}/qemu/${proxmoxId}/status/start`,
      "POST",
    );

    const vm = await prisma.vM.findUnique({ where: { id: vmId } });
    await prisma.notification.create({
      data: {
        title: "VM Started",
        message: `Instance ${vm?.hostname} is now powering up.`,
        type: "INFO",
        labId: vm?.labId,
      },
    });

    revalidatePath("/admin/instances");
    revalidatePath("/faculty/instances");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function StopVmAction(proxmoxId: number, vmId: string) {
  // THE FIX: Allow both Admin (vm.stop) and Faculty (faculty.vm.control)
  const hasAccess = await checkAnyPermission(["vm.stop", "faculty.vm.control"]);
  if (!hasAccess) throw new Error("Unauthorized");

  try {
    await pveFetch(
      `/nodes/${PROXMOX_NODE}/qemu/${proxmoxId}/status/stop`,
      "POST",
    );

    const vm = await prisma.vM.findUnique({ where: { id: vmId } });
    await prisma.notification.create({
      data: {
        title: "VM Stopped",
        message: `Instance ${vm?.hostname} has been powered off.`,
        type: "INFO",
        labId: vm?.labId,
      },
    });

    revalidatePath("/admin/instances");
    revalidatePath("/faculty/instances");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function MassVmAction(
  vms: { proxmoxId: number; id: string }[],
  action: "start" | "stop",
) {
  // THE FIX: Use a combined permission check
  const guard = action === "start" ? "vm.start" : "vm.stop";
  const hasAccess = await checkAnyPermission([guard, "faculty.vm.control"]);
  if (!hasAccess) throw new Error("Unauthorized");

  try {
    const promises = vms.map((vm) =>
      pveFetch(
        `/nodes/${PROXMOX_NODE}/qemu/${vm.proxmoxId}/status/${action}`,
        "POST",
      ),
    );
    await Promise.all(promises);

    if (vms.length > 0) {
      const firstVm = await prisma.vM.findUnique({ where: { id: vms[0].id } });
      await prisma.notification.create({
        data: {
          title: `Mass ${action === "start" ? "Power On" : "Shutdown"}`,
          message: `Successfully processed state change for ${vms.length} instances.`,
          type: "INFO",
          labId: firstVm?.labId,
        },
      });
    }

    revalidatePath("/admin/instances");
    revalidatePath("/faculty/instances");
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function GetVmConsoleAction(
  proxmoxId: number,
  type: "novnc" | "xtermjs" | "spice",
) {
  // THE FIX: Allow Admin (vm.view) or Faculty (faculty.vm.view)
  const hasAccess = await checkAnyPermission(["vm.view", "faculty.vm.view"]);
  if (!hasAccess) throw new Error("Unauthorized");

  const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";

  try {
    const isSpice = type === "spice";
    const endpoint = `/nodes/${PROXMOX_NODE}/qemu/${proxmoxId}/${isSpice ? "spiceproxy" : "vncproxy"}`;

    const res = await pveFetch(endpoint, "POST");
    const d = res?.data || res;

    if (isSpice) {
      // Normalize response (handles both {data:{}} and direct)
      const spiceData = res?.data?.data || res?.data || res;

      // 🔥 Correct validation (NO ticket)
      if (
        !spiceData ||
        !spiceData.password ||
        !spiceData["tls-port"] ||
        !spiceData.host
      ) {
        console.error("SPICE RAW RESPONSE:", JSON.stringify(res, null, 2));
        throw new Error("Invalid SPICE response");
      }

      return {
        success: true,
        type: "file",
        data: spiceData,
        filename: `console-${proxmoxId}.vv`,
      };
    }

    const baseUrl = process.env.PROXMOX_URL?.split("/api2")[0];
    const isXterm = type === "xtermjs";
    const params = new URLSearchParams({
      console: "kvm",
      vmid: String(proxmoxId),
      vmname: `vm${proxmoxId}`,
      node: PROXMOX_NODE,
    });

    if (isXterm) {
      params.append("xtermjs", "1");
      params.append("cmd", "");
    } else {
      params.append("novnc", "1");
    }

    return {
      success: true,
      type: "url",
      url: `${baseUrl}/?${params.toString()}`,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
