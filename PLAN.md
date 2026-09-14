# PLAN: Ecosystem security gate for zonewise-desktop

## Objective
Embed the ecosystem security stack (gitleaks blocking gate, trufflehog nightly verified sweep, zizmor + trivy advisory) into zonewise-desktop CI, matching the rollout already merged on biddeed-web, claude-code-telegram-control, cliproxy-gateway, gods-eye-view, zonewise-web, status, biddeed-ai-ui, and zonewise-3d-viewer.

## Files Changed
- `.github/workflows/security.yml` (new): 4-job security workflow, pinned-release scanner binaries, SHA-pinned checkout, top-level `permissions: {}`.
- `.gitleaks.toml` (new): shared secret rule set (Telegram bot token, OpenRouter, Mapbox sk., Supabase service-role/PAT, Cloudflare, fal.ai) extending gitleaks defaults.
- `.gitleaksignore` (new): baseline of 73 pre-existing findings triaged dead by a trufflehog verified sweep (one dead AgentQL key fanned across county SKILL.md files, dead Supabase JWTs, public Mapbox pk tokens); gate fails closed on NEW secrets only.
- `.pre-commit-config.yaml` (new): optional local gitleaks gate.

## Approach
Implementation PR from branch `security-gate`. Gitleaks scans PR diff on pull_request and full history on push (blocking). TruffleHog runs nightly + workflow_dispatch, `--only-verified`, Raw values stripped. Zizmor and Trivy advisory (continue-on-error) for one week, then flip to blocking after the fix wave. No application code changes, no new runtime dependencies, no secrets added.

## Risks
- Advisory jobs show red in job detail until triage (cosmetic; workflow concludes success).
- 45 pre-existing zizmor high findings in this repo's workflows remain until the fix wave (tracked separately).
- Plan-enforcement Gate 1 requires this plan PR architect-approved first (this document exists for that).

## NOT Doing
- No flipping of zizmor/trivy to blocking yet.
- No remediation of existing workflow debt (separate fix wave).
- No changes to deploy workflows, runner config, or Actions secrets.

## Estimated Complexity: Low
Low - 4 additive config files, no code changes, pattern proven green on 8 repos.
