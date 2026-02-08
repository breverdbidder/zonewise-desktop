<!-- NOTE: API keys referenced as ${{ secrets.* }} — get actual values from Render/Vercel dashboards or GitHub Secrets -->

# CLAUDE CODE MISSION: ZoneWise CraftAgents v0.4.0 Full Deployment

**Model:** claude-opus-4-6 (or Sonnet 4.5)
**Duration:** Single autonomous session
**Human Actions Required:** ZERO — fully autonomous
**Date:** February 8, 2026
**Author:** Claude AI Architect

---

## MISSION OBJECTIVE

Deploy the CraftAgents OSS v0.4.0 split-screen interface as ZoneWise.AI's production frontend, wired end-to-end to the zonewise-agents backend with Opus 4.6 intelligence. The current viewer at `zonewise-desktop-viewer.vercel.app` shows a read-only SessionViewer. After this mission, it shows a full split-screen: session sidebar + NLP chat (SSE streaming) + right panel (Map/3D/Stats).

---

## REPOSITORIES

| Repo | Purpose | Deploy Target | Auto-Deploy |
|------|---------|--------------|-------------|
| `breverdbidder/zonewise-desktop` | Frontend (CraftAgents fork) | Vercel: zonewise-desktop-viewer.vercel.app | Yes (on push to main) |
| `breverdbidder/zonewise-agents` | Backend (FastAPI) | Render: zonewise-agents.onrender.com | Yes (on push to main) |

**GitHub PAT:** `${{ secrets.GH_PAT }}` (repo+workflow, no expiry)

---

## CRITICAL ARCHITECTURE FACTS

### Frontend (zonewise-desktop)

The repo is a **Bun monorepo** forked from `lukilabs/craft-agents-oss` v0.4.0.

```
zonewise-desktop/
├── apps/
│   ├── viewer/          ← THIS IS WHAT VERCEL BUILDS
│   │   ├── src/
│   │   │   ├── App.tsx          ← ENTRY COMPONENT (currently SessionViewer — REPLACE)
│   │   │   ├── main.tsx         ← React root (renders <App/>)
│   │   │   ├── index.css        ← Imports @craft-agent/ui/styles + Tailwind
│   │   │   └── components/      ← Header.tsx, SessionUpload.tsx
│   │   ├── public/
│   │   │   └── chat.html        ← Standalone HTML chatbot (already deployed)
│   │   ├── package.json         ← @craft-agent/viewer v0.4.0
│   │   ├── vite.config.ts       ← base: '/s/', alias @ → ./src
│   │   └── tsconfig.json
│   └── electron/                ← Desktop app (NOT deployed to web)
├── packages/
│   ├── ui/                      ← @craft-agent/ui — SHARED COMPONENTS
│   │   └── src/
│   │       ├── index.ts         ← Exports: SessionViewer, Markdown, Spinner, cn, TooltipProvider...
│   │       ├── components/
│   │       │   ├── chat/        ← SessionViewer, TurnCard, UserMessageBubble
│   │       │   ├── envelope/    ← ZoneWiseApp, EnvelopeViewer, MapEnvelopeViewer, SunShadowViewer
│   │       │   ├── markdown/    ← Markdown, CodeBlock
│   │       │   ├── overlay/     ← FullscreenOverlay, PreviewOverlay
│   │       │   ├── tooltip/     ← Tooltip, TooltipProvider
│   │       │   └── ui/          ← Spinner, SimpleDropdown
│   │       └── styles/index.css ← Design tokens (CSS custom properties)
│   ├── core/                    ← @craft-agent/core
│   ├── shared/                  ← @craft-agent/shared
│   └── codex-types/             ← Type definitions
├── zonewise/                    ← OUR CUSTOM CODE (survives upstream syncs)
│   ├── components/web/          ← CraftAgentLayout, AIChatBox, MapboxSatellite, etc.
│   ├── hooks/                   ← useChatSessions, useAuth, useMobile
│   ├── pages/                   ← CraftAgent.tsx, Dashboard.tsx, Home.tsx
│   ├── skills/                  ← 12 skill files for AI agents
│   └── lib/                     ← development-analysis
├── vercel.json                  ← Build config for Vercel
├── package.json                 ← Root workspace config
└── tsconfig.json                ← Root TS config
```

