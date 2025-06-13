import express from "express";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import { Hex } from "viem";

import { paymentMiddleware, Network } from "x402-express";

// Load agent metadata from JSON file
// const agentCard = JSON.parse(
//   fs.readFileSync(
//     path.join(__dirname, "..", "public", "./well-known", "agent.json"),
//     "utf8"
//   )
// );
// --- Configuration ---
const PORT = 3000;
// const HOST: string = process.env.HOST || "0.0.0.0";
const privateKey = process.env.PRIVATE_KEY as Hex;

// --- Express App ---
const app = express();
app.use(bodyParser.json());

// // 1. Serve the Agent Card at /.well-known/agent.json
// app.get("/.well-known/agent.json", (req: Request, res: Response) => {
//   res.setHeader("Content-Type", "application/json");
//   res.send(agentCard);
// });

// MIDDLEWARE
app.use(
  paymentMiddleware(
    privateKey, // your receiving wallet address
    {
      // Route configurations for protected endpoints
      "GET /weather": {
        // USDC amount in dollars
        price: "$0.001",
        network: "base-sepolia",
      },
      "POST /a2a/message": {
        // USDC amount in dollars
        price: "$0.001",
        network: "base-sepolia",
      },
    },
    {
      url: "https://x402.org/facilitator", // Facilitator URL for Base Sepolia testnet.
    }
  )
);
// Implement your route
app.get("/weather", (req, res) => {
  res.send({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  });
});
// 2. A2A Message Endpoint
//    According to the A2A spec, messages use JSON-RPC 2.0 over HTTP POST
app.post("/a2a/message", (req: Request, res: Response) => {
  const message = req.body;
  console.log("🚀 ~ app.post ~ message:", message);

  // Basic JSON-RPC 2.0 validation
  if (
    !message.jsonrpc ||
    message.jsonrpc !== "2.0" ||
    !message.method ||
    !message.id
  ) {
    res.status(400).json({
      jsonrpc: "2.0",
      id: message.id || null,
      error: { code: -32600, message: "Invalid Request" },
    });
  }

  // Handle a single skill: `echo`
  if (message.method === "echo") {
    const text = message.params && message.params.text;
    if (typeof text !== "string") {
      res.status(400).json({
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32602,
          message: "Invalid params: expected { text: string }",
        },
      });
    }

    // Respond with the same text
    res.json({
      jsonrpc: "2.0",
      id: message.id,
      result: {
        echoed: text,
      },
    });
  } else {
    // Method not found

    res.status(404).json({
      jsonrpc: "2.0",
      id: message.id,
      error: { code: -32601, message: "Method not found" },
    });
  }
});

// 3. Fallback for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).send("Not found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`A2A Agent listening at http://localhost:${PORT}`);
});
