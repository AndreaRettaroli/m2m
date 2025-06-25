## Machine 2 Machine Protocol

This proof-of-concept (PoC) project demonstrates autonomous economic interactions between AI Agents, modeled as services. In this architecture, agents can request tasks from other agents based on their domain expertise and reword them via x402 payments. It is a practical implementation of a Machine-to-Machine (M2M) economy, where agents interact using emerging protocols like Google's Agent-to-Agent (A2A) and x402, running on top of MCP and Base network.

![m22](./images/Frame%209.png)

The implementation relies on the following technical stack:

### A2A (Agent-to-Agent) Protocol

A2A is an open-source framework from Google that enables autonomous AI agents to discover, communicate, and collaborate securely. It provides a standardized protocol for agents, even those built on different platforms, to negotiate capabilities, delegate tasks, and coordinate actions. This creates an interoperable ecosystem where specialized agents can work together to automate complex workflows and solve problems more effectively.

### MCP (Model Context Protocol)

MCP is an open standard from Anthropic that serves as the semantic backbone for AI systems. It standardizes how agents connect to external data sources and tools, acting as a universal "connector" that gives an agent secure, on-demand access to the context it needs—whether from a database, a file system, or a third-party API. MCP ensures that agents operate with a shared, coherent understanding of the information and capabilities required to execute tasks accurately.

### x402 Payments Protocol

The x402 protocol is an open standard from Coinbase for internet-native payments, designed for both humans and autonomous AI agents. It leverages the standard HTTP 402 Payment Required status code to create a seamless, low-friction way to pay for API calls, data access, or services rendered by other agents. Built to be chain-agnostic and trust-minimizing, x402 enables on-chain micropayments without the overhead of traditional financial systems, paving the way for a programmable economy where agents can autonomously transact for services.

### How to Setup

1. Start the Gemini Agent that can provide fiat currency exchange:

```
cd agents/langgraph
```
create docker build:
```
docker build -t langgraph-a2a-server -f Containerfile . 
```
run docker build:
```
docker run -p 10000:10000 -e GOOGLE_API_KEY=<your-gemini-api-key> langgraph-a2a-server
```

2. Start the proxy middleware:
Python implementation of x402 was released couple of days ago, we had to create a typescript wrapper to manage it. 

In the main folder run:

```
npm instal
```
and
```
npm run dev
```

3. Just use Claude or Cursor as the Second Agent/Chatbot that has to interact via the first Agent:

open `claude_desktop_config.json` and attach the mcp server via adding this configuration:

```
{
  "mcpServers": {
    "demo": {
      "command": "/Users/your-user/.nvm/versions/node/v23.3.0/bin/npm",
      "args": [
        "--silent",
        "run",
        "dev",
        "-C",
        "/Users/your-user/m2m/mcp"
      ],
      "env": {
        "PRIVATE_KEY": "your-wallet-private-key",
        "RESOURCE_SERVER_URL": "http://localhost:5000",
      }
    }
  }
}
```

ask Claude about a currency exchange like:  `how much is 10 USD in EUR?`

![result](./images/Screenshot%202025-06-16%20at%2000.04.42.png)



### Conclusions

This proof-of-concept demonstrates the viability of a fully autonomous Machine-to-Machine economy by combining the interoperable, lightweight, chain-agnostic x402 payments standard with A2A communication framework and the context-rich MCP connector. Through this implementation, AI agents can dynamically discover one another’s capabilities, delegate tasks based on domain expertise, and settle micropayments seamlessly—paving the way for a scalable ecosystem of specialized Agents that offer and consume services operating as autonomous economic participants.