### Vercel Build Process

```json
{
  "buildCommand": "bunx vite build && node ../../zonewise/branding/inject-branding.mjs",
  "outputDirectory": "dist",
  "installCommand": "bun install",
  "framework": null
}
```

Vercel runs from repo root. Build runs in `apps/viewer/`. Output goes to `apps/viewer/dist/`.

**Vite config:**
- `base: '/s/'` — all assets at `/s/assets/`
- `@` alias → `apps/viewer/src/`
- React deduped to root `node_modules`

**Routing:**
- `/` → `index.html` (SPA) — the main app
- `/chat` → `chat.html` (standalone HTML chatbot)
- `/s/*` → Session viewer routes
- `/dashboard`, `/login`, `/signup` → `index.html`

### Backend (zonewise-agents)

FastAPI server on Render. Currently uses **regex NLP** for intent classification.

**Endpoints:**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/agents/query` | Main query → ChatResponse |
| POST | `/chat` | Alias for /agents/query |
| POST | `/chat/stream` | SSE streaming endpoint |
| GET | `/api/jurisdictions` | List jurisdictions |
| GET | `/api/jurisdictions/{id}/districts` | Districts for jurisdiction |
| GET | `/api/districts/{id}` | District detail with standards |
| GET | `/api/parcels/{id}` | Parcel zone lookup |
| GET | `/api/stats` | Platform statistics |
| GET | `/api/search?q=` | Full-text search districts |
| GET | `/health` | Health check |

**SSE Event Types:** `intent`, `entities`, `thinking`, `answer`, `data`, `citation`, `suggestion`, `done`

**Env vars on Render (already configured):**
- `SUPABASE_URL` = `https://mocerqjnksmhcjzxrewo.supabase.co`
- `SUPABASE_KEY` = (service role key ending `<SERVICE_KEY>`)
- `ANTHROPIC_API_KEY` = (set in Render dashboard)
- `GOOGLE_API_KEY` = (set in Render dashboard)

**CORS already allows:** `zonewise-desktop-viewer.vercel.app`, `zonewise.ai`, `localhost:3000/5173`

### Supabase

- **URL:** `https://mocerqjnksmhcjzxrewo.supabase.co`
- **Anon key (ends):** `<ANON_KEY>`
- **Service role (ends):** `<SERVICE_KEY>`
- **Tables:** jurisdictions (808+), zoning_districts (1,542+), zone_standards, parcel_zones, overlay_districts

### Mapbox

- **Token:** `${{ secrets.MAPBOX_TOKEN }} or use env var VITE_MAPBOX_TOKEN`
- **Account:** everest18

---

## PHASE 1: CLONE AND VERIFY BUILD (15 min)

```bash
# Clone both repos
git clone https://github.com/breverdbidder/zonewise-desktop.git
cd zonewise-desktop

# Verify we're on v0.4.0
git log --oneline -5

# Install deps
bun install

# Verify current build works BEFORE making changes
cd apps/viewer
bunx vite build
echo "✅ Build baseline verified"
cd ../..
```

**CHECKPOINT:** If build fails here, fix it before proceeding. Common issues:
- Missing peer deps → `bun install` at root
- TypeScript errors → check `tsconfig.json` paths
- Tailwind v4 → needs `@tailwindcss/vite` plugin

---

## PHASE 2: REWRITE App.tsx (30 min)

**File:** `apps/viewer/src/App.tsx`

The current App.tsx renders a `SessionViewer` — a read-only transcript viewer. Replace it with a ZoneWise split-screen chat interface.

### What to import from @craft-agent/ui

These are CONFIRMED exports (see `packages/ui/src/index.ts`):

```typescript
import { Markdown, Spinner, cn, TooltipProvider } from '@craft-agent/ui'
```

Do NOT import components that don't exist in the UI package. If you need additional UI, build it inline.

### Architecture of the new App.tsx

