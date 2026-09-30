---
title: Agent Critiq MCP Server
description: Official Model Context Protocol (MCP) server for Agent Critiq AI tools database with 100+ verified tools, Methodology v3.0 benchmarks, live SLA telemetry, and Hugging Face dataset integration.
tags:
  - mcp
  - model-context-protocol
  - ai-tools
  - agent-critiq
  - methodology-v3
  - cursor
  - claude-desktop
  - lobechat
  - huggingface-dataset
license: mit
app_name: agent-critiq-mcp-server
website: https://agentcritiq.com
repository: https://github.com/dobby-aidev/agent-critiq
---

# 🤖 Agent Critiq MCP Server (v3.6.0)

[![Live Platform](https://img.shields.io/badge/Platform-agentcritiq.com-cyan.svg)](https://agentcritiq.com)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-130%2B_Downloads-yellow.svg)](https://huggingface.co/datasets/dobbyb-aidev/agent-critiq-ai-reviews)
[![MCP Protocol](https://img.shields.io/badge/MCP-v1.0.0-indigo.svg)](https://modelcontextprotocol.io)
[![Methodology v3.0](https://img.shields.io/badge/Protocol-Methodology_v3.0-violet.svg)](https://agentcritiq.com/about)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)

**Official Model Context Protocol (MCP) server for [Agent Critiq](https://agentcritiq.com)** — The AI Agents, Software Reviews & Intelligence Platform.

- 🌐 **Live Platform:** [https://agentcritiq.com](https://agentcritiq.com)
- 🤗 **Hugging Face Dataset (130+ Downloads):** [dobbyb-aidev/agent-critiq-ai-reviews](https://huggingface.co/datasets/dobbyb-aidev/agent-critiq-ai-reviews)
- 🐙 **GitHub Repository:** [https://github.com/dobby-aidev/agent-critiq](https://github.com/dobby-aidev/agent-critiq)

This server enables **Claude Desktop, Cursor IDE, Windsurf, LobeChat, Roo Code, VS Code Copilot**, and any autonomous agent to query Agent Critiq's database of **100+ verified AI tools** with **Methodology v3.0 Community Index** and **live SLA telemetries** in real time.

---

## 🇹🇷 Türkçe Özet / Turkish Summary

**Agent Critiq MCP Sunucusu v3.6.0**, Cursor, Windsurf, LobeChat ve Claude Desktop gibi yapay zeka kod editörlerinin Agent Critiq veritabanındaki 100'den fazla yapay zeka aracını, **Metodoloji v3.0 (4 Fazlı Tarafsız Test Karnesi)** sonuçlarını ve **canlı SLA / yanıt gecikmesi (ms)** telemetrilerini doğrudan geliştirme ortamınızdan sorgulamasını sağlar.

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
| `agentcritiq://dataset/tools.json` | `application/json` | Full indexed dataset of 100+ verified AI tools with Methodology v3.0. |
| `agentcritiq://dataset/categories.json` | `application/json` | Software category list with total tool counts. |

---

### 💡 3. MCP Prompts (Hazır İstem Şablonları)

| Prompt Name | Description | Arguments |
|-------------|-------------|-----------|
| `recommend_ai_tool` | Personalized AI tool recommendation template. | `use_case` (e.g. 'coding assistant', 'video generator') |
| `compare_ai_tools` | Structured side-by-side comparison template. | `tools_to_compare` (e.g. 'cursor, claude-code') |
| `audit_tool_methodology` | 1-Click Methodology v3.0 4-phase scorecard inspector. | `slug` (e.g. 'cursor', 'devin-ai') |

---

## 📊 Methodology v3.0 (4-Phase Protocol)

Every tool in Agent Critiq is benchmarked under our strict 4-phase weighted mathematical model (natural score ceiling: **4.3 / 5.0**):

1. **Phase 1: Ecosystem & Community Pulse (25% Weight):** GitHub commits, open-source releases, Reddit/Discord sentiment.
2. **Phase 2: Laboratory Stress Engine & SLA (25% Weight):** Context window fidelity, memory persistence, API latency, and uptime SLA.
3. **Phase 3: Security & Data Privacy Audit (20% Weight):** Zero-data retention, shadow-training risk, SOC 2 compliance.
4. **Phase 4: Expert Human Field Test (30% Weight):** 40+ hours hands-on field testing by senior staff engineers.

---

## 🚀 Quick Start / Hızlı Başlangıç

### 1. Installation

```bash
cd mcp-server
npm install
```

### 2. Automated Stdio Test

Run the included verification client to test all 7 tools, resources, and prompts over Stdio:

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

## 🤗 Hugging Face Dataset Integration

The complete underlying dataset is published and maintained on Hugging Face:

```python
from datasets import load_dataset

dataset = load_dataset("dobbyb-aidev/agent-critiq-ai-reviews")
print(f"Loaded {len(dataset['train'])} AI tools with Methodology v3.0 scores!")
```

---

## 💬 Example Prompts / Örnek Sorular

Once connected to your IDE or AI assistant, try asking:

- 🇬🇧 *"What are the top 3 coding AI tools according to Agent Critiq Methodology v3.0?"*
- 🇹🇷 *"Agent Critiq veritabanına göre kod yazımı için en iyi 3 aracı Metodoloji v3.0 puanlarıyla getir."*
- 🇬🇧 *"Run a methodology audit on Cursor and show Phase 1 to Phase 4 scores."*
- 🇹🇷 *"Cursor ile Windsurf araçlarını gecikme ve SLA telemetrisiyle karşılaştır."*
- 🇬🇧 *"Which video generation tools have the lowest render latency?"*

---

## 📄 License

MIT © [Agent Critiq](https://agentcritiq.com) — Free to use, fork, and integrate into custom agent workflows.
