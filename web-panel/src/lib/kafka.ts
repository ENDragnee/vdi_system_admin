import { Kafka, logLevel } from "kafkajs";

const broker = process.env.KAFKA_BROKER || "192.168.0.136:9092";

export const kafka = new Kafka({
  clientId: "vdi-admin-panel",
  brokers: [broker],
  logLevel: logLevel.ERROR,
});