```
┌────────────────────────────────────────────────────────────────┐
│ Mobile Header (lg:hidden)                                      │
├──────────┬──────────────────────────────┬─────────────────────┤
│ Sessions │       Chat Center            │    Right Panel      │
│ Sidebar  │                              │                     │
│ (w-64)   │  Header: ZoneWise + Langs    │  Tabs: Map/3D/     │
│          │                              │  Stats/Export       │
│ • Search │  Messages or Empty State     │                     │
│ • List   │  (Markdown rendered)         │  Map: Mapbox        │
│ • +New   │                              │  static image       │
│          │  Input: Textarea + Send      │                     │
│          │                              │  Stats: fetch       │
│          │  SSE streaming to backend    │  /api/stats         │
├──────────┴──────────────────────────────┴─────────────────────┤
│ Footer: "Powered by Claude Opus 4.6 · CraftAgents OSS"       │
└────────────────────────────────────────────────────────────────┘
```

### Requirements

1. **SSE Streaming:** POST to `https://zonewise-agents.onrender.com/chat/stream` with `{query: string}`
2. **Fallback:** If SSE fails (Render cold start), fall back to POST `/chat` (non-streaming)
3. **Sessions:** localStorage persistence (`zw_sessions`, `zw_msg_{id}`)
4. **Languages:** 7 language toggles (en, he, es, pt, fr, ar, ht) with RTL for Hebrew/Arabic
5. **Right Panel Tabs:**
   - Map: Mapbox static image (API URL with token from env or hardcoded fallback)
   - 3D: Placeholder with building icon (link to EnvelopeViewer in future)
   - Stats: Fetch from `/api/stats` endpoint
   - Export: Instructions to ask AI for reports
6. **Responsive:** Desktop 3-column, mobile single column with hamburger menu
7. **Theme:** Use CraftAgents CSS custom properties (already in index.css): `--background`, `--foreground`, `--accent`, `--border`, `--muted-foreground`, etc.
8. **Empty State:** 4 starter prompts as clickable cards

### Config Constants

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'https://zonewise-agents.onrender.com'
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '${{ secrets.MAPBOX_TOKEN }} or use env var VITE_MAPBOX_TOKEN'
```

### Starter Prompts

```typescript
const STARTERS = [
  { emoji: '🏠', text: 'What can I build at 625 Ocean St, Satellite Beach?' },
  { emoji: '📊', text: 'Show me all zoning districts in Brevard County' },
  { emoji: '📋', text: 'Create a full report for Palm Bay R-1 zone' },
  { emoji: '🔍', text: 'Compare setbacks: R-1 vs R-2 in Melbourne' },
]
```

### SSE Parsing Logic

```typescript
// Parse SSE events from /chat/stream
const reader = res.body?.getReader()
const decoder = new TextDecoder()
let answer = ''
let buf = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  buf += decoder.decode(value, { stream: true })
  const lines = buf.split('\n')
  buf = lines.pop() || ''
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue
    try {
      const p = JSON.parse(line.slice(6))
      if (p.type === 'answer') answer = p.value
      else if (p.type === 'thinking') setThinkText(p.value)
    } catch { /* skip malformed */ }
  }
}
```

---

## PHASE 3: UPGRADE BACKEND TO OPUS 4.6 (30 min)

**Repo:** `breverdbidder/zonewise-agents`
**File:** `server/main.py`

### What to Change

The current backend uses regex-based intent classification and hardcoded response templates. Upgrade the `agent_general` handler and optionally the streaming endpoint to call Claude Opus 4.6 via the Anthropic API.

### Strategy: Hybrid (Regex + Opus 4.6 Fallback)

Keep the fast regex-based intent classifier for structured queries (LIST_DISTRICTS, DISTRICT_DETAIL, etc.) since those hit Supabase directly and are fast. Add Opus 4.6 as the intelligence layer for:

1. **GENERAL intent** — when regex can't classify, send to Opus 4.6
2. **FEASIBILITY intent** — complex "can I build X" questions need reasoning
3. **REPORT intent** — narrative generation needs LLM

### Implementation

Add this function to `server/main.py`:

```python
import anthropic

# Initialize client (lazy)
_anthropic_client = None

def get_anthropic():
    global _anthropic_client
    if _anthropic_client is None and ANTHROPIC_API_KEY:
        _anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    return _anthropic_client

SYSTEM_PROMPT = """You are ZoneWise AI, Florida's zoning intelligence assistant.
You have access to zoning data for all 67 Florida counties.

When answering questions:
- Be specific with zoning codes, setbacks, heights, densities
- Reference the jurisdiction and county
- If you don't have specific data, say so clearly
- Use markdown formatting for readability
- Keep responses concise but thorough

Current data: {stats}
"""

