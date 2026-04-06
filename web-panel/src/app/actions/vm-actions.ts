// src/app/actions/vm-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { pveFetch, getNextVmId, waitForTask } from "@/lib/proxmox";
import { checkPermission, getActionSession } from "@/lib/auth";

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
    // 1. Strictly enforce integers for Proxmox API
    const newId = parseInt(String(proxmoxId), 10);
    const templateId = parseInt(String(TEMPLATE_ID), 10);

    if (isNaN(newId) || newId < 100) {
      throw new Error("Invalid VM ID. It must be a number >= 100.");
    }

    // 2. Clone the VM
    const cloneResponse = await pveFetch(
      `/nodes/${PROXMOX_NODE}/qemu/${templateId}/clone`,
      "POST",
      {
        newid: newId,
        name: name,
        full: 0, // 0 = Linked Clone
      },
    );

    await waitForTask(PROXMOX_NODE, cloneResponse.data);

    // 3. Set Hostname
    await pveFetch(`/nodes/${PROXMOX_NODE}/qemu/${newId}/config`, "POST", {
      name: name,
    });

    // 4. Start VM
    await pveFetch(`/nodes/${PROXMOX_NODE}/qemu/${newId}/status/start`, "POST");

    // 5. Update Database
    const newVm = await prisma.vM.create({
      data: { proxmoxId: newId, hostname: hostname, labId: labId },
    });

    await prisma.log.create({
      data: {
        type: "VM_PROVISIONED",
        severity: "INFO",
        message: `Provisioned VM '${name}' (Hostname: ${hostname}, ID: ${newId}).`,
        targetId: newVm.id,
        targetName: hostname,
        userId: user.id,
        labId,
      },
    });

    return { success: true };
  } catch (error: any) {
    // If the ID already exists, Proxmox will throw an error that we safely catch here
    throw new Error(error.message);
  }
}

export async function DeleteVmAction(vmId: string, proxmoxId: number) {
  const hasPermission = await checkPermission("vm.delete");
  if (!hasPermission) throw new Error("Unauthorized");
  const user = await getActionSession();

  try {
    // 1. Attempt to stop the VM.
    // We wrap this in a specific try/catch so if the VM is ALREADY stopped,
    // it doesn't crash the whole delete action.
    try {
      await pveFetch(
        `/nodes/${PROXMOX_NODE}/qemu/${proxmoxId}/status/stop`,
        "POST",
      );
      // Wait for shutdown to complete
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (e) {
      console.log(
        `Stop command skipped for ${proxmoxId} (likely already stopped)`,
      );
    }

    // 2. Delete the VM (Now with no body content)
    const deleteResponse = await pveFetch(
      `/nodes/${PROXMOX_NODE}/qemu/${proxmoxId}`,
      "DELETE",
    );

    // 3. Wait for the background deletion task to finish
    // Proxmox returns the Task UPID in the .data field of the response
    if (deleteResponse.data) {
      await waitForTask(PROXMOX_NODE, deleteResponse.data);
    }

    // 4. Remove from Postgres
    const vm = await prisma.vM.delete({ where: { id: vmId } });

    // 5. Log the destruction
    await prisma.log.create({
      data: {
        type: "VM_DESTROYED",
        severity: "WARNING",
        message: `User '${user.email}' destroyed VM '${vm.hostname}' (PVE ID: ${proxmoxId}).`,
        targetId: vmId,
        targetName: vm.hostname,
        userId: user.id,
        labId: vm.labId,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("DeleteVmAction Error:", error.message);
    throw new Error(error.message);
  }
}

export async function StartVmAction(proxmoxId: number, vmId: string) {
  const hasPermission = await checkPermission("vm.start");
  if (!hasPermission) throw new Error("Unauthorized");

  try {
    await pveFetch(
      `/nodes/${PROXMOX_NODE}/qemu/${proxmoxId}/status/start`,
      "POST",
    );
    await prisma.log.create({
      data: {
        type: "VM_STARTED",
        message: `Started VM ID: ${proxmoxId}`,
        targetId: vmId,
      },
    });
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function StopVmAction(proxmoxId: number, vmId: string) {
  const hasPermission = await checkPermission("vm.stop");
  if (!hasPermission) throw new Error("Unauthorized");

  try {
    await pveFetch(
      `/nodes/${PROXMOX_NODE}/qemu/${proxmoxId}/status/stop`,
      "POST",
    );
    await prisma.log.create({
      data: {
        type: "VM_STOPPED",
        message: `Stopped VM ID: ${proxmoxId}`,
        targetId: vmId,
      },
    });
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function MassVmAction(
  vms: { proxmoxId: number; id: string }[],
  action: "start" | "stop",
) {
  const hasPermission = await checkPermission(`vm.${action}`);
  if (!hasPermission) throw new Error("Unauthorized");

  try {
    const promises = vms.map((vm) =>
      pveFetch(
        `/nodes/${PROXMOX_NODE}/qemu/${vm.proxmoxId}/status/${action}`,
        "POST",
      ).catch((e) => console.error(e)),
    );

    await Promise.all(promises);
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
