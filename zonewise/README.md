# ZoneWise.AI Integration Layer

This folder contains all ZoneWise.AI customizations for the Craft Agents platform.

## Directory Structure

```
zonewise/
├── skills/           # ZoneWise-specific agent skills
├── sources/          # MCP sources for BCPAO, GIS, Municode
├── data/             # Jurisdiction configs, zoning codes, DIMS
├── branding/         # ZoneWise.AI themes and assets
└── config/           # App configuration overrides
```

## Key Principle

**NEVER modify files outside this folder!**

All upstream Craft Agents code in `apps/` and `packages/` must remain untouched
to ensure clean auto-sync with upstream updates.

## Integration Points

1. **Skills**: Add custom skills that appear in workspace skill picker
2. **Sources**: Pre-configure BCPAO, GIS, and Municode MCP connections
3. **Data**: 17 jurisdictions, 301 zoning districts, dimensional standards
4. **Branding**: ZoneWise.AI theme, icons, and splash screens

## Compliance

Per Craft Agents TRADEMARK.md:
- App name: "ZoneWise.AI Desktop" (not "Craft Agents")
- Credit: "Powered by Craft Agents technology"
