# ZoneWise Desktop v2.0.0 — Multi-Provider AI, Codex Support & Full Customization

**Release Date:** February 8, 2026
**Upstream Base:** Craft Agents OSS v0.4.0 (lukilabs/craft-agents-oss)
**License:** Apache 2.0

---

## 🚀 Release Summary

ZoneWise Desktop v2.0.0 is a major release that syncs with Craft Agents OSS v0.4.0 while applying full ZoneWise.AI branding, skills, and real estate intelligence customizations. This release introduces multi-provider LLM connections, OpenAI Codex support, per-workspace configuration, and nine upstream versions of improvements since the v0.3.1 baseline.

---

## 🔌 Multi-Provider LLM Connections (NEW — v0.4.0)

ZoneWise Desktop now supports connecting to **multiple AI providers simultaneously**:

- **Add multiple providers** — Anthropic (Claude), OpenRouter, Codex/OpenAI, and custom endpoints
- **Independent validation** — Each connection is tested and managed separately
- **Session locking** — Sessions lock to a specific connection after the first message, preventing mid-conversation provider switches
- **Per-workspace defaults** — Each workspace can override the global default LLM connection for new sessions

### Why This Matters for ZoneWise

Run Claude Opus 4.6 for complex zoning analysis, Sonnet 4.5 for routine queries, and OpenAI Codex for code-heavy automation — all from the same desktop app. Workspaces like "Brevard County" and "Palm Bay Zoning" can each default to different models.

---

## 🤖 Codex / OpenAI Support (NEW — v0.4.0)

Connect to OpenAI via **Codex using OAuth** and run Codex-powered sessions alongside Anthropic connections. This enables dual-agent workflows where Claude handles zoning intelligence and Codex handles code generation tasks.

---

## 🎨 Per-Workspace Theming (NEW — v0.4.0)

Each workspace can now set a **default theme** via `defaults.colorTheme`, making it easy to visually distinguish between contexts (e.g., navy theme for ZoneWise analysis, green for environmental overlays).

---

## 🧠 Claude Opus 4.6 Support (v0.3.5)

Full support for **Claude Opus 4.6** (`claude-opus-4-6`) — Anthropic's most capable model with 1M context window and 128K output tokens. Available in settings, chat model selector, playground, and the `call_llm` tool. Opus 4.5 remains available as "Previous generation."

---

## ZoneWise-Specific Customizations (v2.0.0)

### 🎨 ZoneWise Navy Brand Theme
- Primary: `#1E3A5F` (navy) + Accent: `#F47B20` (orange)
- Applied as the default workspace theme

### 🧠 ZoneWise Master Intelligence Skill
- Full system prompt for CraftAgents v0.4.0 integration
- NLP intent classification for zoning queries
- County-aware context for all 67 Florida counties

### 🔌 Supabase Source Configuration
- Pre-configured connection to ZoneWise Supabase instance
- Access to all core tables including `multi_county_auctions`
- PostgREST tools for direct database queries

### 🧠 ZoneWise Agent API Source
- NLP endpoints with streaming support
- Intent classification for zoning, setback, and land-use queries
- Connected to the ZoneWise FastAPI backend on Render

### ⚙️ Workspace Configuration
- Pre-configured connections, skills, statuses, and labels
- ZoneWise-specific session workflow states

---

## 📋 Full Changelog: v0.3.1 → v0.4.0

### v0.3.2 — Focus Mode & OAuth Improvements
- **Focus Mode** — Distraction-free workspace with hidden sidebar
- **Basic Auth password support** — APIs like Ashby now supported
- **Progressive OAuth metadata discovery** (RFC 8414) — Fixes OAuth with Ahrefs MCP and similar servers
- Removed baked-in Google OAuth credentials — Users provide their own via source config
- Theme refinements and dark mode improvements

### v0.3.3 — Token Refresh & Auto-Update Fixes
- **Automatic OAuth token refresh** for MCP sources — No manual re-auth needed
- **Multi-header authentication** — Sources requiring multiple auth headers (API key + tenant ID)
- RFC 9728 protected resource metadata discovery
- SSRF protection hardening in OAuth discovery
- Parallelized token checks for faster startup
- Auto-update reliability fixes on Windows and macOS

### v0.3.4 — Skills Convention & Windows Build
- **`.agents/skills` convention** — Cross-tool compatibility with Codex, Gemini, and other tools
- **Theme config priority fix** — `config.json` now overrides localStorage
- Helpful messages for AI provider errors with status page guidance
- Custom model support in summarization (uses `resolveModelId()`)
- Fixed skill mention format — `@` mentions generate correct workspace alias
- Steps scroll behavior improvements

