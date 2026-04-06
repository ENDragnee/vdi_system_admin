// seeds/sync-permissions.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// 1. DEFINE YOUR STRUCTURE HERE
// To add new features, just add objects to this array.
const PERMISSION_STRUCTURE = [
  {
    moduleName: "Core System",
    moduleSlug: "core",
    permissions: [
      { name: "View Dashboard", guard: "dashboard.view" },
      { name: "Manage Faculty", guard: "faculty.manage" },
      { name: "View System Logs", guard: "logs.view" },
      { name: "Manage Settings", guard: "settings.manage" },
    ],
  },
  {
    moduleName: "VM Management",
    moduleSlug: "vm",
    permissions: [
      { name: "View VMs", guard: "vm.view" },
      { name: "Create VMs", guard: "vm.create" },
      { name: "Delete VMs", guard: "vm.delete" },
      { name: "Start VMs", guard: "vm.start" },
      { name: "Stop VMs", guard: "vm.stop" },
      { name: "View VM Logs", guard: "vm.logs.view" },
    ],
  },
  {
    moduleName: "Package Management",
    moduleSlug: "packages",
    permissions: [
      { name: "View Packages", guard: "packages.view" },
      { name: "Create Packages", guard: "packages.create" },
      { name: "Update Packages", guard: "packages.update" },
      { name: "Delete Packages", guard: "packages.delete" },
      { name: "Manage Package Assignments", guard: "packages.manage" },
    ],
  },
  {
    moduleName: "Live Metrics",
    moduleSlug: "metrics",
    permissions: [{ name: "View Real-time Metrics", guard: "metrics.view" }],
  },
];

async function main() {
  console.log("🔄 Starting Permission Sync...");

  // 2. Ensure the ADMIN role exists
  const adminRole = await prisma.role.findFirst({
    where: { guardName: "ADMIN" },
  });

  if (!adminRole) {
    console.error("❌ ADMIN role not found. Please run the user seeder first.");
    process.exit(1);
  }

  for (const item of PERMISSION_STRUCTURE) {
    // 3. Upsert Module
    const mod = await prisma.module.upsert({
      where: { id: `mod-${item.moduleSlug}` },
      update: { name: item.moduleName },
      create: {
        id: `mod-${item.moduleSlug}`,
        name: item.moduleName,
        slug: item.moduleSlug,
        isActive: true,
      },
    });

    for (const p of item.permissions) {
      // 4. Upsert Permission
      const perm = await prisma.permission.upsert({
        where: { id: `perm-${p.guard}` },
        update: { name: p.name, moduleId: mod.id },
        create: {
          id: `perm-${p.guard}`,
          name: p.name,
          guardName: p.guard,
          moduleId: mod.id,
        },
      });

      // 5. Sync to ADMIN role (The "Update" part)
      // We use upsert here to ensure the link exists without erroring if it already does
      await prisma.permissionRole.upsert({
        where: {
          // In your schema this isn't unique by default, so we use the ID pattern
          // used in the previous step or findFirst logic.
          id: `link-${adminRole.id}-${perm.id}`,
        },
        update: {},
        create: {
          id: `link-${adminRole.id}-${perm.id}`,
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });

      console.log(`✅ Synced: [${item.moduleName}] -> ${p.name}`);
    }
  }

  console.log(
    "\n✨ Sync Complete. All new permissions have been granted to ADMIN.",
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
