# CLAUDE CODE AUTONOMOUS PARITY RESTORATION
# ==========================================
# This file is the mission prompt for Claude Code when feature parity fails.
# Triggered by: sync-upstream.yml parity check → GitHub Issue → Traycer plan → Claude Code
#
# USAGE:
#   claude --dangerously-skip-permissions -p "$(cat docs/CLAUDE_CODE_PARITY_FIX.md)"

## OBJECTIVE
Restore full Craft Agents feature parity in apps/viewer/src/App.tsx.
The previous build deleted @craft-agent/ui imports. Fix this NOW.

## NEVER ASK PERMISSION. EXECUTE EVERYTHING.

## STEP 1: Read upstream baseline
```bash
curl -s "https://raw.githubusercontent.com/lukilabs/craft-agents-oss/v0.4.0/apps/viewer/src/App.tsx" > /tmp/upstream_app.tsx
cat /tmp/upstream_app.tsx
```

## STEP 2: Read current App.tsx
```bash
cat apps/viewer/src/App.tsx
```

## STEP 3: Identify missing imports
Compare current vs upstream. These MUST exist:
- SessionViewer
- CodePreviewOverlay
- MultiDiffPreviewOverlay
- TerminalPreviewOverlay
- JSONPreviewOverlay
- DocumentFormattedMarkdownOverlay
- GenericOverlay
- TooltipProvider
- extractOverlayData
- detectLanguage
- PlatformActions

## STEP 4: Rewrite App.tsx
- Start from upstream baseline
- ADD ZoneWise sidebar (agents, skills, history) as wrapper
- ADD SSE streaming to zonewise-agents.onrender.com/chat/stream
- ADD navy theme CSS variables
- ADD 7-language support
- KEEP all upstream imports and components
- WRAP SessionViewer, don't replace it

## STEP 5: Build and verify
```bash
bun install
bun run viewer:build
```
Must complete with 0 errors.

## STEP 6: Push
```bash
git add -A
git commit -m "fix: restore Craft Agents feature parity in App.tsx"
git push origin main
```

## STEP 7: Verify deployment
```bash
sleep 90
curl -s -o /dev/null -w "%{http_code}" https://zonewise-desktop-viewer.vercel.app/
curl -s https://zonewise-desktop-viewer.vercel.app/ | grep -c 'assets/index-.*\.js'
```

## IF ANY STEP FAILS
1. Read the error message
2. Fix the issue
3. Retry (max 3 attempts per step)
4. If still blocked after 3 retries, log the error and continue to next step

## SUCCESS = ALL TRUE:
- [ ] All 11 @craft-agent/ui imports present in App.tsx
- [ ] Build succeeds with 0 errors
- [ ] Website returns 200 with JS bundle loading
- [ ] ZoneWise sidebar renders (agents, skills, history)
- [ ] SessionViewer renders chat messages