### v0.3.5 — Claude Opus 4.6 & Auto-Update Reliability
- **Claude Opus 4.6** (`claude-opus-4-6`) — Full support across all interfaces
- **Reliable macOS auto-update** — Real download percentage, ~150 lines of workarounds removed
- **Automatic image resizing** — Large images resized instead of rejected
- **Skill mention improvements** — Dot support in workspace IDs
- Updated Claude Agent SDK from 0.2.19 to 0.2.34 (CLI 2.1.31 → 2.1.34)
- New "Executing actions with care" system prompt section

### v0.4.0 — LLM Connections, Codex Support, Workspace Defaults
- **Multiple LLM connections** — Add and manage multiple providers
- **Codex/OpenAI support** — OAuth-based Codex integration
- **Per-workspace default connection** — Override global LLM default per workspace
- **Per-workspace default themes** — Visual context switching
- **Documentation upgrades** — New reference pages for connections, Codex, and workspace defaults

---

## 📥 Downloads

| Platform | File | Size |
|----------|------|------|
| **Windows x64** | `Craft-Agents-0.4.0-win-x64.exe` | 177 MB |
| macOS Apple Silicon | `Craft-Agents-0.4.0-mac-arm64.dmg` | 178 MB |
| macOS Intel | `Craft-Agents-0.4.0-mac-x64.dmg` | 189 MB |
| Linux x64 | `Craft-Agents-0.4.0-linux-x64.AppImage` | 199 MB |

> **Note:** These are upstream Craft Agents builds. ZoneWise customizations (branding, skills, sources) are applied at the workspace level via configuration, not embedded in the binary.

---

## 🏗️ Architecture

```
ZoneWise Desktop v2.0.0
├── Craft Agents OSS v0.4.0          ← Upstream Electron app
│   ├── Claude Agent SDK 0.2.34      ← Anthropic SDK
│   ├── Multi-Session Inbox          ← Session management
│   ├── MCP Integration              ← 32+ Craft document tools
│   ├── Permission Modes             ← Explore / Ask to Edit / Auto
│   └── Multi-Provider Connections   ← NEW in v0.4.0
├── ZoneWise Customizations
│   ├── packages/agent/              ← Custom ZoneWise AI agent
│   │   ├── zonewise_agent.py        ← LangGraph workflow
│   │   ├── langgraph_workflow.py    ← Multi-agent orchestration
│   │   └── observability.py         ← Logfire monitoring
│   ├── zonewise/
│   │   ├── branding/                ← Navy theme + assets
│   │   ├── data/                    ← 67 FL counties
│   │   ├── skills/                  ← 12+ custom skills
│   │   └── docs/                    ← Documentation
│   └── components/envelope/         ← 3D envelope visualization
└── Configuration
    ├── connections.json              ← Multi-LLM provider setup
    ├── workspace.json                ← ZoneWise defaults
    └── sources/                      ← Supabase + Agent API
```

---

## 🔧 Setup Instructions

### 1. Install
Download and run the installer for your platform from the links above.

### 2. Configure Anthropic Connection
On first launch, authenticate with your Anthropic account via OAuth.

### 3. Apply ZoneWise Workspace
The ZoneWise workspace configuration is automatically applied from the `breverdbidder/zonewise-desktop` repository, including:
- Navy brand theme (`#1E3A5F`)
- Pre-configured Supabase source
- ZoneWise Agent API source
- Master intelligence skill
- Custom session statuses and labels

### 4. (Optional) Add Codex Connection
Settings → Connections → Add → Select "Codex/OpenAI" → Authenticate via OAuth

---

## 📊 Migration Notes

| From | To | Action |
|------|----|--------|
| ZoneWise Desktop v1.0.x | v2.0.0 | Fresh install recommended. Workspace configs auto-apply. |
| Craft Agents v0.3.1 | v0.4.0 | Auto-update via electron-updater. Skills in `~/.agents/skills/` persist. |

---

## 🔗 Repositories

| Repo | Purpose |
|------|---------|
| [breverdbidder/zonewise-desktop](https://github.com/breverdbidder/zonewise-desktop) | ZoneWise Desktop (fork of Craft Agents) |
| [lukilabs/craft-agents-oss](https://github.com/lukilabs/craft-agents-oss) | Upstream Craft Agents OSS |
| [breverdbidder/zonewise-web](https://github.com/breverdbidder/zonewise-web) | ZoneWise Web (Next.js) |
| [breverdbidder/zonewise-skills](https://github.com/breverdbidder/zonewise-skills) | Multi-platform skills |

---

**Built by Ariel Shapira | Everest Capital USA | ZoneWise.AI**
