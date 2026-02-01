# ZoneWise.AI Desktop

> 3D Building Envelope Intelligence for Brevard County, FL

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Apache--2.0-green)
![Status](https://img.shields.io/badge/status-beta-yellow)

## Overview

ZoneWise.AI Desktop provides instant 3D building envelope visualization based on verified municipal zoning codes. Know exactly what you can build before you buy.

### Key Features

- 🏗️ **3D Envelope Visualization** - See maximum buildable volume instantly
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

# Install dependencies
bun install

# Start development server
bun run viewer:dev
```

### Basic Usage

```tsx
import { EnvelopeViewer, ZoningDIMS } from '@craft-agent/ui/envelope';

const dims: ZoningDIMS = {
  district_code: 'RS-1',
  district_name: 'Residential Single-Family',
  max_height_ft: 35,
  max_far: 0.35,
  setbacks_ft: { front: 25, side: 15, rear: 20 },
  // ... other DIMS
};

<EnvelopeViewer
  lotPolygon={myLotPolygon}
  dims={dims}
  onEnvelopeCalculated={(result) => console.log(result)}
/>
```

## Components

### EnvelopeViewer

Standalone 3D envelope visualization component.

```tsx
<EnvelopeViewer
  lotPolygon={polygon}           // GeoJSON polygon
  dims={zoningDims}              // Zoning DIMS
  showSetbackLines={true}        // Show setback boundaries
  showHeightPlane={true}         // Show max height plane
  showGrid={true}                // Show ground grid
  envelopeColor="#4A90D9"        // Envelope color
  envelopeOpacity={0.7}          // 0-1 opacity
/>
```

### MapEnvelopeViewer

3D envelope on Mapbox satellite map.

```tsx
<MapEnvelopeViewer
  center={[-80.5687, 28.004]}    // [lng, lat]
  lotPolygon={polygon}
  dims={zoningDims}
  mapStyle="satellite"           // satellite, streets, light, dark
  zoom={18}
  pitch={60}
/>
```

### ZoneWiseApp

Full application with sidebar, DIMS editor, and view toggle.

```tsx
<ZoneWiseApp />
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

## Export Formats

### PNG Screenshot

```tsx
import { exportToPNG } from '@craft-agent/ui/envelope';

const canvas = document.querySelector('canvas');
await exportToPNG(canvas, 'envelope.png');
```

### OBJ 3D Model

```tsx
import { exportToOBJ } from '@craft-agent/ui/envelope';

exportToOBJ(result.geometry, 'envelope.obj');
```

### JSON Data

```tsx
import { exportToJSON } from '@craft-agent/ui/envelope';

exportToJSON(dims, result, lotPolygon, 'data.json');
```

### GeoJSON Polygons

```tsx
import { exportToGeoJSON } from '@craft-agent/ui/envelope';

exportToGeoJSON(lotPolygon, result, dims, 'envelope.geojson');
```

## Architecture

```
packages/ui/
├── src/
│   ├── lib/
│   │   ├── envelope-generator.ts    # Core 3D algorithm
│   │   ├── geo-utils.ts             # Coordinate transforms
│   │   ├── export-utils.ts          # PNG/OBJ/JSON export
│   │   ├── supabase-zoning.ts       # Database integration
│   │   └── use-responsive.ts        # Mobile hooks
│   ├── components/envelope/
│   │   ├── EnvelopeViewer.tsx       # 3D viewer
│   │   ├── MapEnvelopeViewer.tsx    # Map + 3D
│   │   ├── ZoneWiseApp.tsx          # Full app
│   │   ├── ExportPanel.tsx          # Export UI
│   │   └── EnvelopeTest.tsx         # Test component
│   ├── data/
│   │   └── malabar-sample-data.ts   # Test data
│   └── pages/
│       └── EnvelopeTestPage.tsx     # Test page
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
| earcut | ^2.2.4 | Triangulation |
| suncalc | ^1.9.0 | Sun position |

## Development

### Run Tests

```bash
bun test
```

### Build

```bash
bun run viewer:build
```

### Deploy

```bash
# Automatic via GitHub Actions on push to main
# Manual trigger available via workflow_dispatch
```

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

### Phase 5: Sun/Shadow (March 2026)
- [ ] SunCalc integration
- [ ] Shadow raycasting
- [ ] Date/time picker

## License

Apache-2.0 © 2026 ZoneWise.AI

## Credits

- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Turf.js](https://turfjs.org/)
- [Malabar LDC](https://library.municode.com/fl/malabar)
