import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { Kafka, logLevel } from "kafkajs";
import { nextApp, nextHandler } from "./next-instance";
import { prisma } from "./src/lib/prisma";
import { logger } from "./src/lib/logger";

const log = logger.child({ module: "infra-worker" });
const PORT_NUMBER = parseInt(process.env.PORT || "3000", 10);

// 1. Kafka Configuration
// Ensure we use localhost for the internal consumer if running on the same host as Docker
const rawBroker = process.env.KAFKA_BROKER || "localhost:9092";
const cleanBroker = rawBroker.includes("://")
  ? rawBroker.split("://")[1]
  : rawBroker;

const kafka = new Kafka({
  clientId: "vdi-admin-backend",
  brokers: [cleanBroker],
  logLevel: logLevel.ERROR,
});

const hostState: Record<string, any> = {};
const alertCooldowns: Record<string, number> = {};
const COOLDOWN_MS = 5 * 60 * 1000;

async function startServer() {
  log.info("Preparing Next.js application...");
  await nextApp.prepare();

  const httpServer = createServer((req, res) => {
    nextHandler(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  (global as any).io = io;

  // 2. Setup Kafka Consumer with DYNAMIC Group ID
  // This forces Kafka to send us the most recent data immediately on every restart
  const consumer = kafka.consumer({
    groupId: `vdi-metrics-runtime-${Date.now()}`, // Unique ID per restart
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });

  const runKafkaConsumer = async () => {
    try {
      await consumer.connect();
      // Set fromBeginning: false to only get "Live" data,
      // or true to fill the chart with recent history on load
      await consumer.subscribe({ topic: "vm-metrics", fromBeginning: false });
      log.info({ broker: cleanBroker }, "Kafka Consumer Online & Subscribed");

      await consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;

          try {
            const rawData = JSON.parse(message.value.toString());
            const host = rawData.tags?.host;
            const mName = rawData.name;

            if (!host) return;

            // Debug log to confirm packets are arriving in the console
            log.trace({ host, measurement: mName }, "Incoming Kafka Packet");

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

            // Logic for merging fragments
            if (mName === "cpu" && rawData.tags.cpu === "cpu-total") {
              hostState[host].cpu = rawData.fields.usage_active || 0;
              checkThresholds(host, "CPU", hostState[host].cpu, 90, io);
            }

            if (mName === "mem") {
              hostState[host].ram = rawData.fields.used_percent || 0;
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

            // EMIT TO WEBSOCKET
            io.emit("vm-metrics-update", hostState[host]);
          } catch (err) {
            log.error("Failed to process Kafka message JSON");
          }
        },
      });
    } catch (err: any) {
      log.error({ err: err.message }, "Kafka Consumer Connection Failed");
    }
  };

  runKafkaConsumer().catch((err) => log.error({ err }, "Consumer Crash"));

  io.on("connection", (socket) => {
    log.debug({ socketId: socket.id }, "Dashboard Browser Connected");
  });

  httpServer.listen(PORT_NUMBER, "0.0.0.0", () => {
    log.info(`\n🚀 VDI CONTROL PLANE ONLINE`);
    log.info(`> Dashboard: http://localhost:${PORT_NUMBER}`);
    log.info(`> Listening on all interfaces (0.0.0.0)`);
  });
}

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
  )
    return;

  try {
    const vm = await prisma.vM.findFirst({
      where: { hostname: host },
      include: { lab: true },
    });
    if (!vm) return;

    await prisma.notification.create({
      data: {
        title: `Critical ${type} Usage`,
        message: `Instance ${host} in ${vm.lab.name} is at ${value.toFixed(1)}% usage.`,
        type: "RESOURCE_CRITICAL",
        labId: vm.labId,
        link: `/admin/metrics?host=${host}`,
      },
    });

    io.emit("new-notification", {
      title: `Critical ${type} Usage`,
      message: `${host} is at ${value.toFixed(1)}%`,
      type: "RESOURCE_CRITICAL",
    });

    alertCooldowns[cooldownKey] = now;
  } catch (error: any) {
    log.error({ err: error.message }, "Notification Engine Error");
  }
}

process.on("unhandledRejection", (error) => {
  log.error({ err: error }, "Unhandled Rejection");
});

startServer();
