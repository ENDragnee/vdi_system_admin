// server.ts
import { createServer } from "node:http";
import { Server } from "socket.io";
import { Kafka, logLevel } from "kafkajs";
import { nextApp, nextHandler } from "./next-instance";

const PORT = parseInt(process.env.PORT || "3000", 10);

// 1. Kafka Configuration
const kafka = new Kafka({
  clientId: "vdi-admin-backend",
  brokers: [process.env.KAFKA_BROKER || "192.168.0.136:9092"],
  logLevel: logLevel.ERROR,
});

// Memory store to merge fragments: { "vm101": { cpu: 0, ram: 0, ... } }
const hostState: Record<string, any> = {};

async function startServer() {
  await nextApp.prepare();

  const httpServer = createServer((req, res) => {
    nextHandler(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

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
          const mName = rawData.name; // measurement name: 'cpu', 'mem', 'net', etc.

          if (!host) return;

          // Initialize state for host if it doesn't exist
          if (!hostState[host]) {
            hostState[host] = {
              host,
              cpu: 0,
              ram: 0,
              netIn: 0,
              netOut: 0,
              uptime: 0,
              disk: 0,
              timestamp: new Error(),
            };
          }

          // --- 1. Process CPU fragments ---
          // Filter for 'cpu-total' to avoid calculating per-core data
          if (mName === "cpu" && rawData.tags.cpu === "cpu-total") {
            hostState[host].cpu = rawData.fields.usage_active || 0;
          }

          // --- 2. Process Memory fragments ---
          if (mName === "mem") {
            hostState[host].ram = rawData.fields.used_percent || 0;
          }

          // --- 3. Process Network fragments ---
          // Note: Telegraf sends bytes since boot. We convert to MB.
          if (mName === "net") {
            hostState[host].netIn =
              (rawData.fields.bytes_recv || 0) / 1024 / 1024;
            hostState[host].netOut =
              (rawData.fields.bytes_sent || 0) / 1024 / 1024;
          }

          // --- 4. Process System/Uptime ---
          if (mName === "system") {
            hostState[host].uptime = rawData.fields.uptime || 0;
          }

          // --- 5. Process Disk ---
          if (mName === "disk") {
            hostState[host].disk = rawData.fields.used_percent || 0;
          }

          hostState[host].timestamp = new Date().toLocaleTimeString();

          // BROADCAST: Send the updated consolidated state of this host to all browsers
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
    console.log(`\n🚀 VDI Dashboard Live`);
    console.log(`> Server: http://localhost:${PORT}`);
    console.log(
      `> Metrics: Consuming Kafka 'vm-metrics' and merging fragments\n`,
    );
  });
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

startServer();
