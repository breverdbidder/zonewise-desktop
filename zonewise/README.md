# ZoneWise.AI Desktop

> 3D Building Envelope Intelligence with Sun/Shadow Analysis for Brevard County, FL

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![License](https://img.shields.io/badge/license-Apache--2.0-green)
![Status](https://img.shields.io/badge/status-beta-yellow)

## Overview

ZoneWise.AI Desktop provides instant 3D building envelope visualization with real-time sun/shadow analysis based on verified municipal zoning codes. Know exactly what you can build and how shadows will affect your property.

### Key Features

- 🏗️ **3D Envelope Visualization** - See maximum buildable volume instantly
- ☀️ **Sun/Shadow Analysis** - Real-time shadows with date/time picker
- 🌡️ **Sun Hours Heatmap** - Visualize solar exposure across your lot
- 🗺️ **Mapbox Integration** - Satellite imagery with 3D overlay
- 📊 **Verified DIMS** - Municode-sourced zoning regulations
- 📤 **Export Options** - PNG, OBJ, JSON, GeoJSON formats
- 🔍 **13 Malabar Districts** - 100% verified coverage
- 📱 **Responsive Design** - Works on desktop, tablet, mobile

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/breverdbidder/zonewise-desktop.git
cd zonewise-desktop

# Install dependencies (including suncalc)
bun install

# Start development server
bun run viewer:dev
```

## Components

### EnvelopeViewer

Standalone 3D envelope visualization.

```tsx
<EnvelopeViewer
  lotPolygon={polygon}
  dims={zoningDims}
  showSetbackLines={true}
  showHeightPlane={true}
  envelopeColor="#4A90D9"
/>
```

### SunShadowViewer ☀️ NEW

3D envelope with real-time sun position and shadow casting.

```tsx
<SunShadowViewer
  lotPolygon={polygon}
  dims={zoningDims}
  initialDate={new Date('2026-06-21')} // Summer solstice
  location={[-80.5687, 28.004]}         // [lng, lat]
  showSunPath={true}                    // Show sun arc
  showShadows={true}                    // Enable shadow casting
/>
```

**Features:**
- 📅 Date picker for any day of year
- ⏰ Time slider from sunrise to sunset
- ▶️ Animation with 30x-240x speed
- 🧭 Compass directions
- 📍 Hour markers on sun path

### SunHoursHeatmap 🌡️ NEW

Visualize solar exposure across your lot using shadow raycasting.

```tsx
<SunHoursHeatmap
  lotPolygon={polygon}
  dims={zoningDims}
  date={new Date()}
  resolution={2}        // 2 meter grid
  gridSize={60}         // 60m analysis area
/>
```

**Features:**
- 🎨 Color-coded sun hours (purple=shadow, yellow=full sun)
- 📊 Average sun hours calculation
- 🔄 Re-analyze for different dates
- 📈 Summer vs Winter comparison

### MapEnvelopeViewer

3D envelope on Mapbox satellite map.

```tsx
<MapEnvelopeViewer
  center={[-80.5687, 28.004]}
  lotPolygon={polygon}
  dims={zoningDims}
  mapStyle="satellite"
  zoom={18}
  pitch={60}
/>
```

## Sun Analysis API

### Calculate Sun Position

```typescript
import { calculateSunPosition, getSunTimes } from '@craft-agent/ui/envelope';

// Get sun position for specific time
const position = calculateSunPosition(new Date(), 28.004, -80.5687);
console.log(`Azimuth: ${position.azimuthDegrees}°`);
console.log(`Altitude: ${position.altitudeDegrees}°`);

// Get sunrise/sunset times
const times = getSunTimes(new Date(), 28.004, -80.5687);
console.log(`Sunrise: ${times.sunrise}`);
console.log(`Sunset: ${times.sunset}`);
```

### Generate Sun Path

```typescript
import { generateSunPath } from '@craft-agent/ui/envelope';

const path = generateSunPath({
  latitude: 28.004,
  longitude: -80.5687,
  date: new Date('2026-06-21'), // Summer solstice
  intervalMinutes: 30,
  sunDistance: 80
});

// Returns array of { time, position, vector }
```

### Analyze Sun Hours

```typescript
import { analyzeSunHours, generateAnalysisGrid } from '@craft-agent/ui/envelope';

const grid = generateAnalysisGrid([-30, -30, 30, 30], 0.1, 2);
const results = analyzeSunHours(grid, config, buildingMeshes);

// Returns array of { point, sunHours, sunPercentage, shadowPeriods }
```

## Zoning Data

### Supported Jurisdictions

| Jurisdiction | Districts | Status |
|-------------|-----------|--------|
| Malabar, FL | 13 | ✅ 100% Verified |
| Melbourne, FL | - | 🔜 Coming Soon |
| Palm Bay, FL | - | 🔜 Coming Soon |

### Malabar Districts

| Code | Name | Max Height | FAR |
|------|------|------------|-----|
| RR-65 | Rural Residential (65k sf) | 35' | 0.25 |
| RS-65 | Residential SF (65k sf) | 35' | 0.25 |
| RS-10 | Residential SF (10k sf) | 35' | 0.35 |
| RS-5 | Residential SF (5k sf) | 35' | 0.40 |
| RS-2.5 | Residential SF (2.5k sf) | 35' | 0.50 |
| RS-1 | Residential SF (1 acre) | 35' | 0.30 |
| RM-6 | Multi-Family (6 units/ac) | 45' | 0.60 |
| R/LC | Residential/Commercial | 35' | 0.40 |
| C-1 | Neighborhood Commercial | 35' | 0.50 |
| C-2 | General Commercial | 45' | 0.60 |
| GI | General Industrial | 50' | 0.50 |
| PUD | Planned Unit Development | 45' | 0.50 |
| CON | Conservation | 25' | 0.10 |

Source: [Malabar LDC Article III](https://library.municode.com/fl/malabar/codes/land_development_code)

## Architecture

```
packages/ui/
├── src/
│   ├── lib/
│   │   ├── envelope-generator.ts    # Core 3D algorithm
│   │   ├── geo-utils.ts             # Coordinate transforms
│   │   ├── sun-analysis.ts          # SunCalc integration ☀️
│   │   ├── export-utils.ts          # PNG/OBJ/JSON export
│   │   ├── supabase-zoning.ts       # Database integration
│   │   └── use-responsive.ts        # Mobile hooks
│   ├── components/envelope/
│   │   ├── EnvelopeViewer.tsx       # 3D viewer
│   │   ├── SunShadowViewer.tsx      # Sun/shadow viewer ☀️
│   │   ├── SunHoursHeatmap.tsx      # Solar heatmap 🌡️
│   │   ├── MapEnvelopeViewer.tsx    # Map + 3D
│   │   ├── ZoneWiseApp.tsx          # Full app
│   │   ├── ExportPanel.tsx          # Export UI
│   │   └── index.ts                 # Module exports
│   └── data/
│       └── malabar-sample-data.ts   # Test data
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| three | ^0.160.0 | 3D rendering |
| @react-three/fiber | ^8.15.0 | React Three.js |
| @react-three/drei | ^9.92.0 | Three.js helpers |
| react-three-map | ^0.5.0 | Mapbox + Three.js |
| mapbox-gl | ^3.0.0 | Map tiles |
| @turf/turf | ^6.5.0 | Geospatial ops |
| **suncalc** | **^1.9.0** | **Sun position** ☀️ |
| earcut | ^2.2.4 | Triangulation |

## Roadmap

### Phase 1: Foundation ✅
- [x] envelope-generator.ts
- [x] EnvelopeViewer.tsx
- [x] Malabar 13 districts

### Phase 2: Map Integration ✅
- [x] MapEnvelopeViewer.tsx
- [x] Supabase integration
- [x] DIMS editor

### Phase 3: Polish ✅
- [x] PNG export
- [x] OBJ export
- [x] Mobile responsive

### Phase 4: Testing ✅
- [x] 13 district tests
- [x] Performance tests
- [x] Cloudflare deploy

### Phase 5: Sun/Shadow ✅
- [x] sun-analysis.ts with SunCalc
- [x] SunShadowViewer component
- [x] Shadow raycasting
- [x] Sun hours heatmap
- [x] Date/time picker
- [x] Shadow animation

### Phase 6: Melbourne Expansion (April 2026)
- [ ] Melbourne zoning districts
- [ ] BCPAO parcel integration
- [ ] Multi-jurisdiction support

## License

Apache-2.0 © 2026 ZoneWise.AI

## Credits

- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [SunCalc](https://github.com/mourner/suncalc) ☀️
- [Turf.js](https://turfjs.org/)
- [Malabar LDC](https://library.municode.com/fl/malabar)
