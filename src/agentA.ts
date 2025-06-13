// agentA.ts

import express, { Request, Response } from "express";
import axios from "axios";
import { Message } from "./message";

const app = express();
app.use(express.json());

const AGENT_B_URL = "http://localhost:5001/message";
let hasSentInitial = false;

app.post("/message", async (req: Request, res: Response) => {
  const msg: Message = req.body;
  console.log(`[Agent A] Received:`, msg);

  if (!msg.replyTo) {
    const reply: Message = {
      messageId: "msg-002",
      sender: "AgentA",
      recipient: "AgentB",
      replyTo: msg.messageId,
      payload: `Echo at A: ${msg.payload}`,
    };

    try {
      await axios.post(AGENT_B_URL, reply);
      console.log(`[Agent A] Sent reply to Agent B:`, reply);
    } catch (err) {
      console.error("[Agent A] Error sending reply to Agent B:", err);
    }
  }

  return res.status(200).json({ status: "received" });
});

async function sendInitialMessage() {
  if (hasSentInitial) return;

  const initial: Message = {
    messageId: "msg-001",
    sender: "AgentA",
    recipient: "AgentB",
    payload: "Hello from A!",
  };

  try {
    await axios.post(AGENT_B_URL, initial);
    hasSentInitial = true;
    console.log(`[Agent A] Sent initial message to Agent B:`, initial);
  } catch (err) {
    console.error("[Agent A] Failed to send initial message to Agent B:", err);
  }
}

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[Agent A] Listening on http://localhost:${PORT}`);
  setTimeout(sendInitialMessage, 1000);
});
