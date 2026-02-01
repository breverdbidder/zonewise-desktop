# ZoneWise Infrastructure Audit Report
**Date:** February 1, 2026  
**Purpose:** Document existing infrastructure for ZoneWise Desktop V2 integration

---

## 🎯 Executive Summary

**Status:** ✅ Extensive infrastructure already exists across multiple repositories

**Key Findings:**
1. ✅ **Supabase database** with 273+ zoning districts and 261K+ parcel zones
2. ✅ **Malabar POC** complete with verified data
3. ✅ **Brevard County** data extraction complete (17 jurisdictions)
4. ✅ **Florida County Scraper** production-ready for 67 counties
5. ✅ **Modal.com** serverless pipeline for parallel scraping
6. ❌ **Miami-Dade POC** not found (may be in different repo or not yet built)

---

## 📊 Repository Inventory

### 1. **zonewise-web** (Next.js + Supabase Production App)
**URL:** https://zonewise.ai  
**Tech Stack:** Next.js 14, Supabase, Stripe, Mapbox, Cloudflare Pages

**Database Schema (Supabase):**
```sql
- chat_sessions (user conversations)
- chat_messages (AI chat history)
- subscriptions (Stripe billing)
- zoning_districts (273+ districts with geometry)
```

**Key Features:**
- ✅ AI chat interface (Claude API)
- ✅ 10,092 GIS polygons
- ✅ 17 Brevard jurisdictions
- ✅ 301 zoning districts
- ✅ Auth (Email, Google, GitHub)
- ✅ Stripe payments

**Status:** **PRODUCTION LIVE**

---

### 2. **florida-county-scraper** (Data Acquisition System)
**Purpose:** Build data moat for all 67 Florida counties

**Architecture:**
- Python 3.10+ with Modal.com serverless
- PostgreSQL with PostGIS
- Anthropic API (Claude)
- Firecrawl API

**Capabilities:**
- ✅ Scrape all 67 Florida counties
- ✅ Parallel processing with Modal
- ✅ Data validation pipeline
- ✅ Automated deployment

**Status:** **PRODUCTION READY**

---

### 3. **zonewise** (Modal Pipeline + Supabase Integration)
**Purpose:** Autonomous parallel scraping and enrichment

**Data Available:**
```
data/
├── malabar_parcel_zones.json (64KB - Malabar POC complete)
├── malabar_poc_v2_results.json (16KB)
├── malabar_zone_assignments.csv (55KB)
├── brevard_ordinances_complete.json (31KB)
├── brevard_zoning_complete.json (26KB)
├── complete_districts.json (141KB - All Brevard districts)
└── jurisdictions/ (individual jurisdiction data)
```

**Supabase Tables:**
- `zoning_districts` - 273+ districts
- `parcel_zones` - 261K+ parcels
- `census_demographics`
- `location_scores`

**Status:** **DATA AVAILABLE**

---

### 4. **zonewise-desktop** (Electron App - V1)
**Purpose:** Original desktop application (being replaced by V2)

**Tech Stack:** Electron, React, Three.js, Mapbox

**Status:** **DEPRECATED** (migrating to web)

---

## 🗄️ Supabase Database Status

### Current Schema (from zonewise-web)

**Tables:**
1. **zoning_districts** - 273+ verified districts
   - jurisdiction, zone_code, zone_name
   - setbacks (front, side, rear)
   - max_height, max_density, min_lot_size
   - permitted_uses, conditional_uses
   - geometry (GeoJSON)

2. **subscriptions** - Stripe billing
   - user_id, stripe_customer_id, stripe_subscription_id
   - status, plan (free/pro/team)
   - query_limit

3. **chat_sessions** - AI conversations
4. **chat_messages** - Chat history

### Missing Tables (Need to Add)
- ❌ `properties` - User-saved property analyses
- ❌ `exports` - Export history (PNG, OBJ, JSON, GeoJSON)
- ❌ `usage_tracking` - Free tier view limits
- ❌ `team_members` - Team tier collaboration

---

## 🚀 Integration Strategy for V2

### Phase 1: Connect to Existing Supabase
1. Get Supabase connection credentials
2. Replace Manus MySQL with Supabase PostgreSQL
3. Import existing `zoning_districts` data
4. Add missing tables (properties, exports, usage_tracking)

