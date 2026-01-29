import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DASHBOARD_PATH = join(__dirname, "dashboard.html");
const RESOURCE_URI = "ui://mcp-app-starter/dashboard";
const RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";

// Initialize Server
const server = new Server(
    {
        name: "mcp-app-starter",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
            resources: {},
            // Advertise UI capability (Standard)
            // @ts-ignore
            extensions: {
                "io.modelcontextprotocol/ui": {}
            },
            // Advertise UI capability (Experimental - for broader compatibility)
            experimental: {
                "io.modelcontextprotocol/ui": {}
            }
        }
    }
);

/**
 * Tool Listing
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_market_data",
                description: "Get market data and show interactive dashboard",
                inputSchema: {
                    type: "object",
                    properties: {
                        symbol: { type: "string", default: "RELIANCE" }
                    }
                },
                _meta: {
                    ui: { resourceUri: RESOURCE_URI },
                    "ui/resourceUri": RESOURCE_URI // Legacy/Flat format support
                }
            }
        ]
    };
});

/**
 * Tool Execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "get_market_data") {
        throw new Error(`Tool not found: ${request.params.name}`);
    }

    const symbol = (request.params.arguments?.symbol as string) || "RELIANCE";

    // Markdown Fallback for clients without UI support (e.g. Claude Free Tier)
    const markdownFallback = `
# 📈 ${symbol} (NSE)
**₹2,551.40**   🟢 +1.24%
*Live Market Data • As of ${new Date().toLocaleTimeString()}*

---

### 📊 Performance
| Metric | Value |
| :--- | :--- |
| **Open** | ₹2,525.00 |
| **High** | ₹2,558.00 |
| **Low** | ₹2,512.60 |
| **Vol** | 4.2M |

> 💡 **Tip:** An interactive dashboard is available for this data if your client supports MCP Apps.
`;

    return {
        content: [{
            type: "text",
            text: markdownFallback
        }],
        _meta: {
            ui: { resourceUri: RESOURCE_URI },
            "ui/resourceUri": RESOURCE_URI
        }
    };
});

/**
 * Resource Listing
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: RESOURCE_URI,
                name: "Market Dashboard",
                mimeType: RESOURCE_MIME_TYPE,
                description: "Interactive market data dashboard"
            }
        ]
    };
});

/**
 * Resource Reading (Serve the HTML)
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    if (uri !== RESOURCE_URI) {
        throw new Error(`Resource not found: ${uri}`);
    }

    let html: string;
    try {
        // In production, you might want to bundle this string or use a robust path resolver
        // For this starter, we assume dashboard.html is next to the built server.js
        html = readFileSync(DASHBOARD_PATH.replace("dist/", "src/"), "utf-8");
        // Fallback if running from src directly with tsx (path adjustment)
        if (!html) html = readFileSync(DASHBOARD_PATH, "utf-8");
    } catch (e) {
        console.error("Failed to read dashboard.html", e);
        html = "<h1>Error: Dashboard file not found</h1>";
    }

    return {
        contents: [{
            uri: RESOURCE_URI,
            mimeType: RESOURCE_MIME_TYPE,
            text: html
        }]
    };
});

/**
 * Server Startup
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP App Starter Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