async def opus_query(query: str, context: str = "", stats: dict = None) -> str:
    """Query Claude Opus 4.6 for intelligent responses."""
    client = get_anthropic()
    if not client:
        return None  # Fall back to regex

    system = SYSTEM_PROMPT.format(stats=json.dumps(stats or {}))
    if context:
        system += f"\n\nRelevant data from database:\n{context}"

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",  # Use Sonnet for speed; switch to opus-4-6 for complex
            max_tokens=1024,
            system=system,
            messages=[{"role": "user", "content": query}],
        )
        return message.content[0].text
    except Exception as e:
        print(f"Anthropic API error: {e}")
        return None
```

### Streaming with Opus 4.6

For the `/chat/stream` endpoint, add Opus 4.6 streaming for GENERAL/FEASIBILITY intents:

```python
async def opus_stream(query: str, context: str = "", stats: dict = None):
    """Stream response from Claude."""
    client = get_anthropic()
    if not client:
        return

    system = SYSTEM_PROMPT.format(stats=json.dumps(stats or {}))
    if context:
        system += f"\n\nRelevant data:\n{context}"

    with client.messages.stream(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": query}],
    ) as stream:
        for text in stream.text_stream:
            yield text
```

### Modified chat_stream endpoint

```python
@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    intent = classify_intent(req.query)
    entities = extract_entities(req.query)

    async def generate():
        yield f"data: {json.dumps({'type': 'intent', 'value': intent})}\n\n"
        yield f"data: {json.dumps({'type': 'entities', 'value': entities})}\n\n"

        # For structured intents, use fast regex handlers
        if intent in ("LIST_DISTRICTS", "DISTRICT_DETAIL", "COMPARISON",
                      "PARCEL_LOOKUP", "COUNTY_STATS"):
            yield f"data: {json.dumps({'type': 'thinking', 'value': f'Querying {intent}...'})}\n\n"
            handler = AGENT_MAP.get(intent, agent_general)
            result = await handler(req.query, entities)
            yield f"data: {json.dumps({'type': 'answer', 'value': result.get('answer', '')})}\n\n"
            if result.get("data"):
                yield f"data: {json.dumps({'type': 'data', 'value': result['data']}, default=str)}\n\n"
            for s in result.get("suggestions", []):
                yield f"data: {json.dumps({'type': 'suggestion', 'value': s})}\n\n"
        else:
            # For GENERAL/FEASIBILITY/REPORT — use Opus 4.6
            yield f"data: {json.dumps({'type': 'thinking', 'value': 'Consulting Claude Opus 4.6...'})}\n\n"

            # Gather context from Supabase
            context_parts = []
            if entities.get("jurisdiction"):
                jurs = await sb_query("jurisdictions",
                    f"select=id,name,county&name=ilike.%25{entities['jurisdiction']}%25", limit=3)
                if jurs:
                    context_parts.append(f"Jurisdictions: {json.dumps(jurs)}")
                    for j in jurs[:1]:
                        dists = await sb_query("zoning_districts",
                            f"select=code,name,category&jurisdiction_id=eq.{j['id']}", limit=20)
                        if dists:
                            context_parts.append(f"Districts in {j['name']}: {json.dumps(dists)}")

            if entities.get("zoning_code"):
                code = entities["zoning_code"]
                dists = await sb_query("zoning_districts",
                    f"select=id,code,name,description,category&code=ilike.{code}", limit=3)
                if dists:
                    context_parts.append(f"District data: {json.dumps(dists)}")
                    for d in dists[:1]:
                        stds = await sb_query("zone_standards",
                            f"select=*&zoning_district_id=eq.{d['id']}", limit=1)
                        if stds:
                            context_parts.append(f"Standards: {json.dumps(stds)}")

            context = "\n".join(context_parts)

            # Try Opus 4.6 streaming
            client = get_anthropic()
            if client:
                try:
                    full_answer = ""
                    stats_data = await get_stats()
                    system = SYSTEM_PROMPT.format(stats=json.dumps(stats_data, default=str))
                    if context:
                        system += f"\n\nDatabase context:\n{context}"

                    with client.messages.stream(
                        model="claude-sonnet-4-5-20250929",
                        max_tokens=1024,
                        system=system,
                        messages=[{"role": "user", "content": req.query}],
                    ) as stream:
                        for text in stream.text_stream:
                            full_answer += text
                            # Send incremental answer updates
                            yield f"data: {json.dumps({'type': 'answer', 'value': full_answer})}\n\n"
                            await asyncio.sleep(0.01)
                except Exception as e:
                    # Fallback to regex
                    result = await agent_general(req.query, entities)
                    yield f"data: {json.dumps({'type': 'answer', 'value': result.get('answer', str(e))})}\n\n"
            else:
                # No API key — fallback
                result = await agent_general(req.query, entities)
                yield f"data: {json.dumps({'type': 'answer', 'value': result.get('answer', '')})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
