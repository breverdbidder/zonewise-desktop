# ZoneWise.AI 3D Envelope - Complete Checkpoint & TODO

**Checkpoint ID**: `zonewise-3d-envelope-2026-01-31`  
**Date**: January 31, 2026  
**Author**: Claude AI Architect  
**Status**: RESEARCH COMPLETE → READY FOR IMPLEMENTATION

---

## 📋 EXECUTIVE SUMMARY

This checkpoint captures all research findings from the comprehensive evaluation of:
- SkillsMP (63K+ skills)
- GitHub Mega Library (500+ repos)
- API Mega Library (10,498 APIs)
- Apify (60K+ actors)
- Competitive analysis (Zoneomics + Autodesk Forma)

**Key Finding**: No open-source zoning-to-3D-envelope generator exists. Must build custom using threejs-skills + react-three-fiber.

**Competitive Context**: Zoneomics partnered with Autodesk Forma to provide integrated zoning → 3D envelope → environmental analysis workflow. ZoneWise must match or exceed this offering.

---

## 🎯 STRATEGIC DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| 3D Library | react-three-fiber + drei | 27K+ stars, React-native, best DX |
| Map Integration | react-three-map | Only lib bridging Mapbox + Three.js |
| Skills Source | CloudAI-X/threejs-skills | 10 production-ready SKILL.md files |
| Data Strategy | Custom scraping (Brevard) + Zoneomics API (scale) | Best data quality locally, API for expansion |
| Environmental Analysis | Sun/shadow (build) + Wind (partner) | Sun achievable, wind needs SimScale/Ladybug |

---

## ✅ TODO LIST

### Phase 1: Foundation (Week 1)

#### 1.1 Install threejs-skills to ZoneWise Desktop
```bash
cd /path/to/zonewise-desktop
mkdir -p .claude/skills
git clone https://github.com/CloudAI-X/threejs-skills.git /tmp/threejs-skills
cp -r /tmp/threejs-skills/skills/* .claude/skills/
```

**Skills to Copy**:
- `threejs-fundamentals` - Scene, camera, renderer
- `threejs-geometry` - BoxGeometry, ExtrudeGeometry
- `threejs-materials` - Materials, transparency
- `threejs-lighting` - Ambient, directional lights
- `threejs-interaction` - Raycasting, controls

#### 1.2 Install NPM Dependencies
```bash
cd zonewise-desktop
bun add three @react-three/fiber @react-three/drei react-three-map earcut @turf/turf mapbox-gl suncalc
bun add -D @types/three @types/earcut
```

#### 1.3 Create Custom ZoneWise Envelope Skill
```bash
mkdir -p .claude/skills/zonewise-envelope
```

Create `.claude/skills/zonewise-envelope/SKILL.md`:
```markdown
# Building Envelope Generator Skill

## Purpose
Generate 3D building envelopes from zoning parameters (setbacks, height, FAR).

## Triggers
- "create building envelope"
- "generate 3D envelope"  
- "visualize buildable area"
- "show setbacks in 3D"

## Dependencies
- threejs-fundamentals (scene setup)
- threejs-geometry (envelope mesh)
- react-three-map (map integration)

## Core Algorithm
1. Input: lot polygon + DIMS (setbacks, height, FAR)
2. Inset polygon by setbacks using @turf/buffer
3. Extrude to max height using Three.js ExtrudeGeometry
4. Clip by FAR volume if applicable
5. Output: Three.js mesh with proper materials

## Key Files
- src/components/envelope/EnvelopeViewer.tsx
- src/components/envelope/EnvelopeMesh.tsx
- src/lib/envelope/generator.ts
- src/lib/envelope/setback-calculator.ts

## Example Usage
\`\`\`typescript
import { generateEnvelope } from '@/lib/envelope/generator';

const envelope = generateEnvelope({
  lotPolygon: geoJsonPolygon,
  setbacks: { front: 25, rear: 20, side: 7.5 },
  maxHeight: 35,
  maxFAR: 0.4
});
\`\`\`
```

