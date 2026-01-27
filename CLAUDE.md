# ZoneWise Desktop - AI Architect Instructions

## Project Overview
ZoneWise Desktop is a white-label fork of Craft Agents, customized for zoning intelligence.

## Key Files
- `themes/zonewise.json` - Navy/Teal color scheme
- `skills/SKILL-*.md` - AI capabilities for zoning queries
- `config/mcp-servers.json` - MCP server configuration
- `apps/electron/` - Main desktop application

## Data Sources
- **Supabase:** mocerqjnksmhcjzxrewo.supabase.co
- **Tables:** zonewise_districts, zonewise_dimensional_standards, zonewise_use_permissions

## Development Rules
1. **Zero human-in-loop** - Execute autonomously, report results
2. **Data first** - No UI work until data is 90%+ complete
3. **Test before deploy** - Verify all changes work
4. **Commit frequently** - Small, descriptive commits

## Phase 1 Tasks (Current)
- [x] Fork from Craft Agents
- [x] Apply ZoneWise branding
- [x] Add theme file
- [x] Add skills
- [x] Update README
- [ ] Test build on Windows

## Phase 2 Tasks (Week 2)
- [ ] Add Mapbox integration
- [ ] Create MapPanel component
- [ ] Split-view layout (Chat | Map)
- [ ] Spatial queries via PostGIS

## Phase 3 Tasks (Week 3)
- [ ] Port ZoneWise components from breverdbidder/zonewise
- [ ] Integrate CitationDisplay
- [ ] Integrate ArtifactPanel

## Phase 4 Tasks (Week 4)
- [ ] Build Windows installer
- [ ] Build macOS DMG
- [ ] Test distribution packages
- [ ] Release v1.0.0

## Commands
```bash
# Development
cd apps/electron && bun run dev

# Build
bun run build

# Package
bun run dist:win   # Windows
bun run dist:mac   # macOS
```

## Upstream Sync
To pull updates from Craft Agents:
```bash
git remote add upstream https://github.com/lukilabs/craft-agents-oss.git
git fetch upstream
git merge upstream/main --no-edit
```

## Contact
- **Product Owner:** Ariel Shapira
- **AI Architect:** Claude (Sonnet 4.5)
- **Repo:** https://github.com/breverdbidder/zonewise-desktop
