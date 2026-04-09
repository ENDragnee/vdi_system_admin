import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pveFetch } from "@/lib/proxmox";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "thin-client-handshake" });

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    // 1. Security Check
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.AGENT_SECRET}`) {
      log.warn("Unauthorized SPICE request attempt blocked");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vmId, clientName } = await req.json();

    // 2. Resolve VM
    const vm = await prisma.vM.findUnique({
      where: { id: vmId },
      include: { lab: true },
    });

    if (!vm) {
      log.error({ vmId }, "Thin-client requested non-existent VM");
      return NextResponse.json({ error: "VM not found" }, { status: 404 });
    }

    // 3. Request SPICE from Proxmox
    const PROXMOX_NODE = process.env.PROXMOX_NODE || "pve";
    const res = await pveFetch(
      `/nodes/${PROXMOX_NODE}/qemu/${vm.proxmoxId}/spiceproxy`,
      "POST",
    );

    // Normalize response based on your working Action logic
    const d = res?.data?.data || res?.data || res;

    if (!d || !d.password || !d.host) {
      log.fatal({ pveResponse: d }, "Proxmox returned incomplete SPICE data");
      return NextResponse.json(
        { error: "Proxmox ticket generation failed" },
        { status: 500 },
      );
    }

    // 4. LOG TO POSTGRES (Audit Trail)
    await prisma.log.create({
      data: {
        type: "VM_STARTED",
        severity: "INFO",
        message: `VDI Session: ${vm.hostname} connected to Terminal: ${clientName}`,
        targetId: vm.id,
        targetName: vm.hostname,
        labId: vm.labId,
      },
    });

    // 5. PROCESS PROXY (Logic from your working component)
    let finalProxy = d.proxy;
    try {
      const proxyUrl = new URL(d.proxy);
      // Use the environment IP to ensure the thin client can reach the proxy
      const forcedIp = process.env.NEXT_PUBLIC_PROXMOX_IP || proxyUrl.hostname;
      proxyUrl.hostname = forcedIp;
      finalProxy = proxyUrl.toString();
    } catch (e) {
      log.warn({ proxy: d.proxy }, "Failed to parse proxy URL, using original");
    }

    // 6. GENERATE .VV CONTENT (1-1 Match with your working component)
    const vvContent = [
      "[virt-viewer]",
      "type=spice",
      `title=VDS: ${vm.hostname} - ${clientName}`,
      "release-cursor=Ctrl+Alt+R",
      "toggle-fullscreen=Shift+F11",
      "secure-attention=Ctrl+Alt+Ins",
      `proxy=${finalProxy}`,
      `tls-port=${d["tls-port"]}`,
      `password=${d.password}`,
      `host-subject=${d["host-subject"]}`,
      `host=${d.host}`,
    ];

    if (d.ca) {
      vvContent.push(`ca=${d.ca.replace(/\n/g, "\\n")}`);
    }

    vvContent.push("delete-this-file=1");

    log.info(
      { clientName, vm: vm.hostname, duration: Date.now() - startTime },
      "Handshake complete. Dispatching .vv",
    );

    return new Response(vvContent.join("\n"), {
      headers: {
        "Content-Type": "application/x-virt-viewer",
        "Content-Disposition": `attachment; filename="console-${vm.proxmoxId}.vv"`,
      },
    });
  } catch (error: any) {
    log.error(
      { err: error.message },
      "Critical failure in SPICE Handshake API",
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
