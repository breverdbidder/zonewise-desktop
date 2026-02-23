---
name: county-washington
description: >
  Zoning intelligence for Washington County, FL.
  4 jurisdictions, FDOR co_no 67.
  Portal: municode. Anti-scrape: false.
  Triggers: Washington, washington county, Chipley, co_no 67.
co_no: 67
county_slug: washington
portal_type: municode
anti_scrape: false
rate_limit_rpm: 20
phase: P3
last_validated: 2026-02-23
---

# Washington County — Zoning Intelligence

**Seat**: Chipley | **Pop**: 24,888 | **Municipalities**: 4
**FDOR co_no**: 67 | **Portal**: MUNICODE | **Phase**: P3

---

## Supabase Queries

Host: `mocerqjnksmhcjzxrewo.supabase.co` — use `apikey` + `Authorization: Bearer` headers.

### Jurisdictions in this county
```
GET /jurisdictions?county=ilike.%25Washington%25&select=id,name,data_completeness,municode_url&order=name.asc
```

### Zoning districts for a jurisdiction
```
GET /zoning_districts?jurisdiction_id=eq.{id}&select=id,code,name,category&order=category,code
```

### Dimensional standards
```
GET /zone_standards?zoning_district_id=eq.{district_id}&select=*
```

### Permitted uses
```
GET /permitted_uses?zoning_district_id=eq.{district_id}&select=use_name,permission_type,use_category
```

### Parcel lookup by address
```
GET /fl_parcels?co_no=eq.67&phy_addr1=ilike.%25{street}%25&select=parcel_id,phy_addr1,phy_city,phy_zipcd,dor_uc,centroid_lat,centroid_lng&limit=5
```

### Parcel lookup by parcel ID
```
GET /fl_parcels?co_no=eq.67&parcel_id=eq.{parcel_id}&select=*
```

---

## 3-Mode Research Protocol (CrossBeam Pattern)

### Mode 1 — Discovery (WebSearch ≤30s)
**Trigger**: portal unknown OR last_validated > 30 days
Queries:
1. `"Washington County Florida zoning map"`
2. `"Washington County Florida municode zoning ordinance"`
3. `"Washington County GIS ArcGIS zoning Florida"`
**Output** → UPDATE `jurisdictions.skill_last_validated`

### Mode 2 — Extraction (WebFetch ≤90s)
**Target**: https://library.municode.com/fl/washington_county
**Extract**: district codes, permitted uses, setbacks, height limits, FAR
**Output** → UPSERT `zoning_districts`, `zone_standards`, `permitted_uses`

### Mode 3 — AgentQL/Modal (fallback)
**Trigger**: Mode 2 empty OR anti_scrape=false
**Rate limit**: 20 rpm | **Anti-detect**: DISABLED
**Container**: `modal-county-washington`

AgentQL selector:
```python
await page.query_elements("""
  {
    zoning_table {
      district_code
      district_name
      uses_permitted[]
      setback_front
      setback_side
      setback_rear
      max_height
    }
  }
""")
```

---

## Circuit Breaker
All 3 modes fail → INSERT `insights` table with `type='ESCALATE'`, `county='washington'` → Traycer auto-issue.

---

## County Profile

| Field | Value |
|-------|-------|
| FDOR co_no | 67 |
| Seat | Chipley |
| Population | 24,888 |
| Municipalities | 4 |
| Portal | MUNICODE |
| Municode | [washington_county](https://library.municode.com/fl/washington_county) |
| Anti-scrape | No |
| Rate limit | 20 rpm |
| Phase | P3 |
| Last validated | 2026-02-23 |

---

## Standard FL Zoning Categories

| Category | Typical Codes |
|----------|--------------|
| Residential | RS, RE, RM, R-1, R-2, R-3, RSF |
| Commercial | CN, CG, CB, C-1, C-2, C-3 |
| Industrial | IL, IH, LI, I-1, I-2 |
| Agricultural | A, AG, AU, A-1, A-5 |
| Mixed Use | MX, MU, TOD |
| Special | PUD, DRI, CDD |
| Conservation | CV, CON, GU |

*Actual codes populated after Mode 2/3 extraction*

---

## Progressive Disclosure (CraftAgents)
- **Level 1** (always): YAML frontmatter ~80 tokens
- **Level 2** (on county mention): Full SKILL.md ~700 tokens
- **Level 3** (deep extraction): references/ files ~2000 tokens

Trigger phrases: "Washington", "washington county", "Chipley", "co_no 67"
