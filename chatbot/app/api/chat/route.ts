import { streamText } from "ai";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { config } from "dotenv";
import { experimental_createMCPClient as createMcpClient } from "ai";
import { Experimental_StdioMCPTransport as StdioClientTransport } from "ai/mcp-stdio";

// Allow streaming responses up to 30 seconds
//export const maxDuration = 30;

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

// MCP client cache
let mcpClientPromise: ReturnType<typeof createMCPClient> | null = null;

export async function POST(req: Request) {
  try {
    const mcpClient = await initStdioClient();
    console.log("🚀 ~ POST ~ mcpClient:", mcpClient);
    const tools = await mcpClient.tools();
    console.log("🚀 ~ POST ~ tools:", tools);
    const prompt = `You are Agent A. You have received a message from Andrea with content:\nRespond with a helpful follow-up message.`;

    const { messages } = await req.json();

    const result = streamText({
      model: bedrock("eu.amazon.nova-pro-v1:0"),
      messages: [
        {
          role: "system",
          content:
            "You are Agent A. If the user asks about weather or needs data from another agent, use the appropriate tool. You have the tools 'get-data-from-resource-server' and 'contact-agent' available.",
        },
        ...messages,
      ],
      tools,
      toolChoice: "auto",
    });
    return result.toDataStreamResponse();
  } catch (err) {
    console.error("[Agent A] Error during generation or tool usage:", err);
    return new Response(
      JSON.stringify({
        status: "error",
        error: err instanceof Error ? err.toString() : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

const initStdioClient = async () => {
  const transport = new StdioClientTransport({
    command: "/Users/andrea.rettaroli/.nvm/versions/node/v23.3.0/bin/npm",
    args: ["--silent", "run", "dev", "-C", "/Users/andrea.rettaroli/m2m/mcp"],
    env: {
      PRIVATE_KEY: process.env.PRIVATE_KEY!,
      RESOURCE_SERVER_URL:
        process.env.RESOURCE_SERVER_URL || "http://localhost:5000",
      ENDPOINT_PATH: process.env.ENDPOINT_PATH || "/weather",
    },
  });
  const McpServer = createMcpClient({ name: "test", transport })
    .then((client) => {
      console.log("✅ MCP client connected via stdio");
      return client;
    })
    .catch((err) => {
      console.error("❌ Failed to connect MCP client:", err);
      throw err;
    });
  console.log("🚀 ~ initStdioClient ~ McpServer:", McpServer);
  return McpServer;
};
