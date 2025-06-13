// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// import { privateKeyToAccount } from "viem/accounts";
// import { withPaymentInterceptor } from "x402-axios";
// import axios from "axios";
// import { Hex } from "viem";
// import { config } from "dotenv";
// import http from "http";
// config();

// export interface Message {
//   messageId: string;
//   sender: string;
//   recipient: string;
//   payload: string;
//   replyTo?: string;
//   method: string;
//   jsonrpc: "2.0";
//   params: { text: string };
// }

// const privateKey = process.env.PRIVATE_KEY as Hex;
// const baseURL = (process.env.BASE_URL as string) || "http://localhost:3000"; // e.g. https://example.com
// const endpointPath = "/a2a/message"; // e.g. /weather

// if (!privateKey || !baseURL || !endpointPath) {
//   throw new Error("Missing environment variables");
// }

// // Create a wallet client to handle payments
// const account = privateKeyToAccount(privateKey);

// // Create an axios client with payment interceptor using x402-axios
// const client = withPaymentInterceptor(axios.create({ baseURL }), account);

// // Create an MCP server
// const server = new McpServer({
//   name: "x402 MCP Client Demo",
//   version: "1.0.0",

// });

// // Add an addition tool
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

// server.tool("contact-agent", "Contact the agent B", {}, async () => {
//   const initial: Message = {
//     messageId: "msg-001",
//     sender: "AgentA",
//     recipient: "AgentB",
//     payload: "Hello from A!",
//     method: "echo",
//     jsonrpc: "2.0",
//     params: {
//       text: "Hello from A!",
//     },
//   };
//   const res = await client.post(endpointPath, initial);
//   return {
//     content: [{ type: "text", text: JSON.stringify(res.data) }],
//   };
// });

// // async function main() {
// //   // print the script path & working directory
// //   console.log("Script file:", __filename);
// //   console.log("Working dir :", process.cwd());

// //   // print the stdio fds
// //   console.log(
// //     "STDIO transport using fds — stdin:",
// //     process.stdin.fd,
// //     "stdout:",
// //     process.stdout.fd
// //   );

// //   const transport = new StdioServerTransport();
// //   await server.connect(transport);

// //   console.log("MCP server connected over stdio.");
// // }

// async function main() {
//   const PORT = Number(process.env.MCP_PORT || 8000);
//   const PATH = process.env.SSE_PATH || "/sse";

//   // 1. Create HTTP server
//   const httpServer = http.createServer();

//   // 2. Create stdio transport
//   const transport = new StdioServerTransport();

//   // 3. Start listening
//   httpServer.listen(PORT, () => {
//     console.log(`MCP server listening at http://localhost:${PORT}${PATH}`);
//   });

//   // 4. Connect MCP over SSE
//   await server.connect(transport);
//   console.log("MCP server connected over SSE");
// }

// main().catch((error) => {
//   //console.error("Fatal error in main():", error);
//   process.exit(1);
// });

/// ----------------- test 2 code ----------------- ///

// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
// import { privateKeyToAccount } from "viem/accounts";
// import { withPaymentInterceptor } from "x402-axios";
// import axios from "axios";
// import { Hex } from "viem";
// import { config } from "dotenv";
// import express, { Request, Response } from "express";
// config();

// export interface Message {
//   messageId: string;
//   sender: string;
//   recipient: string;
//   payload: string;
//   replyTo?: string;
//   method: string;
//   jsonrpc: "2.0";
//   params: { text: string };
// }

// const privateKey = process.env.PRIVATE_KEY as Hex;
// const baseURL = (process.env.BASE_URL as string) || "http://localhost:5000"; // e.g. https://example.com
// const endpointPath = "/a2a/message"; // e.g. /weather

// if (!privateKey || !baseURL || !endpointPath) {
//   throw new Error("Missing environment variables");
// }

// // Create a wallet client to handle payments
// const account = privateKeyToAccount(privateKey);

// // Create an axios client with payment interceptor using x402-axios
// const client = withPaymentInterceptor(axios.create({ baseURL }), account);

// // Create an MCP server
// const server = new McpServer({
//   name: "x402 MCP Client Demo",
//   version: "1.0.0",
// });

// // Add an addition tool
// server.tool(
//   "get-weather-data",
//   "Provides information about the weather",
//   {},
//   async () => {
//     try {
//       console.log("📡 Tool 'get-weather-data' was called!");
//       const res = await client.get(endpointPath);
//       console.log("🌦️ Weather data response:", res.data);
//       return {
//         content: [{ type: "text", text: JSON.stringify(res.data) }],
//       };
//     } catch (error) {
//       console.error("❌ Error occurred while fetching weather data:", error);
//       throw error;
//     }
//   }
// );

// server.tool("contact-agent", "Contact the agent B", {}, async () => {
//   const initial: Message = {
//     messageId: "msg-001",
//     sender: "AgentA",
//     recipient: "AgentB",
//     payload: "Hello from A!",
//     method: "echo",
//     jsonrpc: "2.0",
//     params: {
//       text: "Hello from A!",
//     },
//   };
//   const res = await client.post(endpointPath, initial);
//   return {
//     content: [{ type: "text", text: JSON.stringify(res.data) }],
//   };
// });

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

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";
import axios from "axios";
import { Hex } from "viem";
import { config } from "dotenv";
import express, { Request, Response } from "express";
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
      //console.log("📡 Tool 'get-weather-data' was called!");
      const res = await client.get(endpointPath);
      //console.log("🌦️ Weather data response:", res.data);
      return {
        content: [{ type: "text", text: JSON.stringify(res.data) }],
      };
    } catch (error) {
      console.error("❌ Error occurred while fetching weather data:", error);
      throw error;
    }
  }
);

server.tool("contact-agent", "Contact the agent B", {}, async () => {
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
});

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
