import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const datasetPath = path.join(__dirname, 'dataset.json');
let dataset = [];

try {
  dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
} catch (err) {
  console.error("Failed to load Agent Critiq dataset.json:", err);
}

const server = new Server(
  {
    name: "agent-critiq-mcp-server",
    version: "3.5.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    },
  }
);

// Register MCP Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "agentcritiq://dataset/tools.json",
        name: "Agent Critiq Full Tools Database",
        mimeType: "application/json",
        description: "Full indexed dataset of 100+ verified AI tools with ratings, pros, cons, and pricing."
      },
      {
        uri: "agentcritiq://dataset/categories.json",
        name: "Agent Critiq Software Categories",
        mimeType: "application/json",
        description: "List of all active software categories and tool distribution."
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri === "agentcritiq://dataset/tools.json") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(dataset, null, 2)
        }
      ]
    };
  }
  if (uri === "agentcritiq://dataset/categories.json") {
    const categoriesMap = {};
    dataset.forEach(tool => {
      const cat = tool.categoryEn || "Uncategorized";
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(categoriesMap, null, 2)
        }
      ]
    };
  }
  throw new Error(`Resource not found: ${uri}`);
});

// Register MCP Prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "recommend_ai_tool",
        description: "Prompt template to get personalized AI tool recommendations from Agent Critiq database.",
        arguments: [
          {
            name: "use_case",
            description: "Describe what task or workflow you need an AI tool for (e.g., 'coding assistant', 'video generation').",
            required: true
          }
        ]
      },
      {
        name: "compare_ai_tools",
        description: "Prompt template to compare two or more AI agents or software side by side.",
        arguments: [
          {
            name: "tools_to_compare",
            description: "Comma-separated tool names or slugs to compare (e.g. 'cursor, claude-code').",
            required: true
          }
        ]
      }
    ]
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "recommend_ai_tool") {
    const useCase = args?.use_case || "AI task";
    return {
      description: `Personalized AI tool recommendation for: ${useCase}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Search the Agent Critiq database using the search_ai_tools tool for '${useCase}' and recommend the top 3 tools based on rating, pros, and pricing.`
          }
        }
      ]
    };
  }
  if (name === "compare_ai_tools") {
    const toolsStr = args?.tools_to_compare || "cursor, claude-code";
    const slugs = toolsStr.split(',').map(s => s.trim());
    return {
      description: `Detailed comparison matrix for ${toolsStr}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Use the compare_tools MCP tool to generate a side-by-side comparison matrix for these slugs: ${JSON.stringify(slugs)}.`
          }
        }
      ]
    };
  }
  throw new Error(`Prompt not found: ${name}`);
});

// Register available MCP tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_ai_tools",
        description: "Search AI tools in Agent Critiq database by keyword, category, pricing, or minimum rating threshold.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search keyword (e.g. 'coding assistant', 'video generator', 'free logo')" },
            category: { type: "string", description: "Specific category name (e.g. 'Coding & Dev Agents', 'Video Generation')" },
            min_rating: { type: "number", description: "Minimum rating threshold (1.0 - 5.0)" },
            free_only: { type: "boolean", description: "Filter for free or freemium tools" },
            limit: { type: "number", description: "Maximum number of results to return (default: 10)" }
          }
        }
      },
      {
        name: "get_tool_detail",
        description: "Retrieve complete technical details, pros/cons, ratings, features, and review links for a specific tool slug.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Tool slug (e.g., 'cursor', 'google-veo-3-1', 'claude-3-5-sonnet')" }
          },
          required: ["slug"]
        }
      },
      {
        name: "list_categories",
        description: "List all active software categories and total tool counts in Agent Critiq.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_top_rated",
        description: "Retrieve top-rated AI tools sorted by Agent Critiq overall rating.",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", description: "Optional category filter" },
            limit: { type: "number", description: "Max items to return (default: 10)" }
          }
        }
      },
      {
        name: "compare_tools",
        description: "Generate a side-by-side feature and rating comparison matrix for two or more AI tool slugs.",
        inputSchema: {
          type: "object",
          properties: {
            slugs: {
              type: "array",
              items: { type: "string" },
              description: "Array of tool slugs to compare (e.g. ['cursor', 'claude-code', 'zed-ai'])"
            }
          },
          required: ["slugs"]
        }
      }
    ]
  };
});

