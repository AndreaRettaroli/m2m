import express, { Request } from "express";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import { v4 as uuidv4 } from "uuid";
import { Hex } from "viem";
import { paymentMiddleware } from "x402-express";
import { config } from "dotenv";

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
    target: "http://localhost:10000",
    changeOrigin: true,
    pathRewrite: { "^/exchange": "/" },
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

// Start the server
app.listen(PORT, () => {
  console.log(`x402 middleware listening at http://localhost:${PORT}`);
});
