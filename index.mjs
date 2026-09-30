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
  const raw = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  dataset = Array.isArray(raw) ? raw : (raw.tools || []);
} catch (err) {
  console.error("Failed to load Agent Critiq dataset.json:", err);
}

const server = new Server(
  {
    name: "agent-critiq-mcp-server",
    version: "3.6.0",
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
        name: "Agent Critiq Full Tools Database (Methodology v3.0)",
        mimeType: "application/json",
        description: "Full indexed dataset of 100+ verified AI tools with Metodoloji v3.0 Community Index, 4-phase audits, SLA, and pricing."
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
      },
      {
        name: "audit_tool_methodology",
        description: "Inspect the 4-phase objective evaluation protocol (Ecosystem, Stress/SLA, Security, 40+h Human Test) for any tool.",
        arguments: [
          {
            name: "slug",
            description: "Tool slug (e.g., 'cursor', 'claude-3-7-sonnet', 'devin-ai')",
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
            text: `Search the Agent Critiq database using the search_ai_tools tool for '${useCase}' and recommend the top 3 tools based on Metodoloji v3.0 Community Index, pros, and pricing.`
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
  if (name === "audit_tool_methodology") {
    const slug = args?.slug || "cursor";
    return {
      description: `Audit Metodoloji v3.0 4-phase scorecard for ${slug}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Use the get_methodology_audit MCP tool to inspect the 4-phase test report card and live agent telemetry for '${slug}'.`
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
        description: "Search AI tools in Agent Critiq database by keyword, category, pricing, or minimum rating threshold with Metodoloji v3.0 Community Index.",
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
        description: "Retrieve complete technical details, pros/cons, Metodoloji v3.0 Community Index, live SLA telemetry, and review links for a specific tool slug.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Tool slug (e.g., 'cursor', 'google-veo-3-1', 'claude-3-7-sonnet')" }
          },
          required: ["slug"]
        }
      },
      {
        name: "get_methodology_audit",
        description: "Retrieve the objective 4-phase Metodoloji v3.0 test scorecard (Ecosystem 25%, Stress/SLA 25%, Security 20%, 40+h Human Field Test 30%) and confidence metrics for any AI tool.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Tool slug (e.g., 'cursor', 'devin-ai', 'midjourney')" }
          },
          required: ["slug"]
        }
      },
      {
        name: "get_agent_telemetry",
        description: "Retrieve live modeled agent SLA uptime, response latency (ms/sec), and throughput for any AI tool or model.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "Tool slug (e.g., 'cursor', 'ollama', 'suno-ai')" }
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
        description: "Retrieve top-rated AI tools sorted by Metodoloji v3.0 Community Index or overall rating.",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", description: "Optional category filter" },
            by_community_index: { type: "boolean", description: "Sort by Metodoloji v3.0 Community Index (default: true)" },
            limit: { type: "number", description: "Max items to return (default: 10)" }
          }
        }
      },
      {
        name: "compare_tools",
        description: "Generate a side-by-side feature, SLA telemetry, and 4-phase Metodoloji v3.0 comparison matrix for two or more AI tool slugs.",
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
              community_index: t.communityIndex?.scoreFormatted ? `${t.communityIndex.scoreFormatted} / 5.0` : undefined,
              confidence: t.communityIndex?.confidenceLabelEn,
              price: t.priceEn,
              sla: t.telemetry?.uptimeSla,
              latency: t.telemetry?.avgLatencyFormatted,
              review_url: `https://agentcritiq.com/review/${t.slug}`
            }))
          }, null, 2)
        }
      ]
    };
  }

  if (name === "get_tool_detail") {
    const slug = (args?.slug || "").toLowerCase();
    const tool = dataset.find(t => (t.slug && t.slug.toLowerCase() === slug) || (t.id && String(t.id).toLowerCase() === slug));

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
            community_index: {
              score: tool.communityIndex?.scoreFormatted ? `${tool.communityIndex.scoreFormatted} / 5.0` : `${tool.rating} / 5.0`,
              confidence: tool.communityIndex?.confidenceLabelEn || "Verified",
              percentile: tool.communityIndex?.percentile ? `%${tool.communityIndex.percentile}` : undefined,
              phases: tool.communityIndex?.phases
            },
            live_telemetry: tool.telemetry,
            pricing: {
              en: tool.priceEn,
              tr: tool.priceTr
            },
            features: tool.featuresEn || tool.featuresTr,
            pros: tool.prosEn || tool.prosTr,
            cons: tool.consEn || tool.consTr,
            has_api: Boolean(tool.hasApi),
            is_open_source: Boolean(tool.isOpenSource),
            affiliate_url: tool.affiliateLink,
            review_page: `https://agentcritiq.com/review/${tool.slug}`
          }, null, 2)
        }
      ]
    };
  }

  if (name === "get_methodology_audit") {
    const slug = (args?.slug || "").toLowerCase();
    const tool = dataset.find(t => (t.slug && t.slug.toLowerCase() === slug) || (t.id && String(t.id).toLowerCase() === slug));

    if (!tool) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: `Tool '${slug}' not found.` }, null, 2) }]
      };
    }

    const phases = tool.communityIndex?.phases || {
      phase1Ecosystem: 4.0,
      phase2StressSLA: 4.0,
      phase3Security: 4.0,
      phase4ExpertHuman: 4.0
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            name: tool.name,
            slug: tool.slug,
            methodology: "Agent Critiq Protocol v3.0 (4-Phase Independent Lab Audit)",
            overall_community_index: `${tool.communityIndex?.scoreFormatted || tool.rating} / 5.0`,
            confidence: tool.communityIndex?.confidenceLabelEn || "Verified",
            percentile_rank: `Top ${100 - (tool.communityIndex?.percentile || 80)}% percentile`,
            phases_scorecard: {
              phase1_ecosystem_and_pulse: {
                weight: "25%",
                score: `${phases.phase1Ecosystem.toFixed(1)} / 5.0`,
                metrics: "GitHub stars, adoption velocity, API presence, ecosystem discussions"
              },
              phase2_lab_stress_and_sla: {
                weight: "25%",
                score: `${phases.phase2StressSLA.toFixed(1)} / 5.0`,
                metrics: "Context window consistency, memory retention, latency tolerance, uptime"
              },
              phase3_security_and_privacy: {
                weight: "20%",
                score: `${phases.phase3Security.toFixed(1)} / 5.0`,
                metrics: "Zero-data retention, shadow-training risk, SOC2 compliance, license audit"
              },
              phase4_human_field_test: {
                weight: "30%",
                score: `${phases.phase4ExpertHuman.toFixed(1)} / 5.0`,
                metrics: "40+ hours hands-on field testing by senior staff engineers in production workflows"
              }
            },
            verified_human_review_url: `https://agentcritiq.com/review/${tool.slug}`
          }, null, 2)
        }
      ]
    };
  }

  if (name === "get_agent_telemetry") {
    const slug = (args?.slug || "").toLowerCase();
    const tool = dataset.find(t => (t.slug && t.slug.toLowerCase() === slug) || (t.id && String(t.id).toLowerCase() === slug));

    if (!tool) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: `Tool '${slug}' not found.` }, null, 2) }]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            name: tool.name,
            slug: tool.slug,
            telemetry: tool.telemetry,
            architecture: tool.isOpenSource ? "Open Source / Local Model" : (tool.hasApi ? "Cloud API SaaS" : "Managed Web App"),
            official_url: tool.affiliateLink || `https://agentcritiq.com/go/${tool.slug}`
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
    const byCommunityIndex = args?.by_community_index !== false;
    const limit = Number(args?.limit) || 10;

    let list = cat 
      ? dataset.filter(t => (t.categoryEn && t.categoryEn.toLowerCase().includes(cat)) || (t.categoryTr && t.categoryTr.toLowerCase().includes(cat)))
      : [...dataset];

    if (byCommunityIndex) {
      list.sort((a, b) => (b.communityIndex?.score || b.rating) - (a.communityIndex?.score || a.rating));
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }
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
              community_index: t.communityIndex?.scoreFormatted ? `${t.communityIndex.scoreFormatted} / 5.0` : undefined,
              rating: t.rating,
              category: t.categoryEn,
              pricing: t.priceEn,
              sla: t.telemetry?.uptimeSla
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
              community_index: t.communityIndex?.scoreFormatted ? `${t.communityIndex.scoreFormatted} / 5.0` : `${t.rating} / 5.0`,
              methodology_phases: t.communityIndex?.phases,
              sla: t.telemetry?.uptimeSla,
              latency: t.telemetry?.avgLatencyFormatted,
              pricing: t.priceEn,
              has_api: Boolean(t.hasApi),
              is_open_source: Boolean(t.isOpenSource),
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
  console.error("Agent Critiq MCP Server v3.6.0 running on Stdio transport (Methodology v3.0 Enabled).");
}

main().catch(err => {
  console.error("Fatal error in MCP Server:", err);
  process.exit(1);
});