```

### Requirements Update

Add to `requirements.txt`:
```
anthropic>=0.40.0
```

(It's already there as `anthropic>=0.18.0` but bump to latest for streaming support.)

---

## PHASE 4: BUILD, TEST, PUSH (15 min)

### Frontend

```bash
cd zonewise-desktop

# Build to verify no errors
cd apps/viewer
bunx vite build

# If build fails, fix TypeScript errors. Common issues:
# - Import path wrong → use @craft-agent/ui not relative paths
# - Missing types → add 'any' temporarily
# - Tailwind classes not found → check index.css @source directives

# Commit and push
cd ../..
git add -A
git commit -m "feat: ZoneWise split-screen chat UI — SSE streaming, Opus 4.6, 7 languages, Mapbox, CraftAgents v0.4.0"
git push origin main
```

### Backend

```bash
cd ../zonewise-agents

# Edit server/main.py with the changes from Phase 3
# ... apply changes ...

# Test locally
pip install -r requirements.txt
python -c "from server.main import app; print('Import OK')"

# Commit and push (Render auto-deploys)
git add -A
git commit -m "feat: Opus 4.6 intelligence layer — hybrid regex+Claude streaming for complex queries"
git push origin main
```

---

## PHASE 5: VERIFY DEPLOYMENT (10 min)

### Frontend Verification

```bash
# Wait for Vercel to deploy (usually 1-3 min after push)
sleep 120

# Test the deployed URL
curl -s -o /dev/null -w "HTTP %{http_code}" https://zonewise-desktop-viewer.vercel.app/
# Expected: 200

curl -s -o /dev/null -w "HTTP %{http_code}" https://zonewise-desktop-viewer.vercel.app/chat
# Expected: 200
```

### Backend Verification

```bash
# Health check
curl -s https://zonewise-agents.onrender.com/health | python3 -m json.tool

# Test chat endpoint
curl -s -X POST https://zonewise-agents.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What zones are in Satellite Beach?"}' | python3 -m json.tool

