import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { v4 as uuidv4 } from "uuid";
import { Hex } from "viem";
import { paymentMiddleware } from "x402-express";
import { config } from "dotenv";
import axios from "axios";

config();

// --- Configuration ---
const PORT = 5000;
const publicKey = process.env.PUBLIC_KEY as Hex;
console.log("🚀 ~ publicKey:", publicKey);

// --- Express App ---
const app = express();
app.use(bodyParser.json());

// 🛡️ x402 MIDDLEWARE
app.use(
  paymentMiddleware(
    publicKey,
    {
      "POST /weather": {
        price: "$0.001",
        network: "base-sepolia",
      },
      "POST /exchange": {
        price: "$0.002",
        network: "base-sepolia",
      },
    },
    {
      url: "https://x402.org/facilitator",
    }
  )
);

// ✅ Custom route (demo purpose)
// app.get("/weather", (req, res) => {
//   console.log("🚀 ~ api call to /weather");
//   res.send({
//     report: {
//       weather: "sunny",
//       temperature: 70,
//     },
//   });
// });

// ✅ Proxy /a2a/message to Python Hello World Agent

app.use(
  "/weather",
  createProxyMiddleware({
    target: "http://localhost:9999", // Python agent runs here
    changeOrigin: true,
    pathRewrite: { "^/weather": "/" }, // Optional: forward as root path
    selfHandleResponse: true,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // console.log("🚀 ~ req:", req);
        if (req.method === "POST") {
          const userMessage = "how much is 10 USD in INR?";

          const payload = {
            jsonrpc: "2.0",
            id: uuidv4(),
            method: "message/send",
            params: {
              message: {
                role: "user",
                parts: [
                  {
                    kind: "text",
                    text: userMessage,
                  },
                ],
                messageId: uuidv4(),
              },
            },
          };

          const bodyString = JSON.stringify(payload);

          // Set proper headers
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyString));

          // Overwrite the request stream with new body
          proxyReq.write(bodyString);
        }
      },
      proxyRes: (proxyRes, req, res) => {
        let body = Buffer.from("");

        proxyRes.on("data", (chunk) => {
          body = Buffer.concat([body, chunk]);
        });

        proxyRes.on("end", () => {
          try {
            const json = JSON.parse(body.toString("utf-8"));
            console.log("🚀 ~ proxyRes.on ~ json:", json);

            const text = json?.result?.parts?.[0]?.text;
            console.log("🚀 ~ proxyRes.on ~ text:", text);
            res.end(
              JSON.stringify({ text: json?.result?.parts[0]?.text || "" })
            );

            // if (typeof text === "string") {
            //   res.end(JSON.stringify(text));
            // } else {
            //   res.statusCode = 500;
            //   res.end(
            //     JSON.stringify({ error: "Invalid agent response format" })
            //   );
            // }
          } catch (err) {
            console.error("❌ Failed to parse agent response", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Failed to parse response" }));
          }
        });
      },
    },
  })
);

app.use(
  "/exchange",
  createProxyMiddleware({
    target: "http://localhost:10000", // Python agent runs here
    changeOrigin: true,
    pathRewrite: { "^/exchange": "/" }, // Optional: forward as root path
    selfHandleResponse: true,
    on: {
      proxyReq: (proxyReq, req: Request, res) => {
        console.log("🚀 ~ req:", req);
        if (req.method === "POST") {
          console.log("🚀 ~ req.body?.message:", req.body?.message);
          const userMessage = req.body?.message || "how much is 10 USD in INR?";

          const payload = {
            jsonrpc: "2.0",
            id: uuidv4(),
            method: "message/send",
            params: {
              message: {
                role: "user",
                parts: [
                  {
                    kind: "text",
                    text: userMessage,
                  },
                ],
                messageId: uuidv4(),
              },
            },
          };

          const bodyString = JSON.stringify(payload);

          // Set proper headers
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyString));

          // Overwrite the request stream with new body
          proxyReq.write(bodyString);
        }
      },
      proxyRes: (proxyRes, req, res) => {
        let body = Buffer.from("");

        proxyRes.on("data", (chunk) => {
          body = Buffer.concat([body, chunk]);
        });

        proxyRes.on("end", () => {
          try {
            const json = JSON.parse(body.toString("utf-8"));
            console.log("🚀 ~ proxyRes.on ~ json:", json);

            const text = json?.result?.status.message.parts?.[0]?.text;
            console.log("🚀 ~ proxyRes.on ~ text:", text);
            res.end(
              JSON.stringify({
                text: json?.result?.status.message.parts?.[0]?.text || "",
              })
            );

            // if (typeof text === "string") {
            //   res.end(JSON.stringify(text));
            // } else {
            //   res.statusCode = 500;
            //   res.end(
            //     JSON.stringify({ error: "Invalid agent response format" })
            //   );
            // }
          } catch (err) {
            console.error("❌ Failed to parse agent response", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Failed to parse response" }));
          }
        });
      },
    },
  })
);

// app.post("/weather", async (req: Request, res: Response) => {
//   const userMessage = "what is the weather like?"; // hardcoded for now

//   const payload = {
//     jsonrpc: "2.0",
//     id: uuidv4(),
//     method: "message/send",
//     params: {
//       message: {
//         role: "user",
//         parts: [
//           {
//             kind: "text",
//             text: userMessage,
//           },
//         ],
//         messageId: uuidv4(),
//       },
//     },
//   };

//   try {
//     const response = await axios.post("http://localhost:9999/", payload, {
//       headers: { "Content-Type": "application/json" },
//     });
//     console.log("🚀 ~ app.post ~ response:", response);

//     console.log("✅ Sent message to Python agent.");
//     if (response.data.result.parts && response.data.result.parts.length > 0) {
//       console.log(
//         "🚀 ~ app.get ~ response.data:",
//         response.data.result.parts[0].text
//       );
//       res.json(response.data.result.parts[0].text);
//     } else {
//       res.json({ message: "No response from agent" });
//     }

//     //{"id":"11afdb3a-d555-4701-9fac-066a09e96952","jsonrpc":"2.0","result":{"kind":"message","messageId":"bcc90ead-a178-42fb-9300-fed8a4d8aa6b","parts":[{"kind":"text","text":"Hello World"}],"role":"agent"}}
//   } catch (error: any) {
//     console.error("❌ Failed to send message:", error.message);
//     res.status(500).json({ error: "Failed to reach Python backend" });
//   }
// });

// Fallback route
app.use((req: Request, res: Response) => {
  res.status(404).send("Not found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`x402 middleware listening at http://localhost:${PORT}`);
});
