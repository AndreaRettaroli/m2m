import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";
import axios from "axios";
import { Hex } from "viem";
import { config } from "dotenv";
import { z } from "zod";

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

const privateKey = process.env.PRIVATE_KEY as Hex;
const baseURL = (process.env.BASE_URL as string) || "http://localhost:5000"; // e.g. https://example.com
const endpointPath = "/weather"; // e.g. /weather
const endpointPath2 = "/exchange"; // e.g. /exchange

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
server.tool(
  "get-weather-data",
  "Provides information about the weather",
  {},
  async () => {
    try {
      const res = await client.post(endpointPath);
      return {
        content: [{ type: "text", text: JSON.stringify(res.data) }],
      };
    } catch (error) {
      console.error("❌ Error occurred while fetching weather data:", error);
      throw error;
    }
  }
);

server.tool(
  "exchange-rate",
  "Provides information about the exchange rate, for example how much is 10 USD in EUR",
  {
    question: z
      .string()
      .min(0)
      .max(1000)
      .describe(
        "The question to ask about the exchange rate for example how much is 10 USD in EUR"
      ),
  },
  async ({ question }) => {
    // server.server.sendLoggingMessage({ message: question, level: "info" });
    if (!question) {
      throw new Error("Message is required to ask about the exchange rate");
    }
    const userMessage = question;

    const res = await client.post(endpointPath2, { message: userMessage });

    return {
      content: [{ type: "text", text: JSON.stringify(res.data) }],
    };
  }
);

async function main() {
  // 2. Create stdio transport
  const transport = new StdioServerTransport();
  // 4. Connect MCP over SSE
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

// async function startServer(transportType: "stdio" | "sse") {
//   if (transportType === "stdio") {
//     const transport = new StdioServerTransport();
//     await server.connect(transport);
//     console.log("MCP Server running with stdio transport");
//   } else if (transportType === "sse") {
//     const app = express();
//     //
//     let transport: SSEServerTransport | null = null;

//     app.get("/sse", async (req: Request, res: Response) => {
//       transport = new SSEServerTransport("/messages", res);
//       console.log("🔔 SSE connection established");
//       await server.connect(transport);
//     });

//     app.post("/messages", async (req: Request, res: Response) => {
//       //console.log("🚀 ~ app.post ~ req:", req);
//       if (transport) {
//         await transport.handlePostMessage(req, res);
//       } else {
//         res.status(503).json({ error: "SSE transport not initialized" });
//       }
//     });
//     app.use(express.json());
//     app.listen(8000, () => {
//       console.log("MCP Server running with SSE on http://localhost:8000/sse");
//     });
//   }
// }

// const transportType = process.argv[2] === "sse" ? "sse" : "stdio";
// startServer(transportType);
// const app = express();

// let transport: SSEServerTransport | null = null;

// app.get("/sse", (req, res) => {
//   transport = new SSEServerTransport("/messages", res);
//   server.connect(transport);
// });

// app.post("/messages", (req, res) => {
//   if (transport) {
//     transport.handlePostMessage(req, res);
//   }
// });

// app.listen(8000);
