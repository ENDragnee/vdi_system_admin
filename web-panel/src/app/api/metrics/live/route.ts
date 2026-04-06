import { NextRequest } from "next/server";
import { kafka } from "@/lib/kafka";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Unique group ID so every tab gets all the live data
  const consumer = kafka.consumer({ groupId: `vdi-monitor-${Math.random()}` });

  const streamMetrics = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "vm-metrics", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const rawData = JSON.parse(message.value.toString());

        // Format the SSE data block
        const sseData = `data: ${JSON.stringify(rawData)}\n\n`;
        await writer.write(encoder.encode(sseData));
      },
    });
  };

  streamMetrics().catch(async (err) => {
    console.error("Kafka SSE Error:", err);
    await consumer.disconnect();
    writer.close();
  });

  // Handle client disconnection
  req.signal.addEventListener("abort", async () => {
    await consumer.disconnect();
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
