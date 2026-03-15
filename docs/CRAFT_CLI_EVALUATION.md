# Craft CLI vs LangGraph — Evaluation Results

**Date:** 2026-03-15
**Evaluator:** Claude AI Architect
**Decision:** CRAFT CLI REPLACES LANGGRAPH

## Key Findings

### 1. Session Chaining — YES
`craft-cli run` with `--output-format json` produces pipeable JSON output.
Shell-native chaining replaces LangGraph's JSON handoff state machine.

### 2. Headless Deployment — YES
`apps/headless/src/index.ts` runs as standalone Bun server.
Deploys on Hetzner (everest-dispatch) without Electron.

### 3. Multi-Provider Routing — YES
`--provider` flag: google, deepseek, anthropic, custom.
Per-command provider selection = Smart Router without custom code.

### 4. Skills + Sources in CLI — YES
`--workspace biddeed` loads workspace skills/sources.
`--source realforeclose` enables sources per-session.

## What Craft CLI Replaces

| Component | Status | Replacement |
|-----------|--------|-------------|
| LangGraph | KILLED | craft-cli piped sessions |
| LiteLLM | KILLED | native --provider flag |
| CLIProxy Gateway | KILLED | --provider + --api-key |
| Custom state mgmt | KILLED | session persistence (JSONL) |
| Circuit breakers | KILLED | --send-timeout + exit codes |

## What Remains

| Component | Status | Why |
|-----------|--------|-----|
| Supabase | KEEP | Data layer (245K auctions) |
| GitHub Actions | KEEP | Orchestrates pipeline cron |
| cli-anything | KEEP | Scraping harnesses |
| Vite frontend | KEEP | Web UI separate from desktop |

## Revised Pipeline Architecture

```
GitHub Action (cron 6AM Mon-Fri)
  └─→ SSH to Hetzner (everest-dispatch)
       └─→ craft-cli run --workspace biddeed --provider google
            --prompt "/scout Find auctions for $DATE"
            --output-format json → $SCOUT_OUT
       └─→ craft-cli run --workspace biddeed --provider deepseek
            --prompt "/analyst Analyze: $SCOUT_OUT"  
            --output-format json → $ANALYST_OUT
       └─→ craft-cli run --workspace biddeed --provider deepseek
            --prompt "/arbiter Decide: $ANALYST_OUT"
            --output-format json → $DECISION
       └─→ craft-cli run --workspace biddeed --provider anthropic
            --prompt "/scribe Report: $DECISION"
            → Supabase insert + DOCX artifact
  └─→ Telegram notify with results
```

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Craft CLI is 9 days old | MEDIUM | Shell fallback to claude CLI if broken |
| JSON output format stability | LOW | Pin to v0.7.5, test before upgrade |
| Hetzner headless mode maturity | MEDIUM | Systemd restart + health checks |
| Session output size limits | LOW | Summarize between stages |

## Next Steps

1. ~~Merge upstream v0.7.5~~ ✅ DONE
2. Deploy headless server on Hetzner
3. Create BidDeed.AI workspace with skills
4. Test pipeline: Scout → Analyst → Arbiter → Scribe
5. Build GitHub Action for daily auction pipeline
