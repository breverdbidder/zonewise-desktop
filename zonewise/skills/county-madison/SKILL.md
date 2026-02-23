---
name: county-madison
description: >
  Zoning intelligence for Madison County, FL (FDOR co_no: 40).
  TBD — run generator after first scrape jurisdictions, TBD zoning districts in Supabase.
  Avg data completeness: 0%. Portal type: unknown.
  Use for parcel lookups, permitted use queries, dimensional standards,
  overlay districts. Triggers on: Madison County, co_no 40,
  any address in Madison County Florida.
supabase_county_filter: "county=ilike.%25Madison%25"
co_no: 40
portal_type: unknown
anti_scrape: false
rate_limit_rpm: 30
phase: P3
last_validated: 2026-02-23
---

# Madison County — Zoning Intelligence

> **co_no**: 40 | **Phase**: P3 | **Anti-scrape**: false | **Rate limit**: 30 rpm

## Supabase Queries

### 1. All jurisdictions in this county
```
GET /jurisdictions
  ?county=ilike.%25Madison%25
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
  ?co_no=eq.40
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
    "Madison County Florida zoning ordinance municode",
    "Madison County Florida GIS zoning layer ArcGIS",
    "Madison County Florida online zoning map portal",
    "site:municode.com Madison county florida zoning",
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
    "county": "Madison", "co_no": 40,
    "anti_scrape": false, "rate_limit_rpm": 30,
    "agentql_api_key": "FCRgiir6uixy8nIHfCt7wNVaqcbb2kDAOp3rLxyHJnh5dkHhj8G2SQ",
}
# Modal container: zonewise-modal repo, nightly 11PM EST GitHub Action
# Circuit breaker: 3 failures → INSERT insights(type='ESCALATE', meta={county:'madison'})
```

## County Profile

| Field | Value |
|-------|-------|
| FDOR co_no | 40 |
| Jurisdictions in DB | TBD — run generator after first scrape |
| Zoning districts | TBD |
| Avg data completeness | 0% |
| Portal type | unknown |
| Anti-scrape | false |
| Rate limit | 30 rpm |
| Test parcel | `TBD` |
| GIS endpoint | Not yet validated |
| Phase | P3 |
| Last validated | 2026-02-23 |

## GIS Endpoints

- Primary: `Not yet validated`
- Fallback: FDOR fl_parcels table (co_no=40)

## Escalation Conditions

- 3 consecutive failures → `insights` table `type='ESCALATE'` + auto Traycer issue
- `last_validated > 30 days` → Traycer: `[SKILL] Revalidate county-madison`
- Portal URL 404 → Mode 1 re-run
- Completeness drops >10% → alert `daily_metrics`

---
*Auto-generated 2026-02-23 by `scripts/generate_county_skills.py`*
*Runtime data populated by nightly Modal scraper + Supabase upsert*
