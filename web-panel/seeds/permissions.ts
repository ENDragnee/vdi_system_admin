// seeds/permissions.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log(`Start seeding permissions... 🌱`);

  const adminRole = await prisma.role.findFirst({
    where: { guardName: "ADMIN" },
  });
  if (!adminRole) {
    console.error("Admin role not found. Run user seeder first.");
    process.exit(1);
  }

  // 1. Create/Update Modules
  const coreModule = await prisma.module.upsert({
    where: { id: "mod-core" },
    update: { isActive: true },
    create: {
      id: "mod-core",
      name: "Core System",
      slug: "core",
      isActive: true,
    },
  });

  const pkgModule = await prisma.module.upsert({
    where: { id: "mod-packages" },
    update: { isActive: true },
    create: {
      id: "mod-packages",
      name: "Package Management",
      slug: "packages",
      isActive: true,
    },
  });

  // 2. Define Granular Permissions
  const permissions = [
    // Sidebar & Dashboard
    {
      name: "View Dashboard",
      guardName: "dashboard.view",
      modId: coreModule.id,
    },
    {
      name: "Manage Faculty",
      guardName: "faculty.manage",
      modId: coreModule.id,
    },
    { name: "View VMs", guardName: "vm.view", modId: coreModule.id },
    { name: "View Metrics", guardName: "metrics.view", modId: coreModule.id },
    { name: "View Logs", guardName: "logs.view", modId: coreModule.id },

    // Package Management (API & UI)
    {
      name: "Manage Packages",
      guardName: "packages.manage",
      modId: pkgModule.id,
    },
    { name: "View Packages", guardName: "packages.view", modId: pkgModule.id },
    {
      name: "Create Packages",
      guardName: "packages.create",
      modId: pkgModule.id,
    },
    {
      name: "Update Packages",
      guardName: "packages.update",
      modId: pkgModule.id,
    },
    {
      name: "Delete Packages",
      guardName: "packages.delete",
      modId: pkgModule.id,
    },
  ];

  for (const p of permissions) {
    const perm = await prisma.permission.upsert({
      where: { id: `perm-${p.guardName}` },
      update: { name: p.name, moduleId: p.modId },
      create: {
        id: `perm-${p.guardName}`,
        name: p.name,
        guardName: p.guardName,
        moduleId: p.modId,
      },
    });

    // 3. Assign all to ADMIN role
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
