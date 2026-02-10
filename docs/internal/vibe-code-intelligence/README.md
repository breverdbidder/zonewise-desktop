# Vibe Code Best Practices — Internal Dev Reference

> ⚠️ **INTERNAL ONLY** — This data is for the ZoneWise development team, NOT for end users.
> Real estate agents see only real estate tools in the product.

## What This Is

627+ curated modern dev tools extracted via MCP API from 
[vibe-code-best-practices.vercel.app](https://vibe-code-best-practices.vercel.app/api/mcp).

Used by our dev team to evaluate frameworks, MCP servers, skills, and UI components 
for building ZoneWise.AI.

## Files

| File | Description |
|------|-------------|
| `vibe-code-full-catalog.json` | Complete 627-tool catalog (all sections) |
| `vibe-code-marketplace-map.json` | Tools mapped to ZoneWise dev categories with priorities |
| `vibeCodeMCPClient.ts` | TypeScript client for querying the MCP server |

## MCP Endpoint

```
POST https://vibe-code-best-practices.vercel.app/api/mcp
Protocol: MCP 2024-11-05 (Streamable HTTP)
Tools: list-sections, search-tools, get-section
```

## Priority Mapping (for our dev decisions)

- **P0 Core**: AI Agents (20), MCP Servers (24), Skills (122)
- **P1 Important**: Modern Stack (69), UI Components (161)
- **P2 Nice to have**: Design (83), Dev Tools (25), Templates (26)
- **P3 Future**: Mobile (97)

## Usage

This is reference data for sprint planning and tech stack decisions.
Do NOT expose any of this to end users or the marketing site.
