---
name: sun-analysis
version: 1.0.0
category: analysis
priority: 1
author: ZoneWise.AI
created: 2026-02-01
updated: 2026-02-01

description: |
  Calculate sun position using SunCalc. Generate sun paths, shadow projections,
  and solar exposure heatmaps. Animate shadows throughout the day.

dependencies:
  - suncalc: ^1.9.0
  - three: ^0.160.0
  - @react-three/fiber: ^8.15.0

references:
  - suncalc-api.md
  - shadow-algorithm.md

tools_exposed:
  - calculateSunPosition
  - getSunTimes
  - generateSunPath
  - analyzeSunHours
  - createSunHoursHeatmap

keywords:
  - sun position
  - shadow analysis
  - solar exposure
  - heatmap
  - suncalc
  - sunrise sunset
---

# Sun Analysis Skill

## Overview

This skill enables accurate sun position calculations, shadow projection, and solar
exposure analysis for building envelope visualization. It integrates the SunCalc library
with Three.js to create dynamic sun/shadow visualizations.

## When to Use This Skill

Load this skill when the user asks about:
- Sun position at a specific time/date
- Shadow analysis for a building or lot
- Solar exposure or sun hours
- Sunrise/sunset times
- Sun path visualization
- Shadow animation

## Core Functions

### 1. Calculate Sun Position

```typescript
import { calculateSunPosition } from '@/lib/sun-analysis';

// Get sun position for a specific time and location
const position = calculateSunPosition(
  new Date('2026-06-21T12:00:00'),
  28.004,    // latitude (Malabar, FL)
  -80.5687   // longitude
);

// Returns:
// {
//   azimuth: 3.14,           // radians from north
//   altitude: 1.23,          // radians above horizon
//   azimuthDegrees: 180,     // degrees (0=N, 90=E, 180=S, 270=W)
//   altitudeDegrees: 70.5,   // degrees above horizon
//   isDay: true,             // sun above horizon
//   time: Date
// }
```

### 2. Get Sun Times

```typescript
import { getSunTimes, getDaylightHours } from '@/lib/sun-analysis';

const times = getSunTimes(new Date(), 28.004, -80.5687);
// Returns: { sunrise, sunset, solarNoon, dawn, dusk, ... }

const hours = getDaylightHours(new Date(), 28.004, -80.5687);
// Returns: 13.5 (hours of daylight)
```

### 3. Generate Sun Path

```typescript
import { generateSunPath } from '@/lib/sun-analysis';

const path = generateSunPath({
  latitude: 28.004,
  longitude: -80.5687,
  date: new Date('2026-06-21'),  // Summer solstice
  intervalMinutes: 30,           // Point every 30 min
  sunDistance: 80                // Distance for 3D visualization
});

// Returns array of: { time, position, vector: THREE.Vector3 }
```

### 4. Analyze Sun Hours

```typescript
import { analyzeSunHours, generateAnalysisGrid } from '@/lib/sun-analysis';

// Create analysis grid
const grid = generateAnalysisGrid(
  [-30, -30, 30, 30],  // bounds [minX, minZ, maxX, maxZ]
  0.1,                  // height
  2                     // resolution (meters)
);

// Analyze with building meshes
const results = analyzeSunHours(grid, config, buildingMeshes);
// Returns: [{ point, sunHours, sunPercentage, shadowPeriods }]
```

### 5. Create Heatmap

```typescript
import { createSunHoursHeatmap, getSunHoursColor } from '@/lib/sun-analysis';

// Get color for specific sun hours
const color = getSunHoursColor(8.5, 12);  // 8.5 hours out of 12

// Create Three.js Points mesh for heatmap
const heatmapMesh = createSunHoursHeatmap(analysisResults, 2, 12);
scene.add(heatmapMesh);
```

## React Components

### SunShadowViewer

Interactive 3D viewer with sun position and shadows.

```tsx
<SunShadowViewer
  lotPolygon={polygon}
  dims={zoningDims}
  initialDate={new Date('2026-06-21')}
  location={[-80.5687, 28.004]}
  showSunPath={true}
  showShadows={true}
/>
```

Features:
- Date picker for any day of year
- Time slider from sunrise to sunset
- Animation with 30x-240x speed
- Sun path arc with hour markers
- Real-time shadow casting

### SunHoursHeatmap

Solar exposure visualization.

```tsx
<SunHoursHeatmap
  lotPolygon={polygon}
  dims={zoningDims}
  date={new Date()}
  resolution={2}
  gridSize={60}
/>
```

Features:
- Color-coded sun hours (purple=shadow, yellow=full sun)
- Average sun hours calculation
- Re-analyze for different dates

## Key Dates for Analysis

| Date | Event | Significance |
|------|-------|--------------|
| Jun 21 | Summer Solstice | Longest day, highest sun |
| Dec 21 | Winter Solstice | Shortest day, lowest sun |
| Mar 20 | Spring Equinox | Equal day/night |
| Sep 22 | Fall Equinox | Equal day/night |

## Brevard County Sun Data (Latitude ~28°N)

| Date | Sunrise | Sunset | Daylight | Max Altitude |
|------|---------|--------|----------|--------------|
| Jun 21 | 6:25 AM | 8:24 PM | 13h 59m | 85.4° |
| Dec 21 | 7:08 AM | 5:31 PM | 10h 23m | 38.4° |
| Mar 20 | 7:30 AM | 7:40 PM | 12h 10m | 62.0° |
| Sep 22 | 7:14 AM | 7:22 PM | 12h 08m | 62.0° |

## Performance Tips

1. **Grid Resolution**: Use 2-5m resolution for fast analysis, 0.5-1m for detail
2. **Time Step**: 15-30 min intervals balance accuracy vs performance
3. **Caching**: Results are cached, re-analyze only when date changes
4. **Shadow Maps**: Use 2048x2048 for quality, 1024x1024 for performance

## Error Handling

```typescript
// Handle invalid dates
if (isNaN(date.getTime())) {
  throw new Error('Invalid date provided');
}

// Handle night time
if (!sunPosition.isDay) {
  console.log('Sun is below horizon');
}

// Handle polar regions (not applicable to Florida)
if (times.sunrise === undefined) {
  // Polar day or night
}
```

## References

For detailed API documentation, load:
- `suncalc-api.md` - SunCalc library reference
- `shadow-algorithm.md` - Shadow projection math

## Related Skills

- `envelope-development` - Generate building geometry for shadow casting
- `threejs-lighting` - DirectionalLight for realistic sun simulation
- `mapbox-integration` - Display sun analysis on satellite map
