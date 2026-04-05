import "dotenv/config";
import { hash_password } from "./lib/password-utils";
import { prisma } from "./lib/prisma";

async function main() {
  console.log(`Start seeding users and roles... 🌱`);

  const roleNames = ["admin", "faculty", "user"];
  const roleMap: Record<string, string> = {};

  // 1. Ensure roles exist in the database first
  for (const roleName of roleNames) {
    let role = await prisma.role.findFirst({
      where: { guardName: roleName },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleName.charAt(0) + roleName.slice(1).toLowerCase(), // "Admin", "Faculty", "User"
          guardName: roleName.toUpperCase(),
        },
      });
    }

    // Store the role ID so we can cleanly connect it to users later
    roleMap[roleName] = role.id;
  }

  const users = [
    {
      name: "Admin Superuser",
      email: "admin@university.edu",
      password: "securepassword123",
      roles: ["admin", "user", "faculty"],
    },
    {
      name: "John Doe",
      email: "faculty@university.edu",
      password: "facultypassword123",
      roles: ["user", "faculty"],
    },
    {
      name: "Jane Smith",
      email: "jane.smith@university.edu",
      password: "password123",
      roles: ["user", "faculty"], // Explicitly granting Faculty role
    },
  ];

  for (const u of users) {
    const hashedPassword = await hash_password(u.password);

    // Pre-map the roles array into the exact format Prisma's nested writes expect
    const roleConnections = u.roles.map((roleName) => ({
      roleId: roleMap[roleName],
    }));

    // 2. Upsert the user AND sync their roles in one atomic transaction!
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        // Optional: password: hashedPassword,
        
        // SYNC ROLES: This clears out old roles and applies the exact roles from the array above
        roleUsers: {
          deleteMany: {}, // Deletes existing connections in the join table
          create: roleConnections, // Creates the new explicit connections
        },
      },
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
        
        // CREATE ROLES: Simply connect the roles upon user creation
        roleUsers: {
          create: roleConnections,
        },
      },
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
