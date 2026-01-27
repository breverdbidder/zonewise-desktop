# ZoneWise Setback Calculator Skill

## Purpose
Calculate required setbacks for a specific zoning district.

## When to Use
- User asks about setbacks
- User asks "How close can I build to property line?"
- User planning construction
- User asks about building envelope

## Data Source
- **Table:** `zonewise_districts` (columns: front_setback, side_setback, rear_setback)
- **Table:** `zonewise_dimensional_standards` (detailed setbacks)

## Response Format

```
## 📏 Setback Requirements for [DISTRICT] in [JURISDICTION]

| Side | Minimum | Notes |
|------|---------|-------|
| Front | [X] ft | From right-of-way |
| Side (Interior) | [X] ft | |
| Side (Street) | [X] ft | Corner lots |
| Rear | [X] ft | |

### Special Conditions
- **Corner Lots:** Side street setback = front setback
- **Through Lots:** Both ends treated as front
- **Flag Lots:** [specific rules]

### Accessory Structures
- Detached garage: [X] ft from property line
- Pool: [X] ft from property line
- Fence: [X] ft max height in setback

### Variance Process
If setbacks cannot be met, contact [JURISDICTION] Planning Department
for variance application process.
```

## Calculation Logic

### Standard Setbacks
Query zonewise_districts for base setbacks.

### Lot-Specific Adjustments
- **Substandard lots:** May have reduced setbacks
- **PUD/Overlay zones:** Check overlay requirements
- **Historic districts:** May have additional rules

## Example

**User:** "What are the setbacks for R-1 in Satellite Beach?"

**Response:**
```
## 📏 Setback Requirements for R-1 in Satellite Beach

| Side | Minimum |
|------|---------|
| Front | 25 ft |
| Side | 7.5 ft |
| Rear | 20 ft |

**Total buildable area** on a 75x100 lot:
- Width: 75 - 7.5 - 7.5 = 60 ft
- Depth: 100 - 25 - 20 = 55 ft
- **Buildable:** 3,300 sq ft
```
