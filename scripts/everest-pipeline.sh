#!/bin/bash
set -euo pipefail
export PATH=$HOME/.bun/bin:$PATH
cd /opt/zonewise-desktop && source .env
D=${1:-$(date +%Y-%m-%d)}
W=$HOME/.craft-agent/workspaces/biddeed
C='bun run apps/cli/src/index.ts run --workspace-dir '$W' --no-spinner'
O=/tmp/everest-$(date +%Y%m%d-%H%M%S); mkdir -p $O
$C --provider google --model gemini-2.5-flash --api-key $GOOGLE_API_KEY --output-format json --prompt 'Scout: 3 Brevard FL auctions. JSON.' > $O/01.json 2>&1
$C --provider deepseek --model deepseek-chat --api-key $DEEPSEEK_API_KEY --output-format json --prompt 'Analyst: Risk for '$(tail -20 $O/01.json)'. JSON.' >$O/02.json 2>&1
$C --provider deepseek --model deepseek-chat --api-key $DEEPSEEK_API_KEY --output-format json --prompt 'Arbiter: Decide '$(tail -20 $O/02.json)'. JSON.' >$O/03.json 2>&1
$C --provider google --model gemini-2.5-flash --api-key $GOOGLE_API_KEY --output-format text --prompt 'Scribe: Report '$(tail -20 $O/03.json) >$O/04.txt 2>&1
echo DONE: $O && head -20 $O/04.txt
