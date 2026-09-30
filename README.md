---
title: Agent Critiq MCP Server
description: Official Model Context Protocol (MCP) server for Agent Critiq AI tools database with 100+ verified tools, ratings, pros, cons, and comparisons.
tags:
  - mcp
  - model-context-protocol
  - ai-tools
  - agent-critiq
  - cursor
  - claude-desktop
  - lobechat
license: mit
app_name: agent-critiq-mcp-server
website: https://agentcritiq.com
repository: https://github.com/dobby-aidev/agent-critiq
---

# 🤖 Agent Critiq MCP Server (v3.6.0)

[![MCP Protocol](https://img.shields.io/badge/MCP-v1.0.0-indigo.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-emerald.svg)](https://nodejs.org)
[![Live Platform](https://img.shields.io/badge/Platform-agentcritiq.com-cyan.svg)](https://agentcritiq.com)

**Official Model Context Protocol (MCP) server for [Agent Critiq](https://agentcritiq.com)** — The AI Agents, Software Reviews & Intelligence Platform.

- **GitHub Repository**: [https://github.com/dobby-aidev/agent-critiq](https://github.com/dobby-aidev/agent-critiq)
- **Live Platform**: [https://agentcritiq.com](https://agentcritiq.com)

This server enables **Claude Desktop, Cursor IDE, Windsurf, LobeChat, Roo Code, VS Code Copilot**, and any MCP-compatible agent to query the Agent Critiq database of **100+ verified AI tools** in real time via Stdio or HTTP JSON-RPC transports.

---

## 🇹🇷 Türkçe Özet / Turkish Summary

**Agent Critiq MCP Sunucusu v3.6.0**, Cursor, Windsurf, LobeChat ve Claude Desktop gibi yapay zeka kod editörlerinin Agent Critiq veritabanındaki 100'den fazla yapay zeka aracını, Metodoloji v3.0 (4 Fazlı) Topluluk Endeksini, gerçek zamanlı SLA ve yanıt gecikmesi telemetrilerini doğrudan geliştirme ortamınızdan sorgulamasını sağlar.

---

## ⚙️ Core Capabilities / Sunucu Yetenekleri

Agent Critiq MCP Sunucusu v3.6.0, MCP spesifikasyonunun tüm **üç temel özelliğini (Tools + Resources + Prompts)** eksiksiz olarak destekler:

### 🛠️ 1. MCP Tools (Ajan Araçları - 7 Adet)

| Tool Name | Parameters | Description (EN) | Açıklama (TR) |
|-----------|------------|------------------|---------------|
| `search_ai_tools` | `query`, `category`, `min_rating`, `free_only`, `limit` | Search AI tools with Metodoloji v3.0 Community Index. | Anahtar kelime, kategori ve puana göre AI araçları arar. |
| `get_tool_detail` | `slug` *(required)* | Get technical specs, pros, cons, Metodoloji v3.0 index, and live SLA. | Araç slug'ına göre detaylı özellik, artı/eksi ve canlı SLA telemetrisi getirir. |
| `get_methodology_audit` | `slug` *(required)* | Retrieve objective 4-phase scorecard (Ecosystem, Stress/SLA, Security, Human). | 4 fazlı test karnesini (Ekosistem, Stres/SLA, Güvenlik, İnsan Testi) getirir. |
| `get_agent_telemetry` | `slug` *(required)* | Retrieve modeled response latency (ms), uptime SLA, and throughput. | Yanıt gecikmesi (ms), SLA uptime (%) ve çıktı hızı telemetrisini getirir. |
| `list_categories` | None | List all active software categories and total tool counts. | Tüm aktif kategorileri ve araç sayılarını listeler. |
| `get_top_rated` | `category`, `by_community_index`, `limit` | Retrieve top-rated tools sorted by Community Index. | Metodoloji v3.0 puanına göre en yüksek araçları sıralar. |
| `compare_tools` | `slugs` *(required array)* | Generate a side-by-side comparison matrix with 4-phase scores. | Araçları 4 faz puanı ve telemetrisiyle yan yana karşılaştırır. |

---

### 📂 2. MCP Resources (Canlı Veri Kaynakları)

| Resource URI | MimeType | Description |
|--------------|----------|-------------|
| `agentcritiq://dataset/tools.json` | `application/json` | Full indexed dataset of 100+ verified AI tools. |
| `agentcritiq://dataset/categories.json` | `application/json` | Software category list with total tool counts. |

---

### 💡 3. MCP Prompts (Hazır İstem Şablonları)

| Prompt Name | Description | Arguments |
|-------------|-------------|-----------|
| `recommend_ai_tool` | Personalized AI tool recommendation template. | `use_case` (e.g. 'coding assistant') |
| `compare_ai_tools` | Structured side-by-side comparison template. | `tools_to_compare` (e.g. 'cursor, claude-code') |

---

## 🚀 Quick Start / Hızlı Başlangıç

### 1. Installation

```bash
cd mcp-server
npm install
```

### 2. Automated Stdio Test

Run the included verification client to test all tools, resources, and prompts over Stdio:

```bash
npm test
# OR
node test-mcp.mjs
```

---

## 🔌 Integration Guides / Entegrasyon Rehberleri

### 🟢 Cursor IDE Integration
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

---

### 🟠 Claude Desktop Integration
1. Open your Claude Desktop configuration file:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the configuration:

```json
{
  "mcpServers": {
    "agent-critiq": {
      "command": "node",
      "args": [
        "C:/path/to/Agent Critiq/mcp-server/index.mjs"
      ]
    }
  }
}
```

---

### 🌐 LobeChat / LobeHub Integration
1. Go to **LobeChat Settings** -> **Plugins / MCP Marketplace**.
2. Add `agent-critiq` from the market or set Stdio / SSE endpoint to `https://agentcritiq.com`.

---

## 💬 Example Prompts / Örnek Sorular

Once connected to your IDE or AI assistant, try asking:

- 🇬🇧 *"What are the top 3 coding AI tools on Agent Critiq?"*
- 🇹🇷 *"Agent Critiq veritabanına göre kod yazımı için en iyi 3 aracı getir."*
- 🇬🇧 *"Compare Cursor vs Claude Code vs Zed AI."*
- 🇹🇷 *"Google Veo 3.1 ile Midjourney araçlarını karşılaştır."*
- 🇬🇧 *"Search free video generation tools with rating > 4.5."*

---

## 📄 License

MIT — Free to use, fork, and integrate into custom agent workflows.

**Developed with ❤️ for [Agent Critiq](https://agentcritiq.com)**
