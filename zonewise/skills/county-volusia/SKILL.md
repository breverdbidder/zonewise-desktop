---
name: county-volusia
description: >
  Zoning intelligence for Volusia County, FL.
  16 jurisdictions, FDOR co_no 64.
  Portal: arcgis. Anti-scrape: false.
  Triggers: Volusia, volusia county, DeLand, co_no 64.
co_no: 64
county_slug: volusia
portal_type: arcgis
anti_scrape: false
rate_limit_rpm: 60
phase: P3
last_validated: 2026-02-23
---

# Volusia County — Zoning Intelligence

**Seat**: DeLand | **Pop**: 564,942 | **Municipalities**: 16
**FDOR co_no**: 64 | **Portal**: ARCGIS | **Phase**: P3

---

## Supabase Queries

Host: `mocerqjnksmhcjzxrewo.supabase.co` — use `apikey` + `Authorization: Bearer` headers.

### Jurisdictions in this county
```
GET /jurisdictions?county=ilike.%25Volusia%25&select=id,name,data_completeness,municode_url&order=name.asc
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
GET /fl_parcels?co_no=eq.64&phy_addr1=ilike.%25{street}%25&select=parcel_id,phy_addr1,phy_city,phy_zipcd,dor_uc,centroid_lat,centroid_lng&limit=5
```

### Parcel lookup by parcel ID
```
GET /fl_parcels?co_no=eq.64&parcel_id=eq.{parcel_id}&select=*
```

---

## 3-Mode Research Protocol (CrossBeam Pattern)

### Mode 1 — Discovery (WebSearch ≤30s)
**Trigger**: portal unknown OR last_validated > 30 days
Queries:
1. `"Volusia County Florida zoning map"`
2. `"Volusia County Florida municode zoning ordinance"`
3. `"Volusia County GIS ArcGIS zoning Florida"`
**Output** → UPDATE `jurisdictions.skill_last_validated`

### Mode 2 — Extraction (WebFetch ≤90s)
**Target**: https://library.municode.com/fl/volusia_county
**Extract**: district codes, permitted uses, setbacks, height limits, FAR
**Output** → UPSERT `zoning_districts`, `zone_standards`, `permitted_uses`

### Mode 3 — AgentQL/Modal (fallback)
**Trigger**: Mode 2 empty OR anti_scrape=false
**Rate limit**: 60 rpm | **Anti-detect**: DISABLED
**Container**: `modal-county-volusia`

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
All 3 modes fail → INSERT `insights` table with `type='ESCALATE'`, `county='volusia'` → Traycer auto-issue.

---

## County Profile

| Field | Value |
|-------|-------|
| FDOR co_no | 64 |
| Seat | DeLand |
| Population | 564,942 |
| Municipalities | 16 |
| Portal | ARCGIS |
| Municode | [volusia_county](https://library.municode.com/fl/volusia_county) |
| Anti-scrape | No |
| Rate limit | 60 rpm |
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

Trigger phrases: "Volusia", "volusia county", "DeLand", "co_no 64"
