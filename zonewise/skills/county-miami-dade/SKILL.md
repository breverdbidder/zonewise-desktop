---
name: county-miami-dade
description: >
  Zoning intelligence for Miami-Dade County, FL (FDOR co_no: 13).
  35 jurisdictions, 180 zoning districts in Supabase.
  Avg data completeness: 30%. Portal type: custom.
  Use for parcel lookups, permitted use queries, dimensional standards,
  overlay districts. Triggers on: Miami-Dade County, co_no 13,
  any address in Miami-Dade County Florida.
supabase_county_filter: "county=ilike.%25Miami-Dade%25"
co_no: 13
portal_type: custom
anti_scrape: true
rate_limit_rpm: 10
phase: P0_PILOT
last_validated: 2026-02-23
---

# Miami-Dade County — Zoning Intelligence

> **co_no**: 13 | **Phase**: P0_PILOT | **Anti-scrape**: true | **Rate limit**: 10 rpm

## Supabase Queries

### 1. All jurisdictions in this county
```
GET /jurisdictions
  ?county=ilike.%25Miami-Dade%25
  &select=id,name,data_completeness,municode_url,code_source
  &order=data_completeness.desc
```

### 2. Zoning districts for a jurisdiction
```
GET /zoning_districts
  ?jurisdiction_id=eq.{id}
  &select=id,code,name,category
  &order=category,code
  &limit=200
```

### 3. Parcel lookup (FDOR statewide table)
```
GET /fl_parcels
  ?co_no=eq.13
  &parcel_id=eq.{parcel_id}
  &select=parcel_id,phy_addr1,phy_city,dor_uc,jv,lnd_val,centroid_lat,centroid_lng
```

### 4. Dimensional standards
```
GET /zone_standards
  ?zoning_district_id=eq.{district_id}
  &select=front_setback_ft,side_setback_ft,rear_setback_ft,max_height_ft,max_far,max_lot_coverage_pct,min_lot_size_sf
```

### 5. Permitted uses
```
GET /permitted_uses
  ?zoning_district_id=eq.{district_id}
  &select=use_category_id,permission_type,notes
  &order=permission_type
```

### 6. Overlay districts
```
GET /overlay_districts
  ?jurisdiction_id=eq.{id}
  &select=name,type,description,restrictions
```

## 3-Mode Research Protocol (CrossBeam Pattern)

### Mode 1 — Discovery (WebSearch, ~30s)
**Trigger**: `portal_url` unknown, stale (>30 days), or returns 404
```python
queries = [
    "Miami-Dade County Florida zoning ordinance municode",
    "Miami-Dade County Florida GIS zoning layer ArcGIS",
    "Miami-Dade County Florida online zoning map portal",
    "site:municode.com Miami-Dade county florida zoning",
]
# Output → candidate URLs → validate → UPDATE jurisdictions.code_source
```

### Mode 2 — Extraction (WebFetch + Parser, ~60-90s)
**Trigger**: Mode 1 found valid URL; page renders without JS
```python
targets = ["zoning chapter", "district table", "dimensional standards table"]
extract = ["district codes", "permitted uses", "setbacks", "height limits", "FAR", "lot coverage"]
output = "INSERT/UPSERT zoning_districts + zone_standards + permitted_uses"
```

### Mode 3 — AgentQL Fallback (Modal Container)
**Trigger**: Mode 2 empty; JS rendering required; `anti_scrape: true`
```python
config = {
    "county": "Miami-Dade", "co_no": 13,
    "anti_scrape": true, "rate_limit_rpm": 10,
    "agentql_api_key": "FCRgiir6uixy8nIHfCt7wNVaqcbb2kDAOp3rLxyHJnh5dkHhj8G2SQ",
}
# Modal container: zonewise-modal repo, nightly 11PM EST GitHub Action
# Circuit breaker: 3 failures → INSERT insights(type='ESCALATE', meta={county:'miami-dade'})
```

## County Profile

| Field | Value |
|-------|-------|
| FDOR co_no | 13 |
| Jurisdictions in DB | 35 |
| Zoning districts | 180 |
| Avg data completeness | 30% |
| Portal type | custom |
| Anti-scrape | true |
| Rate limit | 10 rpm |
| Test parcel | `0101010010010` |
| GIS endpoint | https://gis.miamidade.gov/arcgis/rest/services/MDC_Zoning/MapServer/0 |
| Phase | P0_PILOT |
| Last validated | 2026-02-23 |

## GIS Endpoints

- Primary: `https://gis.miamidade.gov/arcgis/rest/services/MDC_Zoning/MapServer/0`
- Fallback: FDOR fl_parcels table (co_no=13)

## Miami-Dade Specific Notes

### Portal
Miami-Dade uses a **custom portal**, NOT Municode:
- Zoning portal: https://www.miamidade.gov/zoning/
- GIS: https://gis.miamidade.gov/arcgis/
- Online zoning query: https://gis.miamidade.gov/arcgis/apps/Viewer/index.html

### Anti-Scrape
Miami-Dade portal has rate limiting. Use Mode 3 (AgentQL) for any JS-heavy pages.
Rate limit: 10 rpm. Add 6s delay between requests.

### Zoning Code System
Uses **EU** (European-style) codes: T3-L, T4-R, T5-O, T6-80 (Transect zones)
Plus legacy codes: RU-1, BU-1, IU-1, AU, GU

### Municipalities
35 municipalities including: Miami, Miami Beach, Coral Gables, Hialeah,
Homestead, Miami Gardens, Doral, Aventura, North Miami, Opa-locka, etc.
Each has its own zoning code — query by jurisdiction_id.

## Escalation Conditions

- 3 consecutive failures → `insights` table `type='ESCALATE'` + auto Traycer issue
- `last_validated > 30 days` → Traycer: `[SKILL] Revalidate county-miami-dade`
- Portal URL 404 → Mode 1 re-run
- Completeness drops >10% → alert `daily_metrics`

---
*Auto-generated 2026-02-23 by `scripts/generate_county_skills.py`*
*Runtime data populated by nightly Modal scraper + Supabase upsert*
