#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# CRAFT CLI + HEADLESS SERVER — Hetzner Deployment
# Target: everest-dispatch (87.99.129.125)
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

echo "⛰️ Setting up Craft Agents headless server on Hetzner..."

# 1. Install Bun
if ! command -v bun &> /dev/null; then
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi
echo "✅ Bun: $(bun --version)"

# 2. Clone the fork
INSTALL_DIR="/opt/zonewise-desktop"
if [ -d "$INSTALL_DIR" ]; then
    cd "$INSTALL_DIR"
    git pull origin main
else
    git clone https://github.com/breverdbidder/zonewise-desktop.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi
echo "✅ Repo: v$(cat package.json | jq -r '.version')"

# 3. Install dependencies
bun install
echo "✅ Dependencies installed"

# 4. Create BidDeed.AI workspace
WORKSPACE_DIR="$HOME/.craft-agent/workspaces/biddeed"
mkdir -p "$WORKSPACE_DIR"/{skills,sources,sessions}

# Copy ZoneWise skills into workspace
cp -r zonewise/skills/* "$WORKSPACE_DIR/skills/" 2>/dev/null || true
echo "✅ Skills installed: $(ls $WORKSPACE_DIR/skills/ | wc -l)"

# Copy sources
cp -r zonewise/sources/* "$WORKSPACE_DIR/sources/" 2>/dev/null || true
echo "✅ Sources installed"

# 5. Create workspace config
cat > "$WORKSPACE_DIR/config.json" << 'WSCONFIG'
{
  "name": "BidDeed.AI",
  "permissionMode": "auto",
  "defaultConnection": "gemini",
  "cwd": "/opt/zonewise-desktop"
}
WSCONFIG
echo "✅ Workspace config written"

# 6. Create main config with LLM connections
cat > "$HOME/.craft-agent/config.json" << MAINCONFIG
{
  "workspaces": [
    {
      "id": "biddeed",
      "name": "BidDeed.AI",
      "path": "$WORKSPACE_DIR"
    }
  ],
  "connections": [
    {
      "slug": "gemini",
      "provider": "google",
      "name": "Gemini 2.5 Flash (FREE)",
      "model": "gemini-2.5-flash"
    },
    {
      "slug": "deepseek",
      "provider": "custom",
      "name": "DeepSeek V3.2",
      "model": "deepseek-chat",
      "baseUrl": "https://api.deepseek.com/v1"
    },
    {
      "slug": "claude",
      "provider": "anthropic",
      "name": "Claude Sonnet",
      "model": "claude-sonnet-4-20250514"
    }
  ]
}
MAINCONFIG
echo "✅ LLM connections configured"

# 7. Set env vars (user must fill these in)
cat > "$INSTALL_DIR/.env" << 'ENVFILE'
# LLM API Keys
GOOGLE_API_KEY=       # Gemini — FREE
DEEPSEEK_API_KEY=     # DeepSeek V3.2 — $0.28/1M
ANTHROPIC_API_KEY=    # Only for quality tier (avoid if using Max plan)

# Supabase
SUPABASE_URL=mocerqjnksmhcjzxrewo.supabase.co
SUPABASE_ANON_KEY=    # Fill from SUPABASE_CREDENTIALS.md

# Server
CRAFT_SERVER_PORT=9100
CRAFT_SERVER_TOKEN=   # Generate: openssl rand -hex 32
ENVFILE
echo "⚠️  Fill API keys in $INSTALL_DIR/.env"

# 8. Create systemd service for headless server
sudo cat > /etc/systemd/system/craft-agent.service << 'SYSTEMD'
[Unit]
Description=Craft Agent Headless Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/zonewise-desktop
ExecStart=/root/.bun/bin/bun run apps/headless/src/index.ts
Restart=always
RestartSec=5
EnvironmentFile=/opt/zonewise-desktop/.env

[Install]
WantedBy=multi-user.target
SYSTEMD

sudo systemctl daemon-reload
echo "✅ Systemd service created (not started — fill .env first)"

# 9. Test craft-cli
echo ""
echo "═══════════════════════════════════════"
echo "  READY. Next steps:"
echo "═══════════════════════════════════════"
echo "  1. Fill API keys in .env"
echo "  2. sudo systemctl start craft-agent"
echo "  3. Test: bun run apps/cli/src/index.ts run \\"
echo "       --workspace biddeed --provider google \\"
echo "       --prompt '/scout List upcoming Brevard auctions'"
echo "  4. Verify: systemctl status craft-agent"
echo ""
echo "  Pipeline test:"
echo "  SCOUT=\$(bun run apps/cli/src/index.ts run \\"
echo "    --workspace biddeed --provider google \\"
echo "    --output-format json --no-spinner \\"
echo "    --prompt '/scout Find auctions for March 18')"
echo ""
echo "  bun run apps/cli/src/index.ts run \\"
echo "    --workspace biddeed --provider deepseek \\"
echo "    --prompt \"/analyst Analyze: \$SCOUT\""
echo "═══════════════════════════════════════"
