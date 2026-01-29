# 🚀 MCP App Starter Kit

A clean, production-ready starter template for building **Interactive MCP Apps** for Claude Desktop.

This starter kit implements the **Model Context Protocol (MCP)** with a focus on **Rich UI** components. It includes a "Markdown Fallback" mechanism to ensure a great user experience even on clients that don't support full interactive UIs (like Claude Free Tier).

## ✨ Features

*   **Interactive UI**: A beautiful, dark-themed HTML5 dashboard for visualizing data.
*   **Zero Dependencies**: The UI uses only inline CSS and SVG, ensuring it works in strict CSP environments.
*   **Markdown Fallback**: Automatically renders a rich markdown table/chart if the UI fails to load.
*   **Double Signal**: Advertises capabilities in both standard and experimental channels for maximum compatibility.
*   **TypeScript**: Fully typed server implementation.

## 📂 Project Structure

```
mcp-app-starter/
├── src/
│   ├── server.ts       # Main MCP server logic
│   └── dashboard.html  # The interactive UI file
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Usage

### 1. Install & Build

```bash
npm install
npm run build
```

### 2. Configure Claude Desktop

Add the following to your `claude_desktop_config.json` (typically found in `~/Library/Application Support/Claude/` on macOS):

```json
{
  "mcpServers": {
    "mcp-app-starter": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/mcp-app-starter/dist/server.js"
      ]
    }
  }
}
```
*Note: Replace `/ABSOLUTE/PATH/TO/...` with the actual full path to this directory.*

### 3. Run it!

1.  Restart Claude Desktop.
2.  Ask: **"Get market data for RELIANCE"**
3.  🎉 You should see either an **Interactive Dashboard** (if supported) or a **Rich Markdown Report**.

## 🧠 How it Works

1.  **Capability Advertisement**: The server tells Claude it supports `io.modelcontextprotocol/ui` during the initialization handshake.
2.  **Tool Execution**: When you call `get_market_data`, the server returns a result containing `_meta.ui.resourceUri` pointing to the dashboard.
3.  **Resource Fetch**: Claude's MCP client sees this URI and calls `resources/read` to fetch the HTML content.
4.  **Rendering**: Claude renders the HTML in a secure iframe (or displays the Markdown fallback if the feature is unavailable).

## 🛡️ "Markdown Fallback"

Newer versions of Claude Desktop, or Free Tier accounts, might not have the "MCP Apps" feature flag enabled. To solve this, this starter kit includes a clever fallback:

The tool response includes **both** the UI trigger logic AND a text-based Markdown representation of the data. If the client ignores the UI trigger, the user still sees the beautiful markdown table and ASCII charts!

---
*Created with ❤️ for the MCP Community.*
