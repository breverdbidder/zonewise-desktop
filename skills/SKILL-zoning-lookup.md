# ZoneWise Zoning Lookup Skill

## Purpose
Look up zoning district information for any address, parcel, or location in Florida.

## When to Use
- User asks "What is the zoning for [address]?"
- User asks "Can I build [use type] at [location]?"
- User asks about a specific parcel ID
- User wants to know zoning regulations for a property

## Data Source
- **Table:** `zonewise_districts`
- **Database:** Supabase

## Process

### Step 1: Identify Location
If user provides:
- **Address** → Geocode to get jurisdiction
- **Parcel ID** → Extract jurisdiction from ID format
- **Jurisdiction + District Code** → Query directly

### Step 2: Query Database
```sql
SELECT 
  id, jurisdiction, district_code, district_name,
  description, category, min_lot_size, max_height,
  max_density, front_setback, side_setback, rear_setback,
  permitted_uses, conditional_uses, prohibited_uses
FROM zonewise_districts 
WHERE jurisdiction ILIKE $1 AND district_code ILIKE $2;
```

### Step 3: Format Response

## Response Template

```
## 🏗️ Zoning Information

**District:** [DISTRICT_CODE] - [DISTRICT_NAME]
**Jurisdiction:** [JURISDICTION]
**Category:** [Residential/Commercial/Industrial/Mixed-Use]

### 📐 Dimensional Standards

| Requirement | Value |
|-------------|-------|
| Min Lot Size | [X] sq ft |
| Max Height | [X] ft |
| Max Density | [X] units/acre |

### 📏 Setbacks

| Side | Minimum |
|------|---------|
| Front | [X] ft |
| Side | [X] ft |
| Rear | [X] ft |

### ✅ Permitted Uses
[List of permitted uses]

### ⚠️ Conditional Uses (Requires Approval)
[List of conditional uses]

---
*Data source: [JURISDICTION] Municipal Code*
```

## Example Queries

### Query 1: By Address
**User:** "What's the zoning for 123 Main St, Melbourne FL?"

**Process:**
1. Geocode address → Melbourne jurisdiction
2. Query parcels by coordinates → Get district code
3. Query zonewise_districts
4. Return formatted response

### Query 2: By District
**User:** "Tell me about R-1 zoning in Satellite Beach"

**Process:**
1. Query: `WHERE jurisdiction = 'Satellite Beach' AND district_code = 'R-1'`
2. Return formatted response

## Error Handling

### District Not Found
```
I couldn't find that zoning district. 

**Try:**
- "List all districts in [jurisdiction]"
- "What residential zones exist in [jurisdiction]?"
```

## Related Skills
- `SKILL-setback-calculator.md`
- `SKILL-use-permission-check.md`
- `SKILL-municode-scraper.md`
