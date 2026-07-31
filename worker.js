/**
 * Agent Critiq MCP Server — Cloudflare Workers Edition
 * HTTP/JSON-RPC based MCP server for Cloudflare Workers deployment.
 * Compatible with Smithery, Claude Desktop (remote), and any MCP HTTP client.
 *
 * GitHub: https://github.com/dobby-1/agent-critiq
 * Website: https://agentcritiq.com
 */

import dataset from "./agent-critiq-2026-dataset.json";

const tools = dataset.tools;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function norm(str = "") {
  return str.toLowerCase().trim();
}

function summary(t) {
  return {
    name: t.name,
    slug: t.slug || t.id,
    category: t.category,
    description: t.description,
    price: t.price,
    rating: t.rating,
    reviewUrl: t.reviewUrl,
    officialUrl: t.officialUrl,
    tags: t.tags || [],
    isSponsored: t.isSponsored || false,
  };
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

function searchAiTools({ query, category, min_rating, free_only, limit = 10 }) {
  let res = [...tools];
  if (query) {
    const q = norm(query);
    res = res.filter(
      (t) =>
        norm(t.name).includes(q) ||
        norm(t.description || "").includes(q) ||
        (t.tags || []).some((tag) => norm(tag).includes(q)) ||
        norm(t.category || "").includes(q)
    );
  }
  if (category) res = res.filter((t) => norm(t.category || "").includes(norm(category)));
  if (min_rating != null) res = res.filter((t) => (t.rating || 0) >= Number(min_rating));
  if (free_only) res = res.filter((t) => norm(t.price || "").includes("free"));
  res.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return res.slice(0, Math.min(limit, 50)).map(summary);
}

function getToolDetail({ slug }) {
  if (!slug) return null;
  const s = norm(slug);
  return (
    tools.find((t) => norm(t.slug || t.id) === s) ||
    tools.find((t) => norm(t.name) === s) ||
    tools.find((t) => norm(t.slug || t.id).includes(s) || norm(t.name).includes(s)) ||
    null
  );
}

function listCategories() {
  const map = {};
  for (const t of tools) {
    const c = t.category || "Uncategorised";
    map[c] = (map[c] || 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ category: name, tool_count: count }));
}

function getTopRated({ category, limit = 10 }) {
  let res = [...tools];
  if (category) res = res.filter((t) => norm(t.category || "").includes(norm(category)));
  res.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return res.slice(0, limit).map(summary);
}

function compareTools({ slugs }) {
  if (!Array.isArray(slugs) || slugs.length < 2)
    return { error: "Provide at least 2 slugs." };
  const found = slugs.map((s) => getToolDetail({ slug: s })).filter(Boolean);
  if (!found.length) return { error: "No matching tools found." };
  const comparison = {};
  for (const f of ["name", "category", "price", "rating", "description"]) {
    comparison[f] = Object.fromEntries(found.map((t) => [t.name, t[f]]));
  }
  comparison.reviewLinks = Object.fromEntries(found.map((t) => [t.name, t.reviewUrl]));
  return { tools_compared: found.length, comparison };
}

// ---------------------------------------------------------------------------
// MCP tool definitions (for tools/list)
// ---------------------------------------------------------------------------

const MCP_TOOLS = [
  {
    name: "search_ai_tools",
    description: "Search Agent Critiq's database of 100+ AI tools by keyword, category, rating, or free-only pricing.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword to search tool names, descriptions, tags." },
        category: { type: "string", description: "Category filter (partial match). E.g. 'Coding & Dev Agents'." },
        min_rating: { type: "number", description: "Minimum rating (0–5)." },
        free_only: { type: "boolean", description: "Only return free/freemium tools." },
        limit: { type: "number", description: "Max results. Default 10, max 50." },
      },
    },
  },
  {
    name: "get_tool_detail",
    description: "Get full details for a specific AI tool by slug or name.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Tool slug or name. E.g. 'cursor', 'midjourney'." },
      },
      required: ["slug"],
    },
  },
  {
    name: "list_categories",
    description: "List all AI tool categories with tool counts.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_top_rated",
    description: "Get highest-rated AI tools overall or within a category.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Optional category filter." },
        limit: { type: "number", description: "Number of results. Default 10." },
      },
    },
  },
  {
    name: "compare_tools",
    description: "Compare 2–3 AI tools side-by-side across pricing, rating, and description.",
    inputSchema: {
      type: "object",
      properties: {
        slugs: { type: "array", items: { type: "string" }, description: "Array of 2–3 tool slugs." },
      },
      required: ["slugs"],
    },
  },
];

// ---------------------------------------------------------------------------
// MCP JSON-RPC dispatcher
// ---------------------------------------------------------------------------

function handleMcp(body) {
  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== "2.0") {
    return { jsonrpc: "2.0", id, error: { code: -32600, message: "Invalid JSON-RPC version" } };
  }

  try {
    if (method === "initialize") {
      return {
        jsonrpc: "2.0", id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "agent-critiq-mcp", version: "1.0.0" },
        },
      };
    }

    if (method === "tools/list") {
      return { jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } };
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params;
      let result;

      switch (name) {
        case "search_ai_tools":    result = searchAiTools(args || {}); break;
        case "get_tool_detail": {
          const t = getToolDetail(args || {});
          result = t ? summary(t) : `No tool found for "${args?.slug}"`;
          break;
        }
        case "list_categories":   result = listCategories(); break;
        case "get_top_rated":     result = getTopRated(args || {}); break;
        case "compare_tools":     result = compareTools(args || {}); break;
        default:
          return { jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown tool: ${name}` } };
      }

      return {
        jsonrpc: "2.0", id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
      };
    }

    if (method === "notifications/initialized") {
      return null; // notification, no response needed
    }

    return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };

  } catch (err) {
    return { jsonrpc: "2.0", id, error: { code: -32603, message: err.message } };
  }
}

// ---------------------------------------------------------------------------
// Cloudflare Worker entry point
// ---------------------------------------------------------------------------

export default {
  async fetch(request) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Health check / info
    if (url.pathname === "/" || url.pathname === "/health") {
      return Response.json(
        {
          name: "Agent Critiq MCP Server",
          version: "1.0.0",
          description: "Official MCP server for agentcritiq.com — 101 AI tools database",
          tools: MCP_TOOLS.length,
          endpoint: "/mcp",
          website: "https://agentcritiq.com",
          github: "https://github.com/dobby-1/agent-critiq",
        },
        { headers: corsHeaders }
      );
    }

    // MCP endpoint
    if (url.pathname === "/mcp" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return Response.json(
          { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
          { status: 400, headers: corsHeaders }
        );
      }

      const response = handleMcp(body);
      if (response === null) {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      return Response.json(response, { headers: corsHeaders });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