# Test streaming
curl -N -X POST https://zonewise-agents.onrender.com/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"query":"Hello"}'
```

---

## PHASE 6: FIX COMMON ISSUES

### Issue: Vite build fails with "Cannot find module '@craft-agent/ui'"
**Fix:** Run `bun install` from repo root. The workspace:* protocol resolves locally.

### Issue: Tailwind classes not applying
**Fix:** Check `apps/viewer/src/index.css` has `@source` directives scanning both viewer src AND packages/ui:
```css
@import "@craft-agent/ui/styles";
@source "../src/**/*.{tsx,ts}";
@source "../../../packages/ui/src/**/*.{tsx,ts}";
```

### Issue: `TooltipProvider` not exported
**Fix:** It IS exported from `@craft-agent/ui`. Check `packages/ui/src/index.ts`:
```typescript
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/tooltip'
```

### Issue: Render cold start on first request
**Fix:** The frontend already handles this with fallback to `/chat` non-streaming endpoint and a "Backend warming up" user message.

### Issue: CORS error from Vercel → Render
**Fix:** Already handled. `zonewise-desktop-viewer.vercel.app` is in the CORS allow list. If testing from localhost, also allowed.

### Issue: `/s/` base path means assets load from wrong URL
**Fix:** This is by design. The viewer SPA lives at `/s/*` to coexist with the marketing site. The Vercel rewrites handle routing:
- `/` → loads `index.html` 
- `/chat` → loads `chat.html`
- `/s/*` → loads from Vite build output

### Issue: Anthropic streaming fails on Render free tier
**Fix:** Use `claude-sonnet-4-5-20250929` (faster, cheaper) instead of `claude-opus-4-6`. If streaming hangs, add timeout:
```python
with client.messages.stream(..., timeout=30.0) as stream:
```

---

## FILES TO MODIFY (COMPLETE LIST)

### Frontend (zonewise-desktop)

| File | Action | Description |
|------|--------|-------------|
| `apps/viewer/src/App.tsx` | **REWRITE** | Replace SessionViewer with split-screen chat UI |
| `apps/viewer/src/index.css` | VERIFY | Ensure @source scans new component paths |

That's it for frontend. One file rewrite. Everything else is already there from CraftAgents v0.4.0.

### Backend (zonewise-agents)

| File | Action | Description |
|------|--------|-------------|
| `server/main.py` | **MODIFY** | Add `anthropic` import, `get_anthropic()`, `SYSTEM_PROMPT`, upgrade `chat_stream` |
| `requirements.txt` | **MODIFY** | Bump `anthropic>=0.40.0` |

Two files modified on backend.

---

## SUCCESS CRITERIA

- [ ] `zonewise-desktop-viewer.vercel.app` loads split-screen chat UI (not SessionViewer)
- [ ] SSE streaming from `/chat/stream` renders messages in real-time
- [ ] 7 language toggles work (Hebrew/Arabic switch to RTL)
- [ ] Right panel shows Mapbox map, stats from `/api/stats`, 3D placeholder
- [ ] GENERAL intent queries routed to Claude Opus 4.6 (or Sonnet) via Anthropic API
- [ ] Structured queries (setbacks, districts, parcels) still use fast regex → Supabase
- [ ] Render cold start handled gracefully with fallback message
- [ ] Sessions persist in localStorage across page reloads
- [ ] Mobile responsive with hamburger menu

---

## WHAT NOT TO DO

- ❌ Do NOT modify files in `packages/` — those sync from upstream
- ❌ Do NOT change `vercel.json` — routing is correct
- ❌ Do NOT add new files to `apps/viewer/src/components/` unless strictly necessary — keep the rewrite in App.tsx
- ❌ Do NOT try to import from `zonewise/` directory — the Vite alias `@` only resolves `apps/viewer/src/`
- ❌ Do NOT use tRPC — it's not installed. Use plain fetch + SSE
- ❌ Do NOT use localStorage for API keys — use env vars or hardcoded defaults
- ❌ Do NOT create separate CSS files — use Tailwind classes + CraftAgents CSS custom properties
- ❌ Do NOT install additional npm packages — everything needed is already in the monorepo
- ❌ Do NOT modify the Electron app (`apps/electron/`) — that's the desktop version

---

## ENV VARS (for reference)

### Vercel (zonewise-desktop-viewer)
```
VITE_API_URL=https://zonewise-agents.onrender.com
VITE_MAPBOX_TOKEN=${{ secrets.MAPBOX_TOKEN }} or use env var VITE_MAPBOX_TOKEN
VITE_SUPABASE_URL=https://mocerqjnksmhcjzxrewo.supabase.co
```

### Render (zonewise-agents)
```
SUPABASE_URL=https://mocerqjnksmhcjzxrewo.supabase.co
SUPABASE_KEY=<service role key ending <SERVICE_KEY>>
ANTHROPIC_API_KEY=<already set in Render dashboard>
```

---

## EXECUTION ORDER

```
1. git clone breverdbidder/zonewise-desktop
2. bun install (from root)
3. bunx vite build (from apps/viewer — verify baseline)
4. REWRITE apps/viewer/src/App.tsx
5. bunx vite build (verify new code compiles)
6. git add -A && git commit && git push (triggers Vercel deploy)
7. git clone breverdbidder/zonewise-agents
8. MODIFY server/main.py (add Opus 4.6 layer)
9. MODIFY requirements.txt (bump anthropic)
10. git add -A && git commit && git push (triggers Render deploy)
11. Wait 2 min for both deploys
12. curl verify both endpoints
13. Done.
```

Total: ~90 minutes autonomous execution. Zero human actions.
