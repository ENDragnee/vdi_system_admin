import "dotenv/config"
import { Role } from "./generated/prisma/client";
import { hash_password } from "./lib/password-utils";
import { prisma } from "./lib/prisma";

async function main() {
  console.log(`Start seeding users... 🌱`);

  // Define the users you want to seed
  const users =[
    {
      name: "Admin Superuser",
      email: "admin@university.edu",
      password: "securepassword123", // Plain text here, will be hashed below
      role: Role.ADMIN, // Assuming your Enum has ADMIN. Adjust if different.
    },
    {
      name: "John Doe",
      email: "faculty@university.edu",
      password: "facultypassword123",
      role: Role.FACULTY,
    },
    {
      name: "Jane Smith",
      email: "jane.smith@university.edu",
      password: "password123",
      role: Role.FACULTY,
    },
  ];

  for (const u of users) {
    const hashedPassword = await hash_password(u.password);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        password: hashedPassword,
      },
    });

    console.log(`Created/Updated user: ${user.name} (${user.email})`);
  }

  console.log(`Seeding finished.`);
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
