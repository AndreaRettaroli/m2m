import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";
import axios from "axios";
import { Hex } from "viem";
import { config } from "dotenv";
import { text } from "stream/consumers";
config();

export interface Message {
  messageId: string;
  sender: string;
  recipient: string;
  payload: string;
  replyTo?: string;
  method: string;
  jsonrpc: "2.0";
  params: { text: string };
}

const privateKey =
  (process.env.PRIVATE_KEY as Hex) ||
  "0xf956457278a7342550fffa7cefb14826e05a29c94f8b94ef037553bcfb7a9a95"; // e.g. "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
const baseURL = (process.env.BASE_URL as string) || "http://localhost:3000"; // e.g. https://example.com
const endpointPath = "/a2a/message"; // e.g. /weather

if (!privateKey || !baseURL || !endpointPath) {
  throw new Error("Missing environment variables");
}

// Create a wallet client to handle payments
const account = privateKeyToAccount(privateKey);

// Create an axios client with payment interceptor using x402-axios
const client = withPaymentInterceptor(axios.create({ baseURL }), account);

// Create an MCP server
const server = new McpServer({
  name: "x402 MCP Client Demo",
  version: "1.0.0",
});

// Add an addition tool
// server.tool(
//   "get-data-from-resource-server",
//   "Get data from the resource server (in this example, the weather)", //change this description to change when the client calls the tool
//   {},
//   async () => {
//     const res = await client.get(endpointPath);
//     return {
//       content: [{ type: "text", text: JSON.stringify(res.data) }],
//     };
//   }
// );

server.tool(
  "contact-agent",
  "Contact the agent (in this example, the weather)",
  {},
  async () => {
    const initial: Message = {
      messageId: "msg-001",
      sender: "AgentA",
      recipient: "AgentB",
      payload: "Hello from A!",
      method: "echo",
      jsonrpc: "2.0",
      params: {
        text: "Hello from A!",
      },
    };
    const res = await client.post(endpointPath, initial);
    return {
      content: [{ type: "text", text: JSON.stringify(res.data) }],
    };
  }
);

async function main() {
  //console.log("Starting MCP server...");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  //console.log("MCP server started");
}

main().catch((error) => {
  //console.error("Fatal error in main():", error);
  process.exit(1);
});
