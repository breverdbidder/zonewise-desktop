# CRAFT AGENTS v0.4.0 FEATURE PARITY MISSION
# ZERO TOLERANCE — DEPLOY IMMEDIATELY — NO QUESTIONS

## CONTEXT
The previous App.tsx rewrite DELETED all Craft Agents components and built a custom chat from scratch. This is WRONG. The web viewer at apps/viewer/ must have IDENTICAL capabilities to the Electron desktop app at apps/electron/, connected to the ZoneWise backend via SSE streaming.

## IRON RULE
**NEVER delete or replace @craft-agent/ui imports. ONLY extend them.**

The monorepo has three shared packages:
- `packages/ui/` — SessionViewer, all overlays, chat components, code viewer, markdown, terminal, tooltips
- `packages/core/` — types, utilities, StoredSession
- `packages/shared/` — config, skills, sources, workspaces, auth, branding, LLM connections

These packages are the FOUNDATION. ZoneWise customization is a LAYER on top.

## PHASE 1: RESTORE CRAFT AGENTS BASELINE (apps/viewer/src/App.tsx)

### Step 1: Read the original App.tsx from upstream
The original working App.tsx is at:
https://raw.githubusercontent.com/lukilabs/craft-agents-oss/v0.4.0/apps/viewer/src/App.tsx

Fetch it. This is the BASELINE. Every import, every overlay, every handler must be preserved.

### Step 2: Read the Electron App for full feature reference
The desktop app at apps/electron/src/renderer/ has the COMPLETE feature set:
- `App.tsx` — Main app shell
- `pages/ChatPage.tsx` — Full chat with all overlays
- `components/chat/` — AuthRequestCard, EmptyStateHint
- `components/files/` — FileViewer
- `components/preview/` — TableOfContents
- `components/right-sidebar/` — SessionFilesSection, SessionMetadataPanel
- `components/app-shell/` — Main layout
- `components/workspace/` — Workspace management

Read ALL of these. Understand what the desktop app does. The web viewer must match.

### Step 3: Rewrite App.tsx with this EXACT structure

```typescript
// MANDATORY IMPORTS — DO NOT REMOVE ANY
import { useState, useCallback, useEffect, useMemo } from 'react'
import type { StoredSession } from '@craft-agent/core'
import {
  SessionViewer,
  GenericOverlay,
  CodePreviewOverlay,
  MultiDiffPreviewOverlay,
  TerminalPreviewOverlay,
  JSONPreviewOverlay,
  DocumentFormattedMarkdownOverlay,
  TooltipProvider,
  extractOverlayData,
  detectLanguage,
  type PlatformActions,
  type ActivityItem,
  type OverlayData,
  type FileChange,
} from '@craft-agent/ui'

// ZONEWISE ADDITIONS (layer on top, never replace)
// - ZoneWise sidebar (agents, skills, history)
// - SSE streaming to zonewise-agents.onrender.com/chat/stream
// - Stats panel, Mapbox map, data tables
// - Navy theme via CSS variables
// - 7-language support with RTL
```

### Step 4: Feature Parity Checklist
Every single one of these must work in the web viewer:

**Chat & Messaging:**
- [ ] SessionViewer component rendering messages
- [ ] Streaming responses with real-time updates
- [ ] Empty state hint when no messages
- [ ] Message activity click handlers

**File Handling:**
- [ ] File upload via attachment button (paperclip icon)
- [ ] Accepted types: .pdf, .docx, .csv, .xlsx, .png, .jpg
- [ ] File preview chip above input when attached
- [ ] File download button on response messages
- [ ] Image auto-resize for large files (>8000px)
- [ ] PDF rendering capability

**Overlay System (ALL 6 types):**
- [ ] CodePreviewOverlay — code files with syntax highlighting
- [ ] MultiDiffPreviewOverlay — file change diffs (Edit/Write)
- [ ] TerminalPreviewOverlay — command output display
- [ ] JSONPreviewOverlay — structured JSON data
- [ ] DocumentFormattedMarkdownOverlay — markdown/text documents
- [ ] GenericOverlay — fallback for unknown content types
- [ ] extractOverlayData utility connected to activity clicks
- [ ] detectLanguage for routing markdown to document overlay

**Platform Actions:**
- [ ] openUrl — opens links in new tab
- [ ] copyToClipboard — clipboard API
- [ ] File download via blob URL

**UI Framework:**
- [ ] TooltipProvider wrapping entire app
- [ ] Dark/light theme toggle
- [ ] Mobile responsive (hamburger menu at 768px)
- [ ] Keyboard shortcuts support

**ZoneWise Additions (LAYER, not replacement):**
- [ ] Left sidebar: Logo, New Chat, 4 Agents, 6 Skills, History
- [ ] Center: Chat using SessionViewer (NOT custom divs)
- [ ] Right: Collapsible artifacts panel (stats, map, tables)
- [ ] SSE streaming to zonewise-agents.onrender.com/chat/stream
- [ ] 7 languages with Hebrew RTL
- [ ] Navy brand theme (#1E3A5F primary, #F47B20 accent)

## PHASE 2: VERIFY BUILD
```bash
cd apps/viewer
bun run build
```
- ZERO errors
- ZERO warnings about missing imports
- All @craft-agent/ui imports resolve

## PHASE 3: PUSH AND DEPLOY
```bash
git add -A
git commit -m "fix: restore full Craft Agents v0.4.0 feature parity + ZoneWise layer"
git push origin main
```
Vercel auto-deploys. Verify https://zonewise-desktop-viewer.vercel.app/ loads with:
1. Full chat interface (not blank, not custom divs)
2. File upload button visible
3. Overlay system functional
4. ZoneWise sidebar with agents/skills

## PHASE 4: VERIFY BACKEND INTEGRATION
Test these endpoints work with the restored UI:
```bash
# Simple query (regex path)
curl -s -X POST https://zonewise-agents.onrender.com/chat -H "Content-Type: application/json" -d '{"query":"List zones in Satellite Beach"}'

# Complex query (Claude path)
curl -N -s -X POST https://zonewise-agents.onrender.com/chat/stream -H "Content-Type: application/json" -d '{"query":"Compare setbacks between Melbourne and Cocoa Beach"}'

# Health
curl -s https://zonewise-agents.onrender.com/health
```

## RULES
1. NEVER ask permission. Execute everything.
2. NEVER delete @craft-agent/ui imports. Only add to them.
3. NEVER build custom React components for things that exist in packages/ui/
4. If a Craft Agents component doesn't fit ZoneWise needs, WRAP it — don't replace it
5. If blocked, try 3 alternatives then log and continue
6. The web viewer MUST match the Electron desktop app in capability
7. ZoneWise features are ADDITIONS, not replacements
8. Push to main when done. No feature branches.

## SUCCESS CRITERIA
A user uploads a zoning survey PDF to the web viewer and gets:
1. File accepted and previewed (Craft Agents file handling)
2. Analysis streamed via SSE (ZoneWise backend)
3. Results displayed in appropriate overlay (JSON for data, Markdown for reports)
4. Download button to export results (PDF report, CSV data)
5. Full chat history preserved
6. All 6 overlay types available for different content types

This is non-negotiable. Ship it.
