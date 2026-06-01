import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const prismaClientSingleton = () => {
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing from environment variables");
  }

  if (connectionString.startsWith("prisma://")) {
    throw new Error(
      "You are using a 'prisma://' URL with the 'pg' adapter. Please use the Direct Connection URL (starts with 'postgres://') or remove the adapter.",
    );
  }

  // Determine if connecting to a local DB instance to disable SSL requirements
  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  // Initialize the PostgreSQL connection pool with appropriate SSL parameters
  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  // Use the Prisma pg adapter for optimized serverless and edge environments
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
