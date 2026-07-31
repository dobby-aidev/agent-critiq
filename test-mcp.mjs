import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function runTest() {
  console.log("Starting Stdio MCP Server Client Test...");

  const transport = new StdioClientTransport({
    command: "node",
    args: ["c:/Users/ferda/Desktop/Agent Critiq/mcp-server/index.mjs"]
  });

  const client = new Client({
    name: "mcp-test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  console.log("Connected to Agent Critiq MCP Server successfully!");

  // Test 1: listTools
  const toolsResponse = await client.listTools();
  console.log("\nAvailable MCP Tools Count:", toolsResponse.tools.length);
  toolsResponse.tools.forEach(t => console.log(` - ${t.name}: ${t.description}`));

  // Test 2: search_ai_tools
  console.log("\nTesting 'search_ai_tools' for 'coding':");
  const searchResult = await client.callTool({
    name: "search_ai_tools",
    arguments: { query: "coding", limit: 3 }
  });
  console.log(searchResult.content[0].text);

  // Test 3: get_tool_detail for 'google-veo-3-1'
  console.log("\nTesting 'get_tool_detail' for 'google-veo-3-1':");
  const detailResult = await client.callTool({
    name: "get_tool_detail",
    arguments: { slug: "google-veo-3-1" }
  });
  console.log(detailResult.content[0].text);

  // Test 4: compare_tools for ['cursor', 'google-veo-3-1']
  console.log("\nTesting 'compare_tools' for 'cursor' vs 'google-veo-3-1':");
  const compareResult = await client.callTool({
    name: "compare_tools",
    arguments: { slugs: ["cursor", "google-veo-3-1"] }
  });
  console.log(compareResult.content[0].text);

  await client.close();
  console.log("\nMCP Server test completed cleanly!");
}

runTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
