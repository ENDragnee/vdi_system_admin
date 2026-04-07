import { prisma } from "./prisma";

export async function createNotification({
  title,
  message,
  type,
  labId = null,
  userId = null,
  link = null,
}: {
  title: string;
  message: string;
  type: "SUCCESS" | "ERROR" | "WARNING" | "INFO" | "RESOURCE_CRITICAL";
  labId?: string | null;
  userId?: string | null;
  link?: string | null;
}) {
  // 1. Persist to DB
  await prisma.notification.create({
    data: { title, message, type, labId, userId, link },
  });

  // 2. Emit to WebSocket
  const io = (global as any).io;
  if (io) {
    io.emit("new-notification", { title, message, type });
  }
}
