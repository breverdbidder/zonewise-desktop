# ZoneWise Map Skill

## Purpose
Display zoning districts on an interactive Mapbox map for Brevard County, Florida.

## When to Use
- User asks to "show on map" or "visualize"
- User asks "where is [jurisdiction]?"
- User wants to see zoning districts geographically
- User asks about location of a property

## Prerequisites
- Mapbox Access Token (free at mapbox.com)
- Supabase connection for district data

## Jurisdiction Coordinates

| ID | Jurisdiction | Latitude | Longitude |
|----|--------------|----------|-----------|
| 1 | Melbourne | 28.0836 | -80.6081 |
| 2 | Palm Bay | 27.9606 | -80.5887 |
| 3 | Indian Harbour Beach | 28.1472 | -80.5887 |
| 4 | Titusville | 28.6122 | -80.8076 |
| 5 | Cocoa | 28.3861 | -80.7420 |
| 6 | Satellite Beach | 28.1761 | -80.5901 |
| 7 | Cocoa Beach | 28.3200 | -80.6078 |
| 8 | Rockledge | 28.3169 | -80.7248 |
| 9 | West Melbourne | 28.0722 | -80.6519 |
| 10 | Cape Canaveral | 28.4058 | -80.6056 |
| 11 | Indialantic | 28.0897 | -80.5656 |
| 12 | Melbourne Beach | 28.0681 | -80.5617 |
| 13 | Unincorporated Brevard | 28.3000 | -80.7000 |
| 14 | Malabar | 28.0000 | -80.5667 |
| 15 | Grant-Valkaria | 27.9400 | -80.5500 |
| 16 | Palm Shores | 28.1167 | -80.5833 |
| 17 | Melbourne Village | 28.0800 | -80.6700 |

## Zoning Category Colors

| Category | Color | Hex |
|----------|-------|-----|
| Residential | Green | #10B981 |
| Commercial | Teal | #0D9488 |
| Industrial | Indigo | #6366F1 |
| Mixed-Use | Purple | #8B5CF6 |
| Agricultural | Lime | #84CC16 |
| Conservation | Emerald | #22C55E |
| Planned Development | Amber | #F59E0B |

## Response Format

When user asks for map visualization, respond with:

```
## 🗺️ ZoneWise Map View

**Location:** [JURISDICTION], Brevard County, FL
**Coordinates:** [LAT], [LNG]
**Zoom Level:** [ZOOM]

### Districts in View
[List districts with color-coded categories]

### Map Actions
- Pan/zoom to explore
- Click markers for district details
- Select jurisdiction from dropdown
```

## Map Embed Code

For artifacts, use this React component:

```jsx
<iframe
  src="https://api.mapbox.com/styles/v1/mapbox/light-v11.html?access_token=YOUR_TOKEN#12/28.0836/-80.6081"
  width="100%"
  height="400"
  style={{ border: 'none', borderRadius: '8px' }}
/>
```

## Example Queries

**User:** "Show Melbourne zoning on map"
**Action:** Center map on Melbourne (28.0836, -80.6081), zoom 12, list 26 districts

**User:** "Where is Satellite Beach?"
**Action:** Fly to Satellite Beach (28.1761, -80.5901), show 8 districts

**User:** "Map all commercial zones in Palm Bay"
**Action:** Center on Palm Bay, highlight Commercial category (teal)

## Integration Notes

1. Mapbox GL JS loaded via CDN
2. Districts fetched from Supabase zoning_districts table
3. Color-coding by category field
4. Jurisdiction centers pre-defined for quick navigation
