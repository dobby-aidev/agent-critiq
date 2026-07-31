# 🤖 Agent Critiq MCP Server (v3.2.0)

**Official Model Context Protocol (MCP) server for [Agent Critiq](https://github.com/dobby-aidev/agent-critiq)** — The AI Agents, Software Reviews & Intelligence Platform.

- **GitHub Repository**: [https://github.com/dobby-aidev/agent-critiq](https://github.com/dobby-aidev/agent-critiq)
- **Live Platform**: [https://agentcritiq.com](https://agentcritiq.com)

This server enables **Claude Desktop, Cursor IDE, Windsurf, VS Code Copilot**, and any MCP-compatible agent to query the Agent Critiq database of **106+ AI tools** in real time via Stdio or HTTP JSON-RPC transports.

---

## 🇹🇷 Türkçe Özet / Turkish Summary

**Agent Critiq MCP Sunucusu**, Cursor, Windsurf ve Claude Desktop gibi yapay zeka kod editörlerinin Agent Critiq veritabanındaki 106'dan fazla yapay zeka aracını, gerçek kullanıcı puanlarını, fiyatlandırmaları, artı/eksi yönlerini ve araç karşılaştırma matrislerini doğrudan geliştirme ortamınızdan sorgulamasını sağlar.

---

## ✨ Available Tools / Kullanılabilir MCP Araçları

| Tool Name | Parameters | Description (EN) | Açıklama (TR) |
|-----------|------------|------------------|---------------|
| `search_ai_tools` | `query`, `category`, `min_rating`, `free_only`, `limit` | Search AI tools by keyword, category, pricing, or rating threshold. | Anahtar kelime, kategori ve puana göre AI araçları arar. |
| `get_tool_detail` | `slug` *(required)* | Get technical specs, pros, cons, ratings, features, and review URL for a slug. | Araç slug'ına göre detaylı özellik, artı/eksi ve inceleme sayfasını getirir. |
| `list_categories` | None | List all active software categories and total tool counts. | Tüm aktif kategorileri ve araç sayılarını listeler. |
| `get_top_rated` | `category`, `limit` | Retrieve top-rated tools overall or filtered by category. | En yüksek puanlı araçları kategorisine göre sıralar. |
| `compare_tools` | `slugs` *(required array)* | Generate a side-by-side comparison matrix for multiple tools. | İki veya daha fazla aracı yan yana karşılaştırma matrisi haline getirir. |

---

## 🚀 Quick Start / Hızlı Başlangıç

### 1. Installation

```bash
cd mcp-server
npm install
```

### 2. Automated Stdio Test

Run the included verification client to test all 5 tools over Stdio:

```bash
npm test
# OR
node test-mcp.mjs
```

---

## 🔌 Cursor IDE Integration / Cursor Bağlantısı

1. Open **Cursor Settings** -> **Features** -> **MCP Servers** (or edit your workspace `.cursor/mcp.json`).
2. Add the following entry:

```json
{
  "mcpServers": {
    "agent-critiq": {
      "command": "node",
      "args": [
        "./mcp-server/index.mjs"
      ]
    }
  }
}
```

3. Cursor will connect to the MCP server and show `agent-critiq` with **5 tools** active. ✅

---

## 🔌 Claude Desktop Integration / Claude Desktop Bağlantısı

1. Open your Claude Desktop configuration file:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Paste the following configuration:

```json
{
  "mcpServers": {
    "agent-critiq": {
      "command": "node",
      "args": [
        "./mcp-server/index.mjs"
      ]
    }
  }
}
```

3. Restart **Claude Desktop**.

---

## 💬 Example Prompts / Örnek Sorular

Once connected to your IDE or Claude Desktop, ask your AI assistant:

- 🇬🇧 *"What are the top 5 free coding AI agents according to Agent Critiq?"*
- 🇹🇷 *"Agent Critiq veritabanına göre kod yazımı için en iyi 3 yapay zeka aracını getir."*
- 🇬🇧 *"Compare Cursor vs Claude Code vs Zed AI."*
- 🇹🇷 *"Google Veo 3.1 ile Midjourney araçlarını karşılaştır."*
- 🇬🇧 *"Find video generation AI tools with a rating above 4.8."*

---

## 📦 Data Architecture / Veri Mimarısı

- **106+ AI Tools**: Indexed across 17+ core software categories.
- **Dataset file**: `mcp-server/dataset.json` (auto-synced with `src/data/software.ts`).
- **Response Speed**: 0ms local offline execution via Stdio JSON-RPC 2.0 protocol.

---

## 📄 License

MIT — Free to use, fork, and integrate into custom agent workflows.

**Developed with ❤️ for [Agent Critiq](https://agentcritiq.app)**
