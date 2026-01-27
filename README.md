# ZoneWise Desktop

**AI-Powered Zoning Intelligence Platform**

> "Can I build X at location Y?" — answered in seconds.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Based on](https://img.shields.io/badge/Based%20on-Craft%20Agents-purple.svg)](https://github.com/lukilabs/craft-agents-oss)

## Overview

ZoneWise Desktop is a white-label fork of [Craft Agents](https://github.com/lukilabs/craft-agents-oss), customized for real estate professionals, developers, and investors who need instant access to zoning regulations across Florida.

## Features

- 🗺️ **Zoning Lookup** - Query any address or parcel for zoning info
- 📏 **Setback Calculator** - Calculate buildable area instantly
- ✅ **Use Permission Check** - Verify if your use is allowed
- 🤖 **AI-Powered Chat** - Natural language zoning queries
- 📊 **Supabase Integration** - Real-time data from 67 Florida counties

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) v1.0+
- [Node.js](https://nodejs.org/) v18+ (for some MCP servers)

### Installation

```bash
# Clone the repository
git clone https://github.com/breverdbidder/zonewise-desktop.git
cd zonewise-desktop

# Install dependencies
bun install

# Build and run
cd apps/electron
bun run start
```

### Apply ZoneWise Theme

Copy the theme to your config directory:

```bash
# macOS/Linux
mkdir -p ~/.craft-agent/themes
cp themes/zonewise.json ~/.craft-agent/themes/

# Windows (PowerShell)
New-Item -ItemType Directory -Path "$env:USERPROFILE\.craft-agent	hemes" -Force
Copy-Item themes\zonewise.json "$env:USERPROFILE\.craft-agent	hemes\"
```

Then select "ZoneWise" in Settings → Appearance.

## Configuration

### MCP Servers

Add these MCP sources in Settings → MCP Sources:

| Name | Command | Purpose |
|------|---------|---------|
| Supabase | `npx -y @supabase/mcp-server-supabase@latest ...` | Database queries |
| GitHub | `npx -y @modelcontextprotocol/server-github` | Repo access |
| Puppeteer | `npx -y @modelcontextprotocol/server-puppeteer` | Web scraping |

See `config/mcp-servers.json` for full configuration.

### Skills

Copy skills to enable zoning capabilities:

```bash
cp skills/*.md ~/.craft-agent/skills/
```

## Architecture

```
┌─────────────────────────────────────────┐
│  ZoneWise Desktop (Electron)            │
├─────────────────────────────────────────┤
│  UI: Chat + Map + Artifacts             │
├─────────────────────────────────────────┤
│  MCP Servers                            │
│  ├── Supabase (zonewise data)           │
│  ├── Puppeteer (Municode scraping)      │
│  └── GitHub (code/config)               │
├─────────────────────────────────────────┤
│  Supabase Database                      │
│  ├── zonewise_districts (273+)          │
│  ├── zonewise_dimensional_standards     │
│  └── zonewise_use_permissions           │
└─────────────────────────────────────────┘
```

## Data Coverage

| County | Jurisdictions | Districts | Status |
|--------|---------------|-----------|--------|
| Brevard | 17 | 273 | ✅ Complete |
| Palm Beach | - | - | 🔄 Q1 2026 |
| ... | ... | ... | ... |

**Goal:** 67 Florida counties by Q2 2026

## Development

### Build from Source

```bash
# Development mode
bun run dev

# Production build
bun run build

# Package for distribution
bun run dist:win   # Windows
bun run dist:mac   # macOS
```

### Project Structure

```
zonewise-desktop/
├── apps/electron/        # Desktop app
├── packages/
│   ├── core/            # AI/LLM logic
│   ├── shared/          # Shared utilities
│   └── ui/              # React components
├── themes/              # ZoneWise theme
├── skills/              # AI skills
└── config/              # MCP configuration
```

## Credits

- Based on [Craft Agents OSS](https://github.com/lukilabs/craft-agents-oss) by Luki Labs
- Zoning data from Florida Municipal Codes via Municode

## License

Apache 2.0 - See [LICENSE](LICENSE)

---

**ZoneWise** is a product of [Everest Capital USA](https://everestcapitalusa.com)

*"Data is the moat. Everything else is a wrapper."*