---

### Phase 2: 3D Envelope Core (Week 1-2)

#### 2.1 Create Envelope Generator Library

**File**: `src/lib/envelope/generator.ts`
```typescript
import * as turf from '@turf/turf';
import * as THREE from 'three';
import earcut from 'earcut';

export interface EnvelopeParams {
  lotPolygon: GeoJSON.Polygon;
  setbacks: {
    front: number;
    rear: number;
    side: number;
  };
  maxHeight: number;
  maxFAR?: number;
  units?: 'feet' | 'meters';
}

export interface EnvelopeResult {
  geometry: THREE.BufferGeometry;
  mesh: THREE.Mesh;
  buildableArea: number;
  maxGrossFloorArea: number;
  metadata: {
    lotArea: number;
    setbackArea: number;
    effectiveHeight: number;
  };
}

export function generateEnvelope(params: EnvelopeParams): EnvelopeResult {
  const { lotPolygon, setbacks, maxHeight, maxFAR, units = 'feet' } = params;
  
  // Convert to meters for turf.js calculations
  const conversionFactor = units === 'feet' ? 0.3048 : 1;
  
  // Calculate setback polygon (inset from lot boundary)
  const avgSetback = (setbacks.front + setbacks.rear + setbacks.side * 2) / 4;
  const setbackMeters = avgSetback * conversionFactor;
  
  // Buffer inward (negative buffer)
  const buildablePolygon = turf.buffer(lotPolygon, -setbackMeters, { units: 'meters' });
  
  if (!buildablePolygon) {
    throw new Error('Setbacks exceed lot size - no buildable area');
  }
  
  // Extract coordinates for Three.js
  const coords = buildablePolygon.geometry.coordinates[0];
  
  // Create 2D shape for extrusion
  const shape = new THREE.Shape();
  coords.forEach((coord, i) => {
    if (i === 0) {
      shape.moveTo(coord[0], coord[1]);
    } else {
      shape.lineTo(coord[0], coord[1]);
    }
  });
  
  // Calculate effective height (may be limited by FAR)
  const lotArea = turf.area(lotPolygon);
  const buildableArea = turf.area(buildablePolygon);
  let effectiveHeight = maxHeight * conversionFactor;
  
  if (maxFAR) {
    const maxGFA = lotArea * maxFAR;
    const farLimitedHeight = maxGFA / buildableArea;
    effectiveHeight = Math.min(effectiveHeight, farLimitedHeight);
  }
  
  // Create extruded geometry
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: effectiveHeight,
    bevelEnabled: false,
  };
  
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  
  // Rotate to stand upright (extrude goes along Z, we want Y-up)
  geometry.rotateX(-Math.PI / 2);
  
  // Create mesh with semi-transparent material
  const material = new THREE.MeshStandardMaterial({
    color: 0x4a90d9,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  
  return {
    geometry,
    mesh,
    buildableArea: buildableArea / (conversionFactor * conversionFactor), // Convert back to original units
    maxGrossFloorArea: maxFAR ? lotArea * maxFAR / (conversionFactor * conversionFactor) : buildableArea * (effectiveHeight / conversionFactor) / (conversionFactor * conversionFactor),
    metadata: {
      lotArea: lotArea / (conversionFactor * conversionFactor),
      setbackArea: (lotArea - buildableArea) / (conversionFactor * conversionFactor),
      effectiveHeight: effectiveHeight / conversionFactor,
    },
  };
}
```

#### 2.2 Create React Component

