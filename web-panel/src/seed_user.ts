import "dotenv/config";
import { hash_password } from "./lib/password-utils";
import { prisma } from "./lib/prisma";

async function main() {
  console.log(`Start seeding users and roles... 🌱`);

  const roleNames = ["ADMIN", "FACULTY", "USER"];
  const roleMap: Record<string, string> = {};

  // 1. Ensure roles exist in the database first
  for (const roleName of roleNames) {
    let role = await prisma.role.findFirst({
      where: { guardName: roleName },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleName.charAt(0) + roleName.slice(1).toLowerCase(),
          guardName: roleName,
        },
      });
    }

    // Store the role ID so we can connect it to users later
    roleMap[roleName] = role.id;
  }

  const users = [
    {
      name: "Admin Superuser",
      email: "admin@university.edu",
      password: "securepassword123",
      roles: ["ADMIN", "USER", "FACULTY"],
    },
    {
      name: "John Doe",
      email: "faculty@university.edu",
      password: "facultypassword123",
      roles: ["USER", "FACULTY"],
    },
    {
      name: "Jane Smith",
      email: "jane.smith@university.edu",
      password: "password123",
      roles: ["USER", "FACULTY"],
    },
  ];

  for (const u of users) {
    const hashedPassword = await hash_password(u.password);

    // 2. Upsert the user (Handling only the user data)
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        // Uncomment if you want the seeder to reset passwords on re-runs
        // password: hashedPassword,
      },
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
      },
    });

    // 3. Sync Roles safely using your new @@unique constraint!
    // skipDuplicates: true ensures that existing roles are ignored and only missing roles are added.
    await prisma.roleUser.createMany({
      data: u.roles.map((roleName) => ({
        userId: user.id,
        roleId: roleMap[roleName],
      })),
      skipDuplicates: true,
    });

    console.log(`Created/Updated user: ${user.name} (${user.email})`);
  }

  console.log(`Seeding finished. ✅`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
