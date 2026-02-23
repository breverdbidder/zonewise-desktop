---
name: county-brevard
description: >
  Zoning intelligence for Brevard County, FL (FDOR co_no: 5).
  17 jurisdictions, 273 zoning districts in Supabase.
  Avg data completeness: 85%. Portal type: municode.
  Use for parcel lookups, permitted use queries, dimensional standards,
  overlay districts. Triggers on: Brevard County, co_no 5,
  any address in Brevard County Florida.
supabase_county_filter: "county=ilike.%25Brevard%25"
co_no: 5
portal_type: municode
anti_scrape: false
rate_limit_rpm: 30
phase: P0_PILOT
last_validated: 2026-02-23
---

# Brevard County — Zoning Intelligence

> **co_no**: 5 | **Phase**: P0_PILOT | **Anti-scrape**: false | **Rate limit**: 30 rpm

## Supabase Queries

### 1. All jurisdictions in this county
```
GET /jurisdictions
  ?county=ilike.%25Brevard%25
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
  ?co_no=eq.5
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
    "Brevard County Florida zoning ordinance municode",
    "Brevard County Florida GIS zoning layer ArcGIS",
    "Brevard County Florida online zoning map portal",
    "site:municode.com Brevard county florida zoning",
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
**Trigger**: Mode 2 empty; JS rendering required; `anti_scrape: false`
```python
config = {
    "county": "Brevard", "co_no": 5,
    "anti_scrape": false, "rate_limit_rpm": 30,
    "agentql_api_key": "FCRgiir6uixy8nIHfCt7wNVaqcbb2kDAOp3rLxyHJnh5dkHhj8G2SQ",
}
# Modal container: zonewise-modal repo, nightly 11PM EST GitHub Action
# Circuit breaker: 3 failures → INSERT insights(type='ESCALATE', meta={county:'brevard'})
```

## County Profile

| Field | Value |
|-------|-------|
| FDOR co_no | 5 |
| Jurisdictions in DB | 17 |
| Zoning districts | 273 |
| Avg data completeness | 85% |
| Portal type | municode |
| Anti-scrape | false |
| Rate limit | 30 rpm |
| Test parcel | `2403867` |
| GIS endpoint | https://gis.brevardfl.gov/gissrv/rest/services/Planning_Development/Zoning_WKID2881/MapServer/0 |
| Phase | P0_PILOT |
| Last validated | 2026-02-23 |

## GIS Endpoints

- Primary: `https://gis.brevardfl.gov/gissrv/rest/services/Planning_Development/Zoning_WKID2881/MapServer/0`
- Fallback: FDOR fl_parcels table (co_no=5)

## Brevard-Specific Notes

Brevard is the **pilot county** — most complete data in Supabase.

### Known Jurisdictions (all 17 verified)
| Name | Municode URL | Districts |
|------|-------------|----------|
| Melbourne | library.municode.com/fl/melbourne | 24 |
| Palm Bay | library.municode.com/fl/palm_bay | 22 |
| Titusville | library.municode.com/fl/titusville | 18 |
| Cocoa | library.municode.com/fl/cocoa | 16 |
| Rockledge | library.municode.com/fl/rockledge | 14 |
| Satellite Beach | library.municode.com/fl/satellite_beach | 12 |
| Indian Harbour Beach | library.municode.com/fl/indian_harbour_beach | 10 |
| Unincorporated | gis.brevardfl.gov | 28 |
| Cape Canaveral | library.municode.com/fl/cape_canaveral | 12 |
| Cocoa Beach | library.municode.com/fl/cocoa_beach | 14 |
| West Melbourne | library.municode.com/fl/west_melbourne | 16 |
| Merritt Island (uninc) | — | 18 |
| Melbourne Beach | library.municode.com/fl/melbourne_beach | 8 |
| Indialantic | library.municode.com/fl/indialantic | 8 |
| Grant-Valkaria | — | 15 |
| Palm Shores | — | 6 |
| Mims (uninc) | — | 12 |

### GIS Endpoint (Verified Working)
`https://gis.brevardfl.gov/gissrv/rest/services/Planning_Development/Zoning_WKID2881/MapServer/0`
- Zone field: `ZONING`
- Spatial ref: WKID 2881
- Parcels: 75,350

### Quirks
- Unincorporated areas: use `ZONING` field from GIS, not Municode
- Palm Bay uses Table 173-8 for development bonuses (9 known bonuses in DB)
- Merritt Island and Mims are unincorporated — use county zoning code

## Escalation Conditions

- 3 consecutive failures → `insights` table `type='ESCALATE'` + auto Traycer issue
- `last_validated > 30 days` → Traycer: `[SKILL] Revalidate county-brevard`
- Portal URL 404 → Mode 1 re-run
- Completeness drops >10% → alert `daily_metrics`

---
*Auto-generated 2026-02-23 by `scripts/generate_county_skills.py`*
*Runtime data populated by nightly Modal scraper + Supabase upsert*