**File**: `src/components/envelope/EnvelopeViewer.tsx`
```typescript
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { generateEnvelope, EnvelopeParams } from '@/lib/envelope/generator';

interface EnvelopeViewerProps {
  params: EnvelopeParams;
  showGrid?: boolean;
  showSetbackLines?: boolean;
}

function EnvelopeMesh({ params }: { params: EnvelopeParams }) {
  const envelope = useMemo(() => {
    try {
      return generateEnvelope(params);
    } catch (error) {
      console.error('Envelope generation failed:', error);
      return null;
    }
  }, [params]);

  if (!envelope) return null;

  return <primitive object={envelope.mesh} />;
}

function SetbackLines({ params }: { params: EnvelopeParams }) {
  // Render setback boundary lines
  // Implementation depends on lot polygon visualization
  return null; // TODO: Implement setback line visualization
}

export function EnvelopeViewer({ 
  params, 
  showGrid = true, 
  showSetbackLines = true 
}: EnvelopeViewerProps) {
  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [100, 100, 100], fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
          
          <EnvelopeMesh params={params} />
          
          {showSetbackLines && <SetbackLines params={params} />}
          
          {showGrid && (
            <Grid
              infiniteGrid
              cellSize={10}
              cellThickness={0.5}
              sectionSize={50}
              sectionThickness={1}
              fadeDistance={400}
            />
          )}
          
          <OrbitControls makeDefault />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

---

### Phase 3: Map Integration (Week 2-3)

#### 3.1 Install react-three-map
```bash
bun add react-three-map
```

#### 3.2 Create Map + 3D Overlay Component

**File**: `src/components/envelope/MapEnvelopeViewer.tsx`
```typescript
'use client';

import Map from 'react-map-gl';
import { Canvas } from 'react-three-map';
import { OrbitControls } from '@react-three/drei';
import { EnvelopeParams } from '@/lib/envelope/generator';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface MapEnvelopeViewerProps {
  params: EnvelopeParams;
  center: [number, number]; // [lng, lat]
  zoom?: number;
}

export function MapEnvelopeViewer({
  params,
  center,
  zoom = 18
}: MapEnvelopeViewerProps) {
  return (
    <div className="w-full h-[600px]">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom: zoom,
          pitch: 60,
          bearing: -17
        }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
      >
        <Canvas latitude={center[1]} longitude={center[0]}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} />
          
          {/* Envelope mesh positioned at lot centroid */}
          <EnvelopeMesh params={params} />
          
          <OrbitControls />
        </Canvas>
      </Map>
    </div>
  );
}
```

---

### Phase 4: Sun/Shadow Analysis (Week 5-8)

#### 4.1 Install SunCalc
```bash
bun add suncalc
bun add -D @types/suncalc
```

#### 4.2 Create Sun Analysis Library

**File**: `src/lib/analysis/sun-analysis.ts`
```typescript
import SunCalc from 'suncalc';
import * as THREE from 'three';

export interface SunPosition {
  azimuth: number;  // radians, 0 = south, positive = west
  altitude: number; // radians above horizon
  date: Date;
}

export interface SunAnalysisParams {
  latitude: number;
  longitude: number;
  date: Date;
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
}

export interface SunHoursResult {
  point: THREE.Vector3;
  sunHours: number;
  hourlyExposure: boolean[];
}

export function getSunPosition(
  latitude: number,
  longitude: number,
  date: Date
): SunPosition {
  const pos = SunCalc.getPosition(date, latitude, longitude);
  return {
    azimuth: pos.azimuth,
    altitude: pos.altitude,
    date,
  };
}

export function getSunPositionsForDay(
  params: SunAnalysisParams
): SunPosition[] {
  const { latitude, longitude, date, startHour = 6, endHour = 20, intervalMinutes = 30 } = params;
  
  const positions: SunPosition[] = [];
  const currentDate = new Date(date);
  currentDate.setHours(startHour, 0, 0, 0);
  
  while (currentDate.getHours() < endHour) {
    const pos = getSunPosition(latitude, longitude, new Date(currentDate));
    
    // Only include if sun is above horizon
    if (pos.altitude > 0) {
      positions.push(pos);
    }
    
    currentDate.setMinutes(currentDate.getMinutes() + intervalMinutes);
  }
  
  return positions;
}