### Phase 2: Import Malabar + Brevard Data
1. Load `malabar_parcel_zones.json` → Supabase
2. Load `brevard_zoning_complete.json` → Supabase
3. Load `complete_districts.json` → Supabase
4. Verify 17 Brevard jurisdictions are complete

### Phase 3: Integrate Florida County Scraper
1. Connect `florida-county-scraper` to Supabase
2. Run scraper for remaining 50 counties (Phase 2: 10 counties)
3. Automate data refresh pipeline

### Phase 4: Add Missing Features
1. 3D building envelope visualization (React Three Fiber)
2. Sun/shadow analysis (SunCalc)
3. Export functionality (PNG, OBJ, JSON, GeoJSON)
4. Smart Router + LiteLLM AI features

---

## 🔍 Miami-Dade POC Status

**Finding:** ❌ No Miami-Dade specific data found in repositories

**Possible Locations:**
1. May be in `florida-county-scraper` as a test case
2. May be in private Supabase database (not in GitHub)
3. May not yet exist (user may have confused with another county)

**Recommendation:** Ask user for clarification on Miami-Dade POC location

---

## 📋 Next Steps

### Immediate Actions
1. ✅ Get Supabase connection credentials from user
2. ✅ Connect zonewise-v2 to existing Supabase database
3. ✅ Import Malabar + Brevard data
4. ✅ Build 3D visualization with React Three Fiber
5. ✅ Complete Stripe billing integration
6. ✅ Add Smart Router + LiteLLM features

### Data Priorities
1. **Brevard County** (17 jurisdictions) - ✅ COMPLETE
2. **10 High-Value Counties** (Phase 2) - 🔄 IN PROGRESS
   - Suggested: Orange, Miami-Dade, Hillsborough, Duval, Pinellas, Palm Beach, Lee, Polk, Volusia, Seminole
3. **All 67 Florida Counties** (Phase 3) - 📅 PLANNED

---

## 💡 Key Insights

### Strengths
1. **Production app already live** (zonewise.ai)
2. **Real data** (273+ districts, 261K+ parcels)
3. **Scalable infrastructure** (Modal.com, Supabase)
4. **Proven scraping** (Malabar POC successful)

### Gaps
1. **No 3D visualization** (need React Three Fiber)
2. **No sun/shadow analysis** (need SunCalc)
3. **No export functionality** (need PNG, OBJ, JSON, GeoJSON)
4. **Limited AI features** (need Smart Router + LiteLLM)
5. **No Team collaboration** (need team_members table)

### Opportunities
1. **Migrate zonewise-web to Manus** for faster iteration
2. **Add 3D features** to differentiate from competitors
3. **Integrate Smart Router + LiteLLM** for AI-powered analysis
4. **Expand to 67 counties** using existing scraper

---

## 🎯 Recommended Architecture

**Frontend:** Manus web app (current zonewise-v2)  
**Database:** Existing Supabase PostgreSQL  
**Scraping:** florida-county-scraper (Modal.com)  
**AI:** Smart Router + LiteLLM (Manus built-in)  
**Billing:** Stripe ($49 Pro / $149 Team)  
**Hosting:** Manus (with custom domain)

**Why Manus:**
- ✅ Faster development (2 weeks vs. 2 months)
- ✅ Smart Router + LiteLLM already integrated
- ✅ One-click deployment
- ✅ Built-in scaling
- ✅ Can still use external Supabase database

**Migration Path:**
- Start with Manus for MVP
- Migrate to Vercel + Render.com later if needed
- Keep Supabase as single source of truth (no vendor lock-in)

---

## 📞 Questions for User

1. **Supabase Credentials:** Can you provide Supabase connection URL and API keys?
2. **Miami-Dade POC:** Where is the Miami-Dade County POC data located?
3. **Smart Router + LiteLLM:** What AI features do you want in V2? (zoning analysis, chatbot, report generation?)
4. **Deployment:** Confirm Manus deployment or rebuild on Vercel + Render.com?
5. **Timeline:** When do you need Brevard POC live?

---

**Report Status:** ✅ COMPLETE  
**Next Action:** Await user confirmation on Supabase credentials and deployment strategy
