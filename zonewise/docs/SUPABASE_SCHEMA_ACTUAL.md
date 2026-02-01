# Actual Supabase Schema (Verified Feb 1, 2026)

**Project:** mocerqjnksmhcjzxrewo  
**Database:** PostgreSQL with PostGIS

---

## ✅ Verified Data Inventory

### Jurisdictions Table
- **Count:** 17 Brevard County jurisdictions
- **Completeness:** 75-95% data coverage

**Sample Jurisdictions:**
1. Titusville (ID: 1)
2. Cocoa (ID: 2)
3. Rockledge (ID: 3)
4. Cocoa Beach (ID: 4)
5. Cape Canaveral (ID: 5)
6. Melbourne (ID: 6)
7. Palm Bay (ID: 7)
8. West Melbourne (ID: 8)
9. Satellite Beach (ID: 9)
10. Indian Harbour Beach (ID: 10)
11. Indialantic (ID: 11)
12. Melbourne Beach (ID: 12)
13. Unincorporated Brevard County (ID: 13)
14. **Malabar** (ID: 14) - POC ✅
15. Grant-Valkaria (ID: 15)
16. Palm Shores (ID: 16)
17. Melbourne Village (ID: 17)

### Zoning Districts Table
- **Count:** 301 districts
- **Structure:** Normalized with `jurisdiction_id` foreign key

**Schema:**
```sql
CREATE TABLE zoning_districts (
  id INTEGER PRIMARY KEY,
  jurisdiction_id INTEGER REFERENCES jurisdictions(id),
  code TEXT,
  name TEXT,
  category TEXT,
  description TEXT, -- Contains embedded JSON in HTML comments
  ordinance_section TEXT,
  effective_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

**Sample Record:**
```json
{
  "id": 1542,
  "jurisdiction_id": 13,
  "code": "SR",
  "name": "Suburban Residential",
  "category": "Residential",
  "description": "Suburban residential. <!--DIMS:{\"min_lot_sqft\":10000,\"min_lot_width_ft\":85,\"max_height_ft\":35,\"setbacks_ft\":{\"front\":25,\"side\":10,\"rear\":20},\"density_du_acre\":4,\"source\":\"Brevard County LDC\",\"verified_date\":\"2026-01-19\",\"source_url\":\"https://library.municode.com/fl/brevard_county/codes/code_of_ordinances?nodeId=COOR_CH62ZO\"}-->",
  "created_at": "2026-01-18T19:05:39.141906+00:00"
}
```

**Key Insight:** Dimensional standards (setbacks, height, density) are embedded as JSON in HTML comments within the `description` field. This is a clever way to store structured data while maintaining human-readable text.

---

## 📊 Schema Differences from zonewise-web

### zonewise-web (Old Schema)
```sql
CREATE TABLE zoning_districts (
  id UUID,
  jurisdiction TEXT,  -- ❌ Text field
  zone_code TEXT,
  zone_name TEXT,
  front_setback NUMERIC,  -- ❌ Separate columns
  side_setback NUMERIC,
  rear_setback NUMERIC,
  max_height NUMERIC,
  ...
);
```

### Actual Supabase (Current Schema)
```sql
CREATE TABLE zoning_districts (
  id INTEGER,
  jurisdiction_id INTEGER,  -- ✅ Foreign key
  code TEXT,
  name TEXT,
  description TEXT,  -- ✅ Embedded JSON in HTML comments
  ...
);

CREATE TABLE jurisdictions (
  id INTEGER,
  name TEXT,
  county TEXT,
  state TEXT,
  population INTEGER,
  data_completeness INTEGER,
  data_source TEXT,
  last_updated TIMESTAMPTZ,
  active BOOLEAN
);
```

---

## 🔍 Data Extraction Pattern

To get dimensional standards from a zoning district:

```javascript
const district = await supabase
  .from("zoning_districts")
  .select("*, jurisdictions(*)")
  .eq("id", 1542)
  .single();

// Extract embedded JSON from description
const match = district.description.match(/<!--DIMS:(.*?)-->/);
if (match) {
  const dims = JSON.parse(match[1]);
  console.log("Setbacks:", dims.setbacks_ft);
  console.log("Max Height:", dims.max_height_ft);
  console.log("Source URL:", dims.source_url);
}
```

---

## 📋 Additional Tables (Need to Verify)

Based on zonewise-web schema, these tables likely exist:

1. **chat_sessions** - User conversation history
2. **chat_messages** - AI chat messages
3. **subscriptions** - Stripe billing (likely needs migration to match our schema)

Need to query these to confirm structure.

---

## ✅ Next Steps

1. Update ZoneWise V2 Supabase client to match actual schema
2. Create helper functions to extract embedded JSON from descriptions
3. Add missing tables (properties, exports, usage_tracking, team_members)
4. Build data import pipeline for remaining jurisdictions

---

**Status:** Schema documented and verified ✅
