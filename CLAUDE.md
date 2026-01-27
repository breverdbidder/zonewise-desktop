# ZoneWise Desktop - AI Architect Instructions

## Project Overview
ZoneWise Desktop is a white-label fork of Craft Agents, customized for zoning intelligence.

**Repository:** https://github.com/breverdbidder/zonewise-desktop

## Key Files

### Configuration
- `themes/zonewise.json` - Navy/Teal color scheme
- `config/mcp-servers.json` - MCP server configuration

### Skills
- `skills/SKILL-zoning-lookup.md` - Zoning district queries
- `skills/SKILL-setback-calculator.md` - Setback calculations
- `skills/SKILL-use-permission-check.md` - Use permission verification
- `skills/SKILL-map-visualization.md` - Map display instructions

### Components
- `apps/electron/src/renderer/components/zonewise/MapPanel.tsx` - Mapbox map component
- `artifacts/zonewise-map.html` - Standalone map artifact

### Documentation
- `docs/MAPBOX-SETUP.md` - Mapbox token setup guide

## Data Sources
- **Supabase:** mocerqjnksmhcjzxrewo.supabase.co
- **Tables:** 
  - `zoning_districts` (301 records)
  - `jurisdictions` (17 records)

## Development Rules
1. **Zero human-in-loop** - Execute autonomously, report results
2. **Data first** - No UI work until data is 90%+ complete
3. **Test before deploy** - Verify all changes work
4. **Commit frequently** - Small, descriptive commits

## Phase Status

### Phase 1: Fork & Brand ✅ COMPLETE
- [x] Fork from Craft Agents
- [x] Apply ZoneWise branding
- [x] Add theme file
- [x] Add skills (zoning-lookup, setback-calculator, use-permission-check)
- [x] Update README
- [x] Test build on Windows

### Phase 2: Mapbox Integration ✅ COMPLETE
- [x] Create MapPanel React component
- [x] Add map visualization skill
- [x] Create standalone map artifact
- [x] Add Mapbox setup documentation
- [x] Define jurisdiction coordinates (17 locations)
- [x] Define category color scheme

### Phase 3: Component Integration (Week 3)
- [ ] Port ZoneWise components from breverdbidder/zonewise
- [ ] Integrate split-view layout (Chat | Map)
- [ ] Add spatial queries via PostGIS

### Phase 4: Distribution (Week 4)
- [ ] Build Windows installer
- [ ] Build macOS DMG
- [ ] Test distribution packages
- [ ] Release v1.0.0

## Mapbox Configuration

### Jurisdiction Centers
| ID | Name | Lat | Lng | Districts |
|----|------|-----|-----|-----------|
| 1 | Melbourne | 28.0836 | -80.6081 | 26 |
| 2 | Palm Bay | 27.9606 | -80.5887 | 25 |
| 3 | Indian Harbour Beach | 28.1472 | -80.5887 | 12 |
| 4 | Titusville | 28.6122 | -80.8076 | 40 |
| 5 | Cocoa | 28.3861 | -80.7420 | 21 |
| 6 | Satellite Beach | 28.1761 | -80.5901 | 8 |
| 7 | Cocoa Beach | 28.3200 | -80.6078 | 12 |
| 8 | Rockledge | 28.3169 | -80.7248 | 21 |
| 9 | West Melbourne | 28.0722 | -80.6519 | 11 |
| 10 | Cape Canaveral | 28.4058 | -80.6056 | 9 |
| 11 | Indialantic | 28.0897 | -80.5656 | 8 |
| 12 | Melbourne Beach | 28.0681 | -80.5617 | 8 |
| 13 | Unincorporated | 28.3000 | -80.7000 | 54 |
| 14 | Malabar | 28.0000 | -80.5667 | 13 |
| 15 | Grant-Valkaria | 27.9400 | -80.5500 | 6 |
| 16 | Palm Shores | 28.1167 | -80.5833 | 4 |
| 17 | Melbourne Village | 28.0800 | -80.6700 | 23 |

### Category Colors
| Category | Color |
|----------|-------|
| Residential | #10B981 |
| Commercial | #0D9488 |
| Industrial | #6366F1 |
| Mixed-Use | #8B5CF6 |
| Agricultural | #84CC16 |
| Conservation | #22C55E |
| Planned Development | #F59E0B |

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

## Contact
- **Product Owner:** Ariel Shapira
- **AI Architect:** Claude (Sonnet 4.5)
- **Repo:** https://github.com/breverdbidder/zonewise-desktop
