import express, { Request, Response } from "express";
import { generateText } from "ai";
import { config } from "dotenv";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";

config();
console.log("🚀 ~ Agent A starting...");

// Load AWS credentials from environment
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

console.log("AWS_ACCESS_KEY_ID:", accessKey);
console.log("AWS_SECRET_ACCESS_KEY:", secretKey);
console.log("AWS_REGION:", region);

// Initialize Amazon Bedrock
const bedrock = createAmazonBedrock({
  region: region ?? "eu-west-1",
  accessKeyId: accessKey,
  secretAccessKey: secretKey,
});
console.log("✅ Bedrock initialized");

// Initialize MCP client once at startup
let mcpClient: Awaited<ReturnType<typeof createMCPClient>>;

async function initMCPClient() {
  try {
    mcpClient = await createMCPClient({
      transport: {
        type: "sse",
        url: "http://localhost:8000/sse",
      },
    });
    console.log("✅ MCP client connected via SSE");
  } catch (err) {
    console.error("❌ Failed to connect MCP client:", err);
    process.exit(1);
  }
}

// Express setup
const app = express();
app.use(express.json());
const PORT = 5000;

// Message route
app.get("/message", async (req: Request, res: Response) => {
  try {
    const tools = await mcpClient.tools();
    const prompt = `You are Agent A. You have received a message from Andrea with content:\nRespond with a helpful follow-up message.`;

    const { text } = await generateText({
      model: bedrock("eu.amazon.nova-micro-v1:0"),
      prompt,
      tools,
    });

    console.log("📝 Generated text:", text);
    res.status(200).json({ status: "ok", text });
  } catch (err) {
    console.error("[Agent A] Error during generation or tool usage:", err);
    res.status(500).json({
      status: "error",
      error: err instanceof Error ? err.toString() : "Unknown error",
    });
  }
});

// Start server after MCP is ready
initMCPClient().then(() => {
  app.listen(PORT, () => {
    console.log(`[Agent A] Listening on http://localhost:${PORT}`);
  });
});
