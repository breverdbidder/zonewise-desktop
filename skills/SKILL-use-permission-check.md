# ZoneWise Use Permission Check Skill

## Purpose
Determine if a specific use is permitted in a zoning district.

## When to Use
- User asks "Can I build/open [use type] at [location]?"
- User asks "Is [business type] allowed in [zone]?"
- User comparing zones for a specific use

## Data Source
- **Table:** `zonewise_districts` (permitted_uses, conditional_uses, prohibited_uses)
- **Table:** `zonewise_use_permissions` (detailed use matrix)

## Use Categories
- **P** = Permitted by right
- **C** = Conditional use (requires approval)
- **S** = Special exception
- **X** = Prohibited

## Response Format

```
## 🔍 Use Permission Check

**Use:** [REQUESTED USE]
**District:** [DISTRICT_CODE] - [DISTRICT_NAME]
**Jurisdiction:** [JURISDICTION]

### Result: [✅ PERMITTED / ⚠️ CONDITIONAL / 🚫 PROHIBITED]

### Details
[Explanation of finding]

### If Conditional:
**Approval Process:**
1. Submit application to Planning Department
2. Public hearing required: [Yes/No]
3. Typical timeline: [X] weeks
4. Fees: ~$[X]

**Common Conditions:**
- Hours of operation limits
- Parking requirements
- Buffering from residential
- Signage restrictions
```

## Search Logic

1. Normalize user's use description
2. Search permitted_uses array (case-insensitive, partial match)
3. Search conditional_uses array
4. Search prohibited_uses array
5. If not found, suggest similar uses

## Example

**User:** "Can I open a coffee shop in C-1 zone in Melbourne?"

**Response:**
```
## 🔍 Use Permission Check

**Use:** Coffee Shop / Cafe
**District:** C-1 - Neighborhood Commercial
**Jurisdiction:** Melbourne

### Result: ✅ PERMITTED

Coffee shops and cafes are permitted by right in C-1 zones
as "Restaurant, fast food" or "Retail sales."

### Requirements:
- Parking: 1 space per 100 sq ft
- Hours: No restrictions in C-1
- Signage: Max 32 sq ft

No special approval needed. Proceed with building permit.
```

## Fuzzy Matching

Map common terms to zoning language:
- "coffee shop" → restaurant, cafe, food service
- "daycare" → child care facility, day nursery
- "gym" → fitness center, health club, recreation
- "office" → professional office, business office
- "warehouse" → storage, distribution, wholesale
