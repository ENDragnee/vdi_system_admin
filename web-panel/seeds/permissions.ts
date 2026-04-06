// seeds/permissions.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log(`Start seeding permissions for Sidebar... 🌱`);

  const adminRole = await prisma.role.findFirst({
    where: { guardName: "ADMIN" },
  });
  if (!adminRole) {
    console.error("Admin role not found. Run user seeder first.");
    process.exit(1);
  }

  const vmModule = await prisma.module.upsert({
    where: { id: "mod-vm" },
    update: { isActive: true },
    create: { id: "mod-vm", name: "Core System", slug: "core", isActive: true },
  });

  // EXACT MATCHES for your nav-config.tsx
  const permissions = [
    { name: "View Dashboard", guardName: "dashboard.view" },
    { name: "Manage Faculty", guardName: "faculty.manage" },
    { name: "View VMs", guardName: "vm.view" },
    { name: "Manage Packages", guardName: "packages.manage" },
    { name: "View Metrics", guardName: "metrics.view" },
    { name: "View Logs", guardName: "logs.view" },
    { name: "Manage Settings", guardName: "settings.manage" },
    { name: "Faculty Dashboard", guardName: "faculty.dashboard.view" },
  ];

  for (const p of permissions) {
    const perm = await prisma.permission.upsert({
      where: { id: `perm-${p.guardName}` },
      update: { name: p.name },
      create: {
        id: `perm-${p.guardName}`,
        name: p.name,
        guardName: p.guardName,
        moduleId: vmModule.id,
      },
    });

    await prisma.permissionRole.upsert({
      where: { id: `pr-${adminRole.id}-${perm.id}` },
      update: {},
      create: {
        id: `pr-${adminRole.id}-${perm.id}`,
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  console.log(
    `Successfully synced ${permissions.length} permissions to ADMIN role. ✅`,
  );
}

main().then(() => prisma.$disconnect());
