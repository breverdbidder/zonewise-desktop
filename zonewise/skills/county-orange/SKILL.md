---
name: county-orange
description: >
  Zoning intelligence for Orange County, FL (FDOR co_no: 48).
  14 jurisdictions, 95 zoning districts in Supabase.
  Avg data completeness: 25%. Portal type: municode.
  Use for parcel lookups, permitted use queries, dimensional standards,
  overlay districts. Triggers on: Orange County, co_no 48,
  any address in Orange County Florida.
supabase_county_filter: "county=ilike.%25Orange%25"
co_no: 48
portal_type: municode
anti_scrape: true
rate_limit_rpm: 10
phase: P0_PILOT
last_validated: 2026-02-23
---

# Orange County — Zoning Intelligence

> **co_no**: 48 | **Phase**: P0_PILOT | **Anti-scrape**: true | **Rate limit**: 10 rpm

## Supabase Queries

### 1. All jurisdictions in this county
```
GET /jurisdictions
  ?county=ilike.%25Orange%25
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
  ?co_no=eq.48
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
    "Orange County Florida zoning ordinance municode",
    "Orange County Florida GIS zoning layer ArcGIS",
    "Orange County Florida online zoning map portal",
    "site:municode.com Orange county florida zoning",
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
    "county": "Orange", "co_no": 48,
    "anti_scrape": true, "rate_limit_rpm": 10,
    "agentql_api_key": "FCRgiir6uixy8nIHfCt7wNVaqcbb2kDAOp3rLxyHJnh5dkHhj8G2SQ",
}
# Modal container: zonewise-modal repo, nightly 11PM EST GitHub Action
# Circuit breaker: 3 failures → INSERT insights(type='ESCALATE', meta={county:'orange'})
```

## County Profile

| Field | Value |
|-------|-------|
| FDOR co_no | 48 |
| Jurisdictions in DB | 14 |
| Zoning districts | 95 |
| Avg data completeness | 25% |
| Portal type | municode |
| Anti-scrape | true |
| Rate limit | 10 rpm |
| Test parcel | `012328000000001` |
| GIS endpoint | https://maps.orangecountyfl.net/arcgis/rest/services/Zoning/MapServer/0 |
| Phase | P0_PILOT |
| Last validated | 2026-02-23 |

## GIS Endpoints

- Primary: `https://maps.orangecountyfl.net/arcgis/rest/services/Zoning/MapServer/0`
- Fallback: FDOR fl_parcels table (co_no=48)

## Orange County Specific Notes

### Portal
- Municode: https://library.municode.com/fl/orange_county
- GIS: https://maps.orangecountyfl.net
- Online zoning: https://ocfl.net/GrowthMgmt/PlanningDivision/zoning.aspx

### Key Municipalities
Orlando (city, own code), Winter Park, Apopka, Ocoee, Winter Garden,
Windermere, Maitland, Eatonville, Bay Lake (Disney), Lake Buena Vista

### Disney / Special Districts
Bay Lake and Lake Buena Vista are technically municipalities covering Disney World.
Zoning: Reedy Creek Improvement District rules apply. Skip for standard analysis.

### Zoning Code Structure
County: A-1, A-2, R-1A through R-3, C-1 through C-3, I-1, I-2, P-D (Planned Dev)
Orlando city uses T1-T6 transect system + legacy codes

## Escalation Conditions

- 3 consecutive failures → `insights` table `type='ESCALATE'` + auto Traycer issue
- `last_validated > 30 days` → Traycer: `[SKILL] Revalidate county-orange`
- Portal URL 404 → Mode 1 re-run
- Completeness drops >10% → alert `daily_metrics`

---
*Auto-generated 2026-02-23 by `scripts/generate_county_skills.py`*
*Runtime data populated by nightly Modal scraper + Supabase upsert*
