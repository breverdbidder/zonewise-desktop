# CLAUDE.md - ZoneWise Desktop

This file provides guidance to Claude Code when working with the zonewise-desktop repository.

## Overview

ZoneWise Desktop is a fork of [Craft Agents OSS](https://github.com/lukilabs/craft-agents-oss) v0.4.0, rebranded for the ZoneWise.AI zoning intelligence platform. It serves as both a desktop Electron app and a web viewer deployed on Vercel.

- **Repo**: `breverdbidder/zonewise-desktop`
- **Upstream**: `lukilabs/craft-agents-oss`
- **Current release**: v2.5.0
- **Branding**: Navy `#1E3A5F`, Orange `#F47B20`

## Monorepo Structure

```
zonewise-desktop/
├── apps/
│   ├── electron/          # Desktop app (Electron + electron-builder)
│   └── viewer/            # Web viewer SPA (Vite + React)
├── packages/
│   ├── core/              # Shared TypeScript types (@craft-agent/core)
│   ├── shared/            # Business logic (@craft-agent/shared)
│   ├── ui/                # React UI components (@craft-agent/ui)
│   ├── agent/             # Agent package
│   ├── session-tools-core/# Session tools
│   ├── mermaid/           # Mermaid rendering
│   └── codex-types/       # Codex type definitions
├── zonewise/
│   └── branding/          # inject-branding.mjs, override.css, config.ts
├── .github/workflows/
│   ├── build-desktop.yml  # Electron-builder CI (tag-triggered)
│   ├── deploy-cloudflare.yml
│   └── sync-upstream.yml
├── vercel.json            # Build config (runs from apps/viewer context)
├── electron-builder.yml   # → apps/electron/electron-builder.yml
└── package.json           # Root monorepo (bun workspaces)
```

## Web Viewer (apps/viewer)

### Dual-Mode Routing

The viewer serves two distinct apps via client-side routing in `main.tsx`:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `App.tsx` | ZoneWise AI chatbot (SSE streaming to backend) |
| `/s` | `SessionViewPage.tsx` | Session file upload page |
| `/s/{id}` | `SessionViewPage.tsx` | Read-only SessionViewer (loads from S3) |

### Backend

The chatbot streams via SSE to `zonewise-agents.onrender.com`. **Do not modify the backend.**

```
API_BASE = import.meta.env.VITE_API_URL || 'https://zonewise-agents.onrender.com'
```

### Build

```bash
bun run viewer:build    # Vite build → apps/viewer/dist/
node zonewise/branding/inject-branding.mjs  # Post-build branding
```

## Vercel Deployment

**URL**: `zonewise-desktop-viewer.vercel.app`

### Critical: rootDirectory is `apps/viewer`

The Vercel project has `rootDirectory` set to `apps/viewer`. This affects path resolution:

- **Build config** (`buildCommand`, `installCommand`, `outputDirectory`): Read from the **repo-root** `vercel.json`, but paths are relative to `apps/viewer/`
- **Routing rules** (rewrites, headers): Must be in `apps/viewer/vercel.json` — the repo-root `vercel.json` routing rules are **ignored**

### Two vercel.json files

1. **`vercel.json`** (repo root) — build configuration only:
   ```json
   {
     "buildCommand": "cd ../.. && bun run viewer:build && node zonewise/branding/inject-branding.mjs",
     "outputDirectory": "dist",
     "installCommand": "cd ../.. && bun install"
   }
   ```
   - `cd ../..` navigates from `apps/viewer/` to repo root for monorepo commands
   - `outputDirectory: "dist"` is relative to `apps/viewer/`

2. **`apps/viewer/vercel.json`** — routing rules only:
   ```json
   {
     "rewrites": [
       { "source": "/s/:path*", "destination": "/index.html" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Verification

All routes should return HTTP 200:
```bash
curl -o /dev/null -w "%{http_code}" https://zonewise-desktop-viewer.vercel.app/
curl -o /dev/null -w "%{http_code}" https://zonewise-desktop-viewer.vercel.app/s
curl -o /dev/null -w "%{http_code}" https://zonewise-desktop-viewer.vercel.app/s/any-id
```

## Electron Desktop App (apps/electron)

### Branding (electron-builder.yml)

```yaml
appId: ai.zonewise.desktop
productName: ZoneWise AI
artifactName: "ZoneWise-AI-${arch}.${ext}"
```

### Build

```bash
bun run electron:build       # Build main + preload + renderer + resources
bun run electron:dist:win    # Package Windows .exe
bun run electron:dist:mac    # Package macOS .dmg (arm64)
```

### Fork-Specific: Missing Packages

The fork does NOT include `packages/bridge-mcp-server` or `packages/session-mcp-server`. The build script (`scripts/electron-build-main.ts`) checks for `existsSync(dir/src)` before building these — do not remove this guard.

## GitHub Actions CI

### build-desktop.yml (`.github/workflows/build-desktop.yml`)

Triggers on `v*` tag push or manual dispatch. Builds all three platforms in parallel.

| Platform | Runner | Output |
|----------|--------|--------|
| Windows | `windows-latest` | `ZoneWise-AI-x64.exe` |
| macOS | `macos-latest` | `ZoneWise-AI-arm64.dmg`, `ZoneWise-AI-x64.dmg` |
| Linux | `ubuntu-latest` | `ZoneWise-AI-x86_64.AppImage` |

A `publish-release` job creates a GitHub Release with all artifacts on tag push.

### Key CI Details

- **working-directory**: electron-builder steps use `working-directory: apps/electron` (NOT `--project`). This ensures `afterPack.cjs`, `resources/`, and `build/entitlements.mac.plist` resolve correctly.
- **macOS code signing**: `CSC_IDENTITY_AUTO_DISCOVERY=false` skips signing in CI. To enable notarized builds, set `CSC_LINK`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` as GitHub secrets.
- **Entitlements**: `apps/electron/build/entitlements.mac.plist` must exist even for unsigned builds.

### Creating a New Release

```bash
git tag -a v2.6.0 -m "ZoneWise AI v2.6.0"
git push origin v2.6.0
# CI will build all platforms and create a GitHub Release
```

## Branding

### Injection Pipeline

The `zonewise/branding/inject-branding.mjs` script runs post-build and modifies `apps/viewer/dist/index.html`:
- Replaces title with "ZoneWise.AI - Florida Real Estate Intelligence"
- Adds OG meta tags and theme-color
- Removes Plausible analytics
- Copies `override.css` as `zonewise-override.css`

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Navy | `#1E3A5F` | Primary, headers, backgrounds |
| Orange | `#F47B20` | Accent, CTAs, highlights |

## Package Dependencies

Key workspace packages used by the viewer:
- `@craft-agent/core` — `StoredSession`, `Message` types
- `@craft-agent/ui` — `SessionViewer`, `TooltipProvider`, `TurnCard` components

## Common Tasks

### Update upstream

```bash
bun run oss:sync  # Sync from lukilabs/craft-agents-oss
```

### Run viewer locally

```bash
bun run viewer:dev  # Opens on port 5174
```

### Check Vercel deploy status

```bash
curl -s -H "Authorization: token $GH_TOKEN" \
  "https://api.github.com/repos/breverdbidder/zonewise-desktop/deployments?per_page=1" \
  | python -m json.tool | grep -E '"(state|description)"'
```


---

## The 12 Wise Module System (ZoneWise Brand Language)

All pipeline stages use Wise-branded names. BidWise is the hero module.

| # | Module | What It Does |
|---|--------|-------------|
| 01 | DiscoverWise | Find upcoming auctions — 67 FL counties |
| 02 | GatherWise | Pull all property data (BCPAO, photos, history) |
| 03 | TitleWise | Verify full chain of title |
| 04 | LienWise | Map complete lien waterfall |
| 05 | TaxWise | Check tax certificates and delinquencies |
| 06 | NeighborWise | Neighborhood intel — income, vacancy, demand |
| 07 | ScoreWise | AI bid probability score |
| 08 | BidWise | THE HERO — exact max bid calculation |
| 09 | CallWise | Final BID / REVIEW / SKIP decision |
| 10 | InsightWise | Full 298-KPI intelligence report |
| 11 | TrackWise | Disposition tracking |
| 12 | VaultWise | Archive every deal and result |

BidWise hero tagline: "Every module exists to get you to one number. BidWise gives you that number."
Demo: https://zonewise.ai/demo.html
