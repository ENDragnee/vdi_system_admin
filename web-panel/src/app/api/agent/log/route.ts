// app/api/agent/log/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.NEXTJS_API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    // Use targetId as sent by the agent
    const { type, severity, message, targetName, targetId, details } = body;

    console.log(
      `📥 Webhook: ID ${targetId} | Host: ${targetName} | Type: ${type}`,
    );

    // --- THE FIX: PREVENT PRISMA CRASH ---
    let vm = null;
    if (targetId) {
      vm = await prisma.vM.findUnique({
        where: { id: targetId },
      });
    }

    // Fallback: If ID is missing, try matching by hostname
    if (!vm && targetName) {
      vm = await prisma.vM.findFirst({
        where: { hostname: { equals: targetName, mode: "insensitive" } },
      });
    }

    // 2. Create the log entry (Always works even if vm is null)
    const newLog = await prisma.log.create({
      data: {
        type: type,
        severity: severity,
        message: message,
        targetName: targetName || "unknown",
        targetId: vm?.id || targetId || null,
        details: details ? { output: details } : {},
      },
    });

    // 3. Update Package Statuses
    if (vm) {
      const statusUpdate =
        type === "NIX_BUILD_SUCCESS"
          ? "INSTALLED"
          : type === "NIX_BUILD_FAILED"
            ? "FAILED"
            : null;

      if (statusUpdate) {
        await prisma.vMPackage.updateMany({
          where: { vmId: vm.id, status: "PENDING" },
          data: { status: statusUpdate },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("🔴 Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
