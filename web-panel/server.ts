// server.ts
import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { Kafka, logLevel } from "kafkajs";
import { nextApp, nextHandler } from "./next-instance";
import { prisma } from "./src/lib/prisma"; // Adjust path if necessary

const PORT = parseInt(process.env.PORT || "3000", 10);

// 1. Kafka Configuration
const kafka = new Kafka({
  clientId: "vdi-admin-backend",
  brokers: [process.env.KAFKA_BROKER || "192.168.0.136:9092"],
  logLevel: logLevel.ERROR,
});

// Memory store to merge fragments
const hostState: Record<string, any> = {};

// --- NOTIFICATION COOLDOWN MAP ---
// Prevents spamming the DB/Client. Format: { "hostname-RESOURCE": lastTimestamp }
const alertCooldowns: Record<string, number> = {};
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

async function startServer() {
  await nextApp.prepare();

  const httpServer = createServer((req, res) => {
    nextHandler(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  (global as any).io = io;

  const consumer = kafka.consumer({
    groupId: "vdi-metrics-group",
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });

  const runKafkaConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "vm-metrics", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        try {
          const rawData = JSON.parse(message.value.toString());
          const host = rawData.tags.host;
          const mName = rawData.name;

          if (!host) return;

          if (!hostState[host]) {
            hostState[host] = {
              host,
              cpu: 0,
              ram: 0,
              netIn: 0,
              netOut: 0,
              uptime: 0,
              disk: 0,
              timestamp: new Date().toLocaleTimeString(),
            };
          }

          if (mName === "cpu" && rawData.tags.cpu === "cpu-total") {
            hostState[host].cpu = rawData.fields.usage_active || 0;
            // Trigger Alert Check
            checkThresholds(host, "CPU", hostState[host].cpu, 90, io);
          }

          if (mName === "mem") {
            hostState[host].ram = rawData.fields.used_percent || 0;
            // Trigger Alert Check
            checkThresholds(host, "RAM", hostState[host].ram, 90, io);
          }

          if (mName === "net") {
            hostState[host].netIn =
              (rawData.fields.bytes_recv || 0) / 1024 / 1024;
            hostState[host].netOut =
              (rawData.fields.bytes_sent || 0) / 1024 / 1024;
          }

          if (mName === "system") {
            hostState[host].uptime = rawData.fields.uptime || 0;
          }

          if (mName === "disk") {
            hostState[host].disk = rawData.fields.used_percent || 0;
          }

          hostState[host].timestamp = new Date().toLocaleTimeString();

          // BROADCAST Metrics to frontend
          io.emit("vm-metrics-update", hostState[host]);
        } catch (err) {
          console.error("Payload parse error:", err);
        }
      },
    });
  };

  runKafkaConsumer().catch(console.error);

  io.on("connection", (socket) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[WS] Client attached: ${socket.id}`);
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 VDI Infrastructure Online`);
    console.log(`> Server: http://localhost:${PORT}`);
    console.log(`> Alerts: Monitoring CPU/RAM thresholds > 90%\n`);
  });
}

// --- LOGIC: THRESHOLD & NOTIFICATION ENGINE ---
async function checkThresholds(
  host: string,
  type: "CPU" | "RAM",
  value: number,
  limit: number,
  io: Server,
) {
  if (value < limit) return;

  const cooldownKey = `${host}-${type}`;
  const now = Date.now();

  if (
    alertCooldowns[cooldownKey] &&
    now - alertCooldowns[cooldownKey] < COOLDOWN_MS
  ) {
    return;
  }

  try {
    // FIX 1: Use findFirst because hostname is not a unique-constrained field in Prisma
    // FIX 2: Explicitly include the lab relation
    const vm = await prisma.vM.findFirst({
      where: { hostname: host },
      include: { lab: true },
    });

    // Safety check: if VM isn't in our DB, we can't link the notification
    if (!vm || !vm.lab) return;

    const title = `Critical ${type} Usage`;
    const message = `Instance ${host} in ${vm.lab.name} has exceeded ${limit}% ${type} utilization (Current: ${value.toFixed(1)}%).`;

    // 2. Persist to Database
    await prisma.notification.create({
      data: {
        title,
        message,
        type: "RESOURCE_CRITICAL", // Ensure this matches your Prisma Enum
        labId: vm.labId,
        link: `/admin/metrics?host=${host}`,
      },
    });

    // 3. Emit Real-time Toast
    io.emit("new-notification", {
      title,
      message,
      type: "error",
      timestamp: new Date().toISOString(),
    });

    alertCooldowns[cooldownKey] = now;
    console.log(`⚠️  ALERT: ${host} ${type} at ${value.toFixed(1)}%`);
  } catch (error: any) {
    console.error("Failed to process notification engine:", error.message);
  }
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

startServer();
