import "dotenv/config";
import { prisma } from "../src/lib/prisma";

/**
 * Define the full system structure.
 * slugs and guardNames match frontend nav-config and API guards.
 */
const SYSTEM_STRUCTURE = [
  {
    moduleName: "Core Administration",
    moduleSlug: "admin-core",
    permissions: [
      { name: "View Admin Dashboard", guard: "dashboard.view" },
      { name: "Manage Faculty Accounts", guard: "faculty.manage" },
      { name: "View System-wide Logs", guard: "logs.view" },
      { name: "Configure System Settings", guard: "settings.manage" },
      { name: "View Lab Management", guard: "lab.view" },
    ],
    grantTo: ["ADMIN"],
  },
  {
    moduleName: "Infrastructure Management",
    moduleSlug: "vm-mgmt",
    permissions: [
      { name: "View All Instances", guard: "vm.view" },
      { name: "Provision New VMs", guard: "vm.create" },
      { name: "Destroy VM Instances", guard: "vm.delete" },
      { name: "Global Power Control", guard: "vm.control" },
    ],
    grantTo: ["ADMIN"],
  },
  {
    moduleName: "Software Repository",
    moduleSlug: "packages",
    permissions: [
      { name: "View Package List", guard: "packages.view" },
      { name: "Manage Global Packages", guard: "packages.manage" },
    ],
    grantTo: ["ADMIN"],
  },
  {
    moduleName: "Telemetry Services",
    moduleSlug: "metrics",
    permissions: [{ name: "View Real-time Metrics", guard: "metrics.view" }],
    grantTo: ["ADMIN"],
  },
  {
    moduleName: "Faculty Portal",
    moduleSlug: "faculty-portal",
    permissions: [
      { name: "View Faculty Dashboard", guard: "faculty.dashboard.view" },
      { name: "View Lab Instances", guard: "faculty.vm.view" },
      { name: "Control Lab Instances", guard: "faculty.vm.control" },
      { name: "View Lab Metrics", guard: "faculty.metrics.view" },
      { name: "View Lab History", guard: "faculty.logs.view" },
    ],
    grantTo: ["ADMIN", "FACULTY"],
  },
  {
    moduleName: "Notifications & Alerts",
    moduleSlug: "notifications",
    permissions: [{ name: "View Notifications", guard: "notifications.view" }],
    grantTo: ["ADMIN", "FACULTY"], // Both roles need this for the Sidebar Bell and History page
  },
  {
    moduleName: "User Security",
    moduleSlug: "security",
    permissions: [
      { name: "Reset User Passwords", guard: "user.password.reset" },
    ],
    grantTo: ["ADMIN"],
  },
];

async function main() {
  console.log("🚀 Starting Verbose Permission Synchronization...\n");

  // 1. Fetch Roles
  const adminRole = await prisma.role.findFirst({
    where: { guardName: "ADMIN" },
  });
  const facultyRole = await prisma.role.findFirst({
    where: { guardName: "FACULTY" },
  });

  if (!adminRole || !facultyRole) {
    console.error(
      "❌ Critical Error: ADMIN or FACULTY roles not found in DB. Run user seeder first.",
    );
    process.exit(1);
  }

  console.log(
    `🔎 Found Roles: ADMIN (${adminRole.id}), FACULTY (${facultyRole.id})`,
  );

  for (const group of SYSTEM_STRUCTURE) {
    console.log(
      `\n📦 Processing Module: ${group.moduleName} [/${group.moduleSlug}]`,
    );

    // 2. Upsert Module
    const mod = await prisma.module.upsert({
      where: { id: `mod-${group.moduleSlug}` },
      update: { name: group.moduleName, slug: group.moduleSlug },
      create: {
        id: `mod-${group.moduleSlug}`,
        name: group.moduleName,
        slug: group.moduleSlug,
        isActive: true,
      },
    });
    console.log(`   ✅ Module Synced: ${mod.id}`);

    for (const p of group.permissions) {
      // 3. Upsert Permission
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
      console.log(`      🔑 Permission: ${perm.guardName} (${perm.name})`);

      // 4. Link to Roles defined in 'grantTo'
      for (const roleGuard of group.grantTo) {
        const targetRole = roleGuard === "ADMIN" ? adminRole : facultyRole;

        const link = await prisma.permissionRole.upsert({
          where: { id: `link-${targetRole.id}-${perm.id}` },
          update: {},
          create: {
            id: `link-${targetRole.id}-${perm.id}`,
            roleId: targetRole.id,
            permissionId: perm.id,
          },
        });
        console.log(`         🔗 Linked to Role: ${roleGuard}`);
      }
    }
  }

  console.log("\n✨ Sync Complete. Sidebar and API guards are now aligned. ✅");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("\n🛑 Seeder Failed:");
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