// Tool Handlers Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "search_ai_tools") {
    const q = (args?.query || "").toLowerCase();
    const category = (args?.category || "").toLowerCase();
    const minRating = Number(args?.min_rating) || 0;
    const freeOnly = Boolean(args?.free_only);
    const limit = Number(args?.limit) || 10;

    let filtered = dataset.filter(tool => {
      const matchQ = !q || 
        tool.name.toLowerCase().includes(q) ||
        (tool.descriptionEn && tool.descriptionEn.toLowerCase().includes(q)) ||
        (tool.descriptionTr && tool.descriptionTr.toLowerCase().includes(q)) ||
        (tool.categoryEn && tool.categoryEn.toLowerCase().includes(q)) ||
        (tool.tagsEn && tool.tagsEn.some(t => t.toLowerCase().includes(q)));

      const matchCat = !category || (tool.categoryEn && tool.categoryEn.toLowerCase().includes(category)) || (tool.categoryTr && tool.categoryTr.toLowerCase().includes(category));
      const matchRating = tool.rating >= minRating;
      const matchFree = !freeOnly || tool.noCreditCard || (tool.priceEn && tool.priceEn.toLowerCase().includes('free'));

      return matchQ && matchCat && matchRating && matchFree;
    });

    filtered = filtered.slice(0, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            total_found: filtered.length,
            tools: filtered.map(t => ({
              name: t.name,
              slug: t.slug,
              category: t.categoryEn,
              rating: t.rating,
              price: t.priceEn,
              description: t.descriptionEn,
              review_url: `https://agentcritiq.com/review/${t.slug}`
            }))
          }, null, 2)
        }
      ]
    };
  }

  if (name === "get_tool_detail") {
    const slug = (args?.slug || "").toLowerCase();
    const tool = dataset.find(t => t.slug.toLowerCase() === slug || t.id.toLowerCase() === slug);

    if (!tool) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: `Tool with slug '${slug}' not found in Agent Critiq database.` }, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            name: tool.name,
            slug: tool.slug,
            category: tool.categoryEn,
            rating: tool.rating,
            reviews_count: tool.reviews,
            pricing: {
              en: tool.priceEn,
              tr: tool.priceTr
            },
            features: tool.featuresEn || tool.featuresTr,
            pros: tool.prosEn || tool.prosTr,
            cons: tool.consEn || tool.consTr,
            affiliate_url: tool.affiliateLink,
            review_page: `https://agentcritiq.com/review/${tool.slug}`
          }, null, 2)
        }
      ]
    };
  }

  if (name === "list_categories") {
    const categoriesMap = {};
    dataset.forEach(tool => {
      const cat = tool.categoryEn || "Uncategorized";
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            total_tools: dataset.length,
            total_categories: Object.keys(categoriesMap).length,
            categories: Object.entries(categoriesMap).map(([name, count]) => ({ name, count }))
          }, null, 2)
        }
      ]
    };
  }

  if (name === "get_top_rated") {
    const cat = (args?.category || "").toLowerCase();
    const limit = Number(args?.limit) || 10;

    let list = cat 
      ? dataset.filter(t => (t.categoryEn && t.categoryEn.toLowerCase().includes(cat)) || (t.categoryTr && t.categoryTr.toLowerCase().includes(cat)))
      : [...dataset];

    list.sort((a, b) => b.rating - a.rating);
    list = list.slice(0, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            count: list.length,
            tools: list.map(t => ({
              name: t.name,
              slug: t.slug,
              rating: t.rating,
              category: t.categoryEn,
              pricing: t.priceEn
            }))
          }, null, 2)
        }
      ]
    };
  }

  if (name === "compare_tools") {
    const slugs = Array.isArray(args?.slugs) ? args.slugs.map(s => String(s).toLowerCase()) : [];
    const tools = dataset.filter(t => (t.slug && slugs.includes(t.slug.toLowerCase())) || (t.id && slugs.includes(String(t.id).toLowerCase())));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            comparison_count: tools.length,
            tools: tools.map(t => ({
              name: t.name,
              slug: t.slug,
              rating: t.rating,
              pricing: t.priceEn,
              has_api: t.hasApi,
              is_open_source: t.isOpenSource,
              features: t.featuresEn || t.featuresTr,
              pros: t.prosEn || t.prosTr,
              cons: t.consEn || t.consTr
            }))
          }, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown MCP tool handler: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agent Critiq MCP Server running on Stdio transport.");
}

main().catch(err => {
  console.error("Fatal error in MCP Server:", err);
  process.exit(1);
});