export function createSunLight(position: SunPosition): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(0xffffff, 1);
  
  // Convert spherical to cartesian
  // azimuth: 0 = south, altitude: angle above horizon
  const distance = 100;
  const x = distance * Math.cos(position.altitude) * Math.sin(position.azimuth);
  const y = distance * Math.sin(position.altitude);
  const z = distance * Math.cos(position.altitude) * Math.cos(position.azimuth);
  
  light.position.set(x, y, z);
  light.castShadow = true;
  
  return light;
}

export function calculateSunHours(
  scene: THREE.Scene,
  testPoints: THREE.Vector3[],
  sunPositions: SunPosition[]
): SunHoursResult[] {
  const raycaster = new THREE.Raycaster();
  const results: SunHoursResult[] = [];
  
  for (const point of testPoints) {
    const hourlyExposure: boolean[] = [];
    
    for (const sunPos of sunPositions) {
      // Direction from point to sun
      const sunDirection = new THREE.Vector3(
        Math.cos(sunPos.altitude) * Math.sin(sunPos.azimuth),
        Math.sin(sunPos.altitude),
        Math.cos(sunPos.altitude) * Math.cos(sunPos.azimuth)
      ).normalize();
      
      raycaster.set(point, sunDirection);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      // If no intersection, point is in sun
      hourlyExposure.push(intersects.length === 0);
    }
    
    const sunHours = hourlyExposure.filter(Boolean).length * 0.5; // 30-min intervals
    
    results.push({
      point,
      sunHours,
      hourlyExposure,
    });
  }
  
  return results;
}
```

---

## 📦 GITHUB REPOSITORIES TO ADOPT

### Tier 1: CRITICAL (Must Install)

| Repository | Stars | Purpose | Install Command |
|------------|-------|---------|-----------------|
| **pmndrs/react-three-fiber** | 27K+ | React renderer for Three.js | `bun add @react-three/fiber` |
| **pmndrs/drei** | 8K+ | Useful helpers for R3F | `bun add @react-three/drei` |
| **RodrigoHamuy/react-three-map** | 400+ | Bridge Mapbox + Three.js | `bun add react-three-map` |
| **CloudAI-X/threejs-skills** | - | Claude Code skills for 3D | Clone to `.claude/skills/` |
| **Turfjs/turf** | 9K+ | Geospatial analysis | `bun add @turf/turf` |

### Tier 2: HIGH PRIORITY

| Repository | Stars | Purpose | Install Command |
|------------|-------|---------|-----------------|
| **mapbox/mapbox-gl-js** | 11K+ | Interactive maps | `bun add mapbox-gl` |
| **mourner/suncalc** | 2K+ | Sun position calculations | `bun add suncalc` |
| **mapbox/earcut** | 2K+ | Polygon triangulation | `bun add earcut` |
| **mrdoob/three.js** | 100K+ | 3D graphics engine | `bun add three` |

### Tier 3: EVALUATE FOR PHASE 2+

| Repository | Stars | Purpose | Notes |
|------------|-------|---------|-------|
| **CesiumGS/cesium** | 12K+ | 3D globe visualization | Heavy, for global scale |
| **w3reality/three-geo** | 1.5K+ | Terrain visualization | If DEM needed |
| **cityjson/cityjson-threejs-loader** | 100+ | Load CityJSON 3D buildings | For context buildings |
| **ladybug-tools/ladybug** | 2K+ | Environmental analysis | Python, for wind/thermal |

---

## 🛠️ SKILLS TO INSTALL

### From CloudAI-X/threejs-skills (10 skills)

| Skill | Priority | Use Case |
|-------|----------|----------|
| `threejs-fundamentals` | 🔴 CRITICAL | Scene, camera, renderer setup |
| `threejs-geometry` | 🔴 CRITICAL | BoxGeometry, ExtrudeGeometry |
| `threejs-materials` | 🔴 CRITICAL | Materials, transparency, wireframe |
| `threejs-lighting` | 🟠 HIGH | Ambient, directional, shadows |
| `threejs-interaction` | 🟠 HIGH | Raycasting, mouse events |
| `threejs-animation` | 🟡 MEDIUM | For sun path animation |
| `threejs-textures` | 🟡 MEDIUM | Building textures |
| `threejs-loaders` | 🟢 LOW | Import external models |
| `threejs-postprocessing` | 🟢 V2 | Visual effects |
| `threejs-shaders` | 🟢 V2 | Custom shaders |

### Additional SkillsMP Skills

| Skill | URL | Priority |
|-------|-----|----------|
| Mapbox Integration Patterns | agent-skills.md/skills/mapbox | 🟠 HIGH |
| 3D Graphics (samhvw8) | agent-skills.md/skills/samhvw8/dot-claude/3d-graphics | 🟠 HIGH |
| React Expert | agent-skills.md/skills/Jeffallan/claude-skills/react-expert | 🟡 MEDIUM |

---

## 🔌 APIs TO INTEGRATE

### Data APIs (From API_MEGA_LIBRARY)

| API | Purpose | Cost | Priority |
|-----|---------|------|----------|
| **Census TIGERweb** | Parcel boundaries | FREE | ✅ DEPLOYED |
| **BCPAO REST** | Brevard property data | FREE | ✅ DEPLOYED |
| **Zoneomics** | Multi-county zoning | $61-186/mo | 🔄 EVALUATE |
| **OpenWeatherMap** | Weather for microclimate | Free tier | 🟡 PHASE 3 |

### Apify Actors (From Apify Evaluation)

| Actor | URL | Data | Priority |
|-------|-----|------|----------|
| **Zillow Scraper** | apify.com/maxcopell/zillow-scraper | Property values | ✅ ADOPT |
| **BuildZoom Scraper** | apify.com/actums/buildzoom-scraper | Permits, contractors | ✅ ADOPT |
| **Google Maps Scraper** | apify.com/compass/crawler-google-places | Location data | 🔄 EVALUATE |
| **US Census Scraper** | apify.com/parseforge/us-census-bureau-scraper | Demographics | 🔄 EVALUATE |

---

## 📊 COMPETITIVE GAP VS ZONEOMICS + FORMA

### Features to Match

| Feature | Zoneomics+Forma | ZoneWise Target | Timeline |
|---------|-----------------|-----------------|----------|
| Zone Code Lookup | ✅ | ✅ DONE | - |
| Setbacks/Height/FAR | ✅ | ✅ DONE | - |
| Source Citation | ❌ | ✅ BETTER | - |
| 3D Envelope | ✅ | 🔜 | Week 1-2 |
| Edit Controls UI | ✅ | 🔜 | Week 2-3 |
| Map Integration | ✅ | 🔜 | Week 2-3 |
| Sun/Shadow | ✅ | 🔜 | Week 5-8 |
| Wind Analysis | ✅ | ❌ Partner | Phase 3 |
| Microclimate | ✅ | ❌ Partner | Phase 3 |
| Revit Export | ✅ | 🔜 IFC | Week 4-6 |

### Pricing Target

| Their Stack | Their Cost | ZoneWise Target |
|-------------|------------|-----------------|
| Zoneomics Advanced | $186/mo | - |
| Autodesk AEC Collection | $209/mo | - |
| **TOTAL** | **$395/mo** | **$149/mo** (60% less) |

---

## 📁 FILE STRUCTURE

```
zonewise-desktop/
├── .claude/
│   └── skills/
│       ├── threejs-fundamentals/
│       │   └── SKILL.md
│       ├── threejs-geometry/
│       │   └── SKILL.md
│       ├── threejs-materials/
│       │   └── SKILL.md
│       ├── threejs-lighting/
│       │   └── SKILL.md
│       ├── threejs-interaction/
│       │   └── SKILL.md
│       └── zonewise-envelope/
│           └── SKILL.md
├── src/
│   ├── components/
│   │   └── envelope/
│   │       ├── EnvelopeViewer.tsx
│   │       ├── EnvelopeMesh.tsx
│   │       ├── MapEnvelopeViewer.tsx
│   │       ├── SetbackLines.tsx
│   │       └── HeightPlane.tsx
│   ├── lib/
│   │   ├── envelope/
│   │   │   ├── generator.ts
│   │   │   ├── setback-calculator.ts
│   │   │   └── far-calculator.ts
│   │   └── analysis/
│   │       ├── sun-analysis.ts
│   │       └── shadow-casting.ts
│   └── types/
│       └── envelope.ts
├── docs/
│   └── CHECKPOINT_3D_ENVELOPE_2026-01-31.md  ← THIS FILE
└── package.json
```

---

## 🚀 IMPLEMENTATION SCHEDULE

### Week 1: Foundation
- [ ] Clone threejs-skills to .claude/skills/
- [ ] Install NPM dependencies
- [ ] Create envelope generator library
- [ ] Create basic EnvelopeViewer component
- [ ] Test with Malabar sample parcel

### Week 2: Map Integration
- [ ] Integrate react-three-map
- [ ] Create MapEnvelopeViewer component
- [ ] Add Mapbox satellite/streets toggle
- [ ] Position envelope on real coordinates

### Week 3: UI & Controls
- [ ] Add setback editing controls
- [ ] Add height/FAR sliders
- [ ] Display buildable area calculations
- [ ] Add envelope statistics panel

### Week 4: Export
- [ ] PNG screenshot export
- [ ] OBJ mesh export
- [ ] Basic IFC export (for Revit)
- [ ] PDF report generation

### Week 5-8: Sun/Shadow Analysis
- [ ] Integrate SunCalc
- [ ] Implement shadow ray casting
- [ ] Create sun hours heatmap
- [ ] Add date/time animation
- [ ] Shadow study export

---

## 🔧 ENVIRONMENT VARIABLES

Add to `.env.local`:
```bash
# Mapbox (verified Jan 27, 2026)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mocerqjnksmhcjzxrewo.supabase.co
SUPABASE_SERVICE_KEY=[service_role_key]

