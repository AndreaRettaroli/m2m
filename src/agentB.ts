// agentB.ts

import express, { Request, Response } from "express";
import axios from "axios";
import { Message } from "./message";

const app = express();
app.use(express.json());

const AGENT_A_URL = "http://localhost:5000/message";

app.post("/message", async (req: Request, res: Response) => {
  const msg: Message = req.body;
  console.log(`[Agent B] Received:`, msg);

  if (!msg.replyTo) {
    const reply: Message = {
      messageId: "msg-002",
      sender: "AgentB",
      recipient: "AgentA",
      replyTo: msg.messageId,
      payload: `Got your message at B: ${msg.payload}`,
    };

    try {
      await axios.post(AGENT_A_URL, reply);
      console.log(`[Agent B] Sent reply to Agent A:`, reply);
    } catch (err) {
      console.error("[Agent B] Error sending reply to Agent A:", err);
    }
  }

  res.status(200).json({ status: "received" });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`[Agent B] Listening on http://localhost:${PORT}`);
});