# Optional: Weather API for microclimate
OPENWEATHERMAP_API_KEY=[your_key]
```

---

## ✅ SUCCESS CRITERIA

### MVP (4 weeks)
- [ ] 3D envelope generates from DIMS data
- [ ] Envelope displays on Mapbox satellite map
- [ ] User can adjust setbacks/height in UI
- [ ] Export to PNG works
- [ ] Works for all 13 Malabar districts

### Phase 2 (8 weeks)
- [ ] Sun/shadow analysis functional
- [ ] Shadow animation for any date
- [ ] IFC export for Revit
- [ ] Performance: <2s envelope generation

### Phase 3 (12+ weeks)
- [ ] Wind analysis (via partner API)
- [ ] Microclimate analysis
- [ ] Multi-county coverage
- [ ] $149/mo pricing tier live

---

## 📝 NOTES

1. **Mapbox Token**: Verified working Jan 27, 2026 (account: everest18)
2. **Malabar DIMS**: 13/13 districts 100% verified with Municode sources
3. **GIS Polygons**: 10,092 polygons in Supabase from Brevard GIS
4. **threejs-skills**: MIT licensed, safe to copy

---

## 🔗 REFERENCES

- Research docs in `/mnt/user-data/outputs/`:
  - `SKILLSMP_LIBRARY_EVALUATION_3D_ENVELOPE.md`
  - `API_APIFY_EVALUATION_ZONEWISE.md`
  - `ZONEWISE_VS_ZONEOMICS_FORMA_COMPETITIVE_GAP.md`
- Zoneomics + Forma announcement: https://blogs.autodesk.com/forma/2024/08/19/autodesk-and-zoneomics-partner/
- threejs-skills: https://github.com/CloudAI-X/threejs-skills

---

**Checkpoint Status**: ✅ COMPLETE  
**Next Action**: Push to GitHub, begin Week 1 implementation

---

*Generated by Claude AI Architect | ZoneWise.AI | January 31, 2026*
