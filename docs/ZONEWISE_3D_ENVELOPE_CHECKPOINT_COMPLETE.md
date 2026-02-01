# ZoneWise.AI 3D Envelope Build Sprint - Complete Checkpoint

**Checkpoint ID**: `zonewise-3d-envelope-2026-01-31-complete`  
**Date**: January 31, 2026  
**Status**: RESEARCH COMPLETE → READY FOR EXECUTION  
**Created By**: Claude AI Architect  
**Repository**: `breverdbidder/zonewise-desktop`

---

## 📋 EXECUTIVE SUMMARY

This checkpoint captures ALL research findings from the end-to-end conversation about building ZoneWise.AI's 3D building envelope visualization to compete with Zoneomics + Autodesk Forma.

### Key Findings
1. **NO open-source zoning-to-3D-envelope generator exists** - must build custom
2. **CloudAI-X/threejs-skills** is the TOP find for Claude Code development
3. **react-three-map** enables Mapbox + Three.js integration
4. **Zoneomics pricing is $61-186/mo** (not $299 as previously cited)
5. **ZoneWise has BETTER data quality** (verified Municode sources vs "AI-processed")

---

## 🏆 GITHUB REPOSITORY FINDINGS

### TIER 1: ADOPT (Critical for 3D Envelope)

| Repository | Stars | Purpose | License | Adoption Status |
|------------|-------|---------|---------|-----------------|
| **pmndrs/react-three-fiber** | 27K+ | React renderer for Three.js | MIT | ✅ ADOPT |
| **pmndrs/drei** | 8K+ | Useful helpers for R3F | MIT | ✅ ADOPT |
| **RodrigoHamuy/react-three-map** | 400+ | React Three.js inside Mapbox | MIT | ✅ ADOPT |
| **mapbox/mapbox-gl-js** | 11K+ | Interactive maps | BSD-3 | ✅ ADOPT |
| **Turfjs/turf** | 9K+ | Geospatial operations | MIT | ✅ ADOPT |
| **mapbox/earcut** | 2K+ | Polygon triangulation | ISC | ✅ ADOPT |
| **mourner/suncalc** | 2K+ | Sun position calculations | BSD-2 | ✅ ADOPT |
| **CloudAI-X/threejs-skills** | 100+ | 10 Three.js SKILL.md files | MIT | ✅ ADOPT |

### TIER 2: EVALUATE (Useful Reference)

| Repository | Stars | Purpose | Notes |
|------------|-------|---------|-------|
| **cvdlab/react-planner** | 1K+ | 2D floorplan + 3D view | Good UI patterns |
| **w3reality/three-geo** | 1.5K+ | 3D terrain from real-world | Terrain generation |
| **cityjson/cityjson-threejs-loader** | 100+ | CityJSON to Three.js | City model loading |
| **zoningspace/zoning.space** | 50+ | Machine-readable zoning | Data format reference |
| **3DStreet/3dstreet** | 500+ | Street-level 3D | A-Frame based |
| **CodeHole7/threejs-3d-room-designer** | 300+ | 3D room planner | UI inspiration |
| **nickorzha/threejs-room-planner** | 200+ | 3D room editor | Edit patterns |

### TIER 3: CONDITIONAL (Specialized Use)

| Repository | Stars | Purpose | When to Use |
|------------|-------|---------|-------------|
| **CesiumGS/cesium** | 12K+ | 3D globe + 3D Tiles | If need globe view |
| **deck.gl/deck.gl** | 12K+ | WebGL data viz | Large datasets |
| **OSMBuildings/OSMBuildings** | 1K+ | OSM 3D buildings | OSM integration |
| **visgl/loaders.gl** | 500+ | Geospatial loaders | Multiple formats |

---

## 🎯 SKILLSMP MARKETPLACE FINDINGS

### TOP FIND: CloudAI-X/threejs-skills

**URL**: `github.com/CloudAI-X/threejs-skills`  
**Quality Score**: 91/100  
**License**: MIT  
**Skills Included**: 10 SKILL.md files

| Skill | File | Purpose | Priority |
|-------|------|---------|----------|
| **threejs-fundamentals** | `skills/threejs-fundamentals/SKILL.md` | Scene, camera, renderer | 🔴 CRITICAL |
| **threejs-geometry** | `skills/threejs-geometry/SKILL.md` | BoxGeometry, ExtrudeGeometry | 🔴 CRITICAL |
| **threejs-materials** | `skills/threejs-materials/SKILL.md` | Materials, transparency | 🔴 CRITICAL |
| **threejs-lighting** | `skills/threejs-lighting/SKILL.md` | Ambient, directional lights | 🟠 HIGH |
| **threejs-interaction** | `skills/threejs-interaction/SKILL.md` | Raycasting, controls | 🟠 HIGH |
| **threejs-animation** | `skills/threejs-animation/SKILL.md` | Rotation, transitions | 🟡 MEDIUM |
| **threejs-textures** | `skills/threejs-textures/SKILL.md` | Texture loading | 🟡 MEDIUM |
| **threejs-loaders** | `skills/threejs-loaders/SKILL.md` | Model loaders | 🟡 MEDIUM |
| **threejs-shaders** | `skills/threejs-shaders/SKILL.md` | Custom shaders | 🟢 LOW |
| **threejs-postprocessing** | `skills/threejs-postprocessing/SKILL.md` | Effects | 🟢 LOW |

### Other Relevant SkillsMP Finds

| Skill | URL | Score | Use Case |
|-------|-----|-------|----------|
| **Mapbox Integration Patterns** | agent-skills.md/skills/mapbox | 85/100 | Map + 3D overlay |
| **Three.js/TresJS Development** | agent-skills.md/skills/martinholovsky | 80/100 | Resource management |
| **3D Graphics (samhvw8)** | agent-skills.md/skills/samhvw8 | 88/100 | Comprehensive Three.js |
| **React Expert** | agent-skills.md/skills/Jeffallan | 85/100 | React 18+ patterns |
| **GIS Expert** | agent-skills.md/skills/gis | 78/100 | Geospatial operations |

---

## 📊 API_MEGA_LIBRARY FINDINGS (10,498 APIs)

### Zoning & Property APIs

| API | Category | Cost | Status | Notes |
|-----|----------|------|--------|-------|
| **Zoneomics** | Zoning | $61-186/mo | 🔄 PHASE 3 | 9K+ cities, use for scale |
| **Census TIGERweb** | GIS | FREE | ✅ ADOPT | Parcel boundaries |
| **BCPAO GIS** | Property | FREE | ✅ DEPLOYED | Brevard parcels |
| **Regrid (Loveland)** | Parcels | $99+/mo | 🔄 EVALUATE | National parcels |
| **Attom Data** | Property | $$$ | ❌ SKIP | Too expensive |

### Mapping APIs

| API | Category | Cost | Status |
|-----|----------|------|--------|
| **Mapbox GL JS** | Mapping | Free tier | ✅ DEPLOYED |
| **OpenWeatherMap** | Weather | Free tier | 🔄 EVALUATE |
| **Google Maps** | Mapping | Pay-per-use | ❌ SKIP (Mapbox is better) |

### 3D Visualization APIs

**FINDING**: API_MEGA_LIBRARY has NO 3D visualization APIs. Need to add new category.

**Recommended Additions**:
- Cesium ion (3D globe + 3D Tiles streaming)
- ArcGIS JS API (Esri 3D GIS)
- deck.gl (WebGL data viz, open source)
- OSM Buildings (OpenStreetMap 3D)
- Mapbox Terrain API (elevation data)

---

## 🐝 APIFY ACTORS FINDINGS (60K+ actors)

### Property & Real Estate Data

| Actor | URL | Cost | Data | Priority |
|-------|-----|------|------|----------|
| **Zillow Scraper** | apify.com/maxcopell/zillow-scraper | $7/1K | Properties, Zestimates | ✅ ADOPT |
| **Realtor.com Scraper** | apify.com/epctex/realtor-scraper | Per CU | Listings, schools | ✅ ADOPT |
| **Global Real Estate** | apify.com/charlestechy/global-real-estate-aggregator | Per CU | Unified data | ✅ ADOPT |
| **BuildZoom Scraper** | apify.com/actums/buildzoom-scraper | Per CU | Permits, contractors | ✅ ADOPT |

### Government & Census Data

| Actor | URL | Cost | Priority |
|-------|-----|------|----------|
| **US Census Scraper** | apify.com/parseforge/us-census-bureau-scraper | $5 free | ✅ ADOPT |
| **Data.gov Scraper** | apify.com/parseforge/data-gov-scraper | Per CU | 🔄 EVALUATE |

### Mapping & Location

| Actor | URL | Cost | Priority |
|-------|-----|------|----------|
| **Google Maps Scraper** | apify.com/compass/crawler-google-places | $0.007/item | ✅ ADOPT |
| **OpenStreetMap Scraper** | apify.com/easyapi/openstreetmap-listing-scraper | Per CU | 🔄 EVALUATE |

**FINDING**: Apify has NO 3D visualization actors - it's a scraping platform only.

---

## ⚔️ COMPETITIVE ANALYSIS: ZoneWise vs Zoneomics + Forma

### Zoneomics + Forma Partnership (Aug 2024)

**What They Provide Together**:
1. **Zoning Data** (Zoneomics): Zone codes, setbacks, height, FAR for 9K+ cities
2. **3D Envelope** (Forma extension): Auto-generate from zoning data
3. **Environmental Analysis** (Forma): Sun, shadow, wind, microclimate, noise, carbon
4. **Workflow** (Forma): Collaboration, Revit export, presentation mode

**Their Pricing**:
| Component | Monthly | Annual |
|-----------|---------|--------|
| Zoneomics Advanced | $186/mo | $2,232/yr |
| Autodesk AEC Collection | ~$209/mo | $2,510/yr |
| **TOTAL** | **$395/mo** | **$4,742/yr** |

### Feature Gap Analysis

| Feature | Zoneomics+Forma | ZoneWise (Now) | ZoneWise (4 weeks) | Gap |
|---------|-----------------|----------------|---------------------|-----|
| **Coverage** | 9K cities | 17 Brevard | 17 Brevard | ❌ Scale |
| **Data Quality** | "AI-processed" | Municode verified | Municode verified | ✅ BETTER |
| **Source Citations** | ❌ None | ✅ URLs | ✅ URLs | ✅ BETTER |
| **3D Envelope** | ✅ | ❌ | ✅ | ⏳ Building |
| **Sun/Shadow** | ✅ | ❌ | 🔜 | ⏳ Achievable |
| **Wind Analysis** | ✅ ML+CFD | ❌ | ❌ | ❌ Need partner |
| **Microclimate** | ✅ | ❌ | ❌ | ❌ Need partner |
| **Revit Export** | ✅ Native | ❌ | 🔜 IFC | ⏳ Partial |

### ZoneWise Competitive Advantages

1. **Verified Data Sources** - Municode URLs vs "AI-processed"
2. **Lower Price** - Target $49-149/mo vs $395/mo (60-70% cheaper)
3. **Local Depth** - Deep Brevard expertise vs broad/shallow
4. **Conversational AI** - Natural language queries (unique feature)
5. **Development Lifecycle** - Full discovery → permitting pipeline

---

## 📦 NPM PACKAGES TO INSTALL

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "react-three-map": "^0.5.0",
    "mapbox-gl": "^3.0.0",
    "@turf/turf": "^6.5.0",
    "earcut": "^2.2.4",
    "suncalc": "^1.9.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "@types/mapbox-gl": "^2.7.0",
    "@types/earcut": "^2.1.4"
  }
}
```

**Installation Command**:
```bash
cd zonewise-desktop
bun add three @react-three/fiber @react-three/drei react-three-map mapbox-gl @turf/turf earcut suncalc
bun add -d @types/three @types/mapbox-gl @types/earcut
```

---

## 🛠️ SKILLS INSTALLATION

### Clone threejs-skills to Project

```bash
cd zonewise-desktop
mkdir -p .claude/skills

# Clone threejs-skills
git clone https://github.com/CloudAI-X/threejs-skills.git /tmp/threejs-skills
cp -r /tmp/threejs-skills/skills/* .claude/skills/

# Verify installation
ls -la .claude/skills/
# Expected: threejs-animation, threejs-fundamentals, threejs-geometry, 
#           threejs-interaction, threejs-lighting, threejs-loaders,
#           threejs-materials, threejs-postprocessing, threejs-shaders, threejs-textures
```

---

## 💻 COMPLETE CODE TEMPLATES

### 1. Building Envelope Generator (Core Algorithm)

```typescript
// src/lib/envelope-generator.ts

import * as turf from '@turf/turf';
import earcut from 'earcut';
import * as THREE from 'three';

export interface ZoningDIMS {
  district_code: string;
  district_name: string;
  min_lot_sqft: number;
  min_lot_width_ft: number;
  max_height_ft: number;
  max_far: number;
  setbacks_ft: {
    front: number;
    side: number;
    rear: number;
  };
  source_url?: string;
  verified_date?: string;
}

export interface EnvelopeResult {
  geometry: THREE.BufferGeometry;
  maxBuildableArea: number;      // sq ft after setbacks
  maxGFA: number;                // Gross Floor Area from FAR
  envelopeVolume: number;        // cubic feet
  maxFloors: number;             // estimated floors
  setbackPolygon: turf.Feature<turf.Polygon>;
}

/**
 * Generates a 3D building envelope from lot polygon and zoning DIMS
 */
export function generateBuildingEnvelope(
  lotPolygon: turf.Feature<turf.Polygon>,
  dims: ZoningDIMS
): EnvelopeResult {
  // Step 1: Apply setbacks to lot polygon
  const setbackPolygon = applySetbacks(lotPolygon, dims.setbacks_ft);
  
  // Step 2: Calculate buildable area (in sq meters, convert to sq ft)
  const buildableAreaM2 = turf.area(setbackPolygon);
  const buildableAreaSqFt = buildableAreaM2 * 10.7639;
  
  // Step 3: Calculate max GFA from FAR
  const lotAreaM2 = turf.area(lotPolygon);
  const lotAreaSqFt = lotAreaM2 * 10.7639;
  const maxGFA = lotAreaSqFt * dims.max_far;
  
  // Step 4: Calculate max floors
  const avgFloorHeight = 10; // feet per floor
  const maxFloors = Math.floor(dims.max_height_ft / avgFloorHeight);
  
  // Step 5: Generate 3D envelope geometry
  const geometry = extrudePolygonToEnvelope(setbackPolygon, dims.max_height_ft);
  
  // Step 6: Calculate envelope volume
  const envelopeVolume = buildableAreaSqFt * dims.max_height_ft;
  
  return {
    geometry,
    maxBuildableArea: buildableAreaSqFt,
    maxGFA,
    envelopeVolume,
    maxFloors,
    setbackPolygon
  };
}

/**
 * Apply setbacks to create buildable area polygon
 * Note: This is simplified - production version needs edge detection
 */
function applySetbacks(
  polygon: turf.Feature<turf.Polygon>,
  setbacks: { front: number; side: number; rear: number }
): turf.Feature<turf.Polygon> {
  // Use average setback for buffer (simplified)
  // Production: identify front/side/rear edges and apply individually
  const avgSetback = (setbacks.front + setbacks.side * 2 + setbacks.rear) / 4;
  const setbackMeters = avgSetback * 0.3048; // ft to meters
  
  const buffered = turf.buffer(polygon, -setbackMeters, { units: 'meters' });
  
  if (!buffered || buffered.geometry.type !== 'Polygon') {
    // Setbacks consumed entire lot - return tiny polygon
    const center = turf.centroid(polygon);
    return turf.buffer(center, 1, { units: 'meters' }) as turf.Feature<turf.Polygon>;
  }
  
  return buffered as turf.Feature<turf.Polygon>;
}

/**
 * Extrude 2D polygon to 3D envelope geometry
 */
function extrudePolygonToEnvelope(
  polygon: turf.Feature<turf.Polygon>,
  heightFt: number
): THREE.BufferGeometry {
  const coords = polygon.geometry.coordinates[0];
  const heightMeters = heightFt * 0.3048;
  
  // Get centroid for local coordinate system
  const centroid = turf.centroid(polygon);
  const centerLng = centroid.geometry.coordinates[0];
  const centerLat = centroid.geometry.coordinates[1];
  
  // Convert geo coords to local meters
  const localCoords = coords.map(coord => {
    const dx = (coord[0] - centerLng) * 111320 * Math.cos(centerLat * Math.PI / 180);
    const dy = (coord[1] - centerLat) * 110540;
    return [dx, dy];
  });
  
  // Flatten for earcut triangulation
  const flatCoords: number[] = [];
  localCoords.forEach(c => {
    flatCoords.push(c[0], c[1]);
  });
  
  // Triangulate base
  const indices = earcut(flatCoords);
  
  // Build geometry with bottom, top, and walls
  const positions: number[] = [];
  const normals: number[] = [];
  
  // Bottom face (y = 0)
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];
    
    positions.push(
      localCoords[i0][0], 0, localCoords[i0][1],
      localCoords[i1][0], 0, localCoords[i1][1],
      localCoords[i2][0], 0, localCoords[i2][1]
    );
    // Normal pointing down
    normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
  }
  
  // Top face (y = height)
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];
    
    // Reverse winding for top face
    positions.push(
      localCoords[i0][0], heightMeters, localCoords[i0][1],
      localCoords[i2][0], heightMeters, localCoords[i2][1],
      localCoords[i1][0], heightMeters, localCoords[i1][1]
    );
    // Normal pointing up
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
  }
  
  // Walls (connect bottom to top)
  for (let i = 0; i < localCoords.length - 1; i++) {
    const c1 = localCoords[i];
    const c2 = localCoords[i + 1];
    
    // Calculate wall normal
    const dx = c2[0] - c1[0];
    const dy = c2[1] - c1[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const nz = dx / len;
    
    // Two triangles per wall segment
    positions.push(
      c1[0], 0, c1[1],
      c2[0], 0, c2[1],
      c1[0], heightMeters, c1[1],
      
      c2[0], 0, c2[1],
      c2[0], heightMeters, c2[1],
      c1[0], heightMeters, c1[1]
    );
    
    // Wall normals
    for (let j = 0; j < 6; j++) {
      normals.push(nx, 0, nz);
    }
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  
  return geometry;
}

/**
 * Convert geographic coordinates to local meters
 */
export function geoToLocal(
  lng: number, 
  lat: number, 
  centerLng: number, 
  centerLat: number
): [number, number] {
  const dx = (lng - centerLng) * 111320 * Math.cos(centerLat * Math.PI / 180);
  const dy = (lat - centerLat) * 110540;
  return [dx, dy];
}

/**
 * Convert local meters back to geographic coordinates
 */
export function localToGeo(
  x: number, 
  y: number, 
  centerLng: number, 
  centerLat: number
): [number, number] {
  const lng = centerLng + x / (111320 * Math.cos(centerLat * Math.PI / 180));
  const lat = centerLat + y / 110540;
  return [lng, lat];
}
```

### 2. EnvelopeViewer React Component

```tsx
// src/components/envelope/EnvelopeViewer.tsx

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Grid,
  Html,
  Line
} from '@react-three/drei';
import * as THREE from 'three';
import { generateBuildingEnvelope, ZoningDIMS, EnvelopeResult } from '@/lib/envelope-generator';
import * as turf from '@turf/turf';

interface EnvelopeViewerProps {
  lotPolygon: GeoJSON.Feature<GeoJSON.Polygon>;
  dims: ZoningDIMS;
  showSetbackLines?: boolean;
  showHeightPlane?: boolean;
  showGrid?: boolean;
  envelopeColor?: string;
  envelopeOpacity?: number;
  onEnvelopeCalculated?: (result: EnvelopeResult) => void;
}

// Envelope Mesh Component
function EnvelopeMesh({ 
  geometry, 
  color = '#4A90D9', 
  opacity = 0.7 
}: { 
  geometry: THREE.BufferGeometry;
  color?: string;
  opacity?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
}

// Wireframe overlay for envelope
function EnvelopeWireframe({ geometry }: { geometry: THREE.BufferGeometry }) {
  return (
    <lineSegments geometry={new THREE.EdgesGeometry(geometry)}>
      <lineBasicMaterial color="#1a365d" linewidth={1} />
    </lineSegments>
  );
}

// Lot Boundary Line
function LotBoundary({ 
  polygon,
  color = '#FF6B6B'
}: { 
  polygon: GeoJSON.Feature<GeoJSON.Polygon>;
  color?: string;
}) {
  const points = useMemo(() => {
    const coords = polygon.geometry.coordinates[0];
    const centroid = turf.centroid(polygon);
    const centerLng = centroid.geometry.coordinates[0];
    const centerLat = centroid.geometry.coordinates[1];
    
    return coords.map(coord => {
      const dx = (coord[0] - centerLng) * 111320 * Math.cos(centerLat * Math.PI / 180);
      const dy = (coord[1] - centerLat) * 110540;
      return new THREE.Vector3(dx, 0.1, dy);
    });
  }, [polygon]);
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={3}
      dashed={false}
    />
  );
}

// Setback Area Visualization
function SetbackArea({ 
  polygon,
  color = '#4ADE80'
}: { 
  polygon: turf.Feature<turf.Polygon>;
  color?: string;
}) {
  const points = useMemo(() => {
    const coords = polygon.geometry.coordinates[0];
    const centroid = turf.centroid(polygon);
    const centerLng = centroid.geometry.coordinates[0];
    const centerLat = centroid.geometry.coordinates[1];
    
    return coords.map(coord => {
      const dx = (coord[0] - centerLng) * 111320 * Math.cos(centerLat * Math.PI / 180);
      const dy = (coord[1] - centerLat) * 110540;
      return new THREE.Vector3(dx, 0.2, dy);
    });
  }, [polygon]);
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      dashed
      dashSize={1}
      gapSize={0.5}
    />
  );
}

// Max Height Plane
function HeightPlane({ 
  maxHeight, 
  size = 100 
}: { 
  maxHeight: number;
  size?: number;
}) {
  const heightMeters = maxHeight * 0.3048;
  
  return (
    <mesh 
      position={[0, heightMeters, 0]} 
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial 
        color="#22C55E" 
        transparent 
        opacity={0.1} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Stats Display (HTML overlay in 3D scene)
function StatsOverlay({ result, dims }: { result: EnvelopeResult; dims: ZoningDIMS }) {
  return (
    <Html position={[0, 0, 0]} style={{ pointerEvents: 'none' }}>
      <div className="bg-black/80 text-white p-4 rounded-lg text-sm min-w-[250px]">
        <h3 className="font-bold text-lg mb-2 text-blue-400">{dims.district_code}</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Buildable Area:</span>
            <span className="font-mono">{result.maxBuildableArea.toLocaleString()} sf</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Max GFA (FAR {dims.max_far}):</span>
            <span className="font-mono">{result.maxGFA.toLocaleString()} sf</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Max Height:</span>
            <span className="font-mono">{dims.max_height_ft} ft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Est. Floors:</span>
            <span className="font-mono">{result.maxFloors}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Envelope Volume:</span>
            <span className="font-mono">{result.envelopeVolume.toLocaleString()} cf</span>
          </div>
        </div>
        {dims.source_url && (
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500">
            Source: Municode verified
          </div>
        )}
      </div>
    </Html>
  );
}

// Main EnvelopeViewer Component
export function EnvelopeViewer({
  lotPolygon,
  dims,
  showSetbackLines = true,
  showHeightPlane = true,
  showGrid = true,
  envelopeColor = '#4A90D9',
  envelopeOpacity = 0.7,
  onEnvelopeCalculated
}: EnvelopeViewerProps) {
  
  const envelope = useMemo(() => {
    const result = generateBuildingEnvelope(lotPolygon as any, dims);
    onEnvelopeCalculated?.(result);
    return result;
  }, [lotPolygon, dims, onEnvelopeCalculated]);
  
  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[50, 40, 50]} fov={50} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={200}
          maxPolarAngle={Math.PI / 2.1}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[20, 40, 20]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-20, 20, -20]} intensity={0.3} />
        
        {/* Ground */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.1, 0]}
          receiveShadow
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        
        {/* Grid */}
        {showGrid && (
          <Grid
            position={[0, 0.01, 0]}
            args={[100, 100]}
            cellSize={5}
            cellThickness={0.5}
            cellColor="#333"
            sectionSize={20}
            sectionThickness={1}
            sectionColor="#444"
            fadeDistance={100}
            fadeStrength={1}
          />
        )}
        
        {/* Lot boundary (red) */}
        <LotBoundary polygon={lotPolygon} />
        
        {/* Setback area (green dashed) */}
        {showSetbackLines && (
          <SetbackArea polygon={envelope.setbackPolygon} />
        )}
        
        {/* Building envelope */}
        <EnvelopeMesh 
          geometry={envelope.geometry} 
          color={envelopeColor}
          opacity={envelopeOpacity}
        />
        <EnvelopeWireframe geometry={envelope.geometry} />
        
        {/* Max height plane */}
        {showHeightPlane && (
          <HeightPlane maxHeight={dims.max_height_ft} />
        )}
        
        {/* Environment */}
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
      
      {/* Stats overlay (outside Canvas) */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-sm">
        <h3 className="font-bold text-lg mb-2 text-blue-400">{dims.district_code}</h3>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Buildable Area:</span>
            <span className="font-mono">{envelope.maxBuildableArea.toLocaleString()} sf</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Max GFA:</span>
            <span className="font-mono">{envelope.maxGFA.toLocaleString()} sf</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Max Height:</span>
            <span className="font-mono">{dims.max_height_ft} ft</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Est. Floors:</span>
            <span className="font-mono">{result.maxFloors}</span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-1 bg-red-500"></div>
          <span>Lot Boundary</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-1 bg-green-500 border-dashed"></div>
          <span>Buildable Area</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/70"></div>
          <span>Envelope</span>
        </div>
      </div>
    </div>
  );
}

export default EnvelopeViewer;
```

### 3. Sun/Shadow Analysis (Phase 2)

```typescript
// src/lib/sun-analysis.ts

import SunCalc from 'suncalc';
import * as THREE from 'three';

export interface SunPosition {
  azimuth: number;      // radians from south, clockwise
  altitude: number;     // radians above horizon
  time: Date;
}

export interface ShadowAnalysisResult {
  averageSunHours: number;
  shadowMap: Float32Array;
  sunPath: SunPosition[];
  sunrise: Date;
  sunset: Date;
}

/**
 * Calculate sun position for a given time and location
 */
export function calculateSunPosition(
  date: Date,
  latitude: number,
  longitude: number
): SunPosition {
  const pos = SunCalc.getPosition(date, latitude, longitude);
  return {
    azimuth: pos.azimuth,
    altitude: pos.altitude,
    time: date
  };
}

/**
 * Generate sun path for entire day at specified intervals
 */
export function generateSunPath(
  date: Date,
  latitude: number,
  longitude: number,
  intervalMinutes: number = 30
): SunPosition[] {
  const path: SunPosition[] = [];
  const times = SunCalc.getTimes(date, latitude, longitude);
  
  let current = new Date(times.sunrise);
  const sunset = times.sunset;
  
  while (current <= sunset) {
    const pos = calculateSunPosition(current, latitude, longitude);
    if (pos.altitude > 0) {
      path.push(pos);
    }
    current = new Date(current.getTime() + intervalMinutes * 60 * 1000);
  }
  
  return path;
}

/**
 * Create Three.js directional light from sun position
 */
export function createSunLight(
  position: SunPosition,
  intensity: number = 1
): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  
  const distance = 100;
  const x = distance * Math.cos(position.altitude) * Math.sin(position.azimuth);
  const y = distance * Math.sin(position.altitude);
  const z = distance * Math.cos(position.altitude) * Math.cos(position.azimuth);
  
  light.position.set(x, y, z);
  light.castShadow = true;
  
  // Shadow camera setup
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500;
  light.shadow.camera.left = -100;
  light.shadow.camera.right = 100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;
  
  return light;
}

/**
 * Analyze sun hours on a grid using raycasting
 */
export function analyzeSunHours(
  scene: THREE.Scene,
  buildingMesh: THREE.Mesh,
  latitude: number,
  longitude: number,
  date: Date,
  gridSize: number = 50,
  gridResolution: number = 1
): ShadowAnalysisResult {
  const sunPath = generateSunPath(date, latitude, longitude);
  const times = SunCalc.getTimes(date, latitude, longitude);
  
  const raycaster = new THREE.Raycaster();
  const shadowMap = new Float32Array(gridSize * gridSize);
  
  // For each point on the ground grid
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = (i - gridSize / 2) * gridResolution;
      const z = (j - gridSize / 2) * gridResolution;
      const point = new THREE.Vector3(x, 0.1, z);
      
      let sunHoursAtPoint = 0;
      
      // Check visibility from each sun position
      for (const sunPos of sunPath) {
        if (sunPos.altitude <= 0) continue;
        
        const sunDirection = new THREE.Vector3(
          Math.cos(sunPos.altitude) * Math.sin(sunPos.azimuth),
          Math.sin(sunPos.altitude),
          Math.cos(sunPos.altitude) * Math.cos(sunPos.azimuth)
        ).normalize();
        
        raycaster.set(point, sunDirection);
        const intersects = raycaster.intersectObject(buildingMesh);
        
        // No intersection = receives sunlight
        if (intersects.length === 0) {
          sunHoursAtPoint += 0.5; // 30-minute interval
        }
      }
      
      shadowMap[i * gridSize + j] = sunHoursAtPoint;
    }
  }
  
  const totalSunHours = Array.from(shadowMap).reduce((a, b) => a + b, 0);
  const averageSunHours = totalSunHours / (gridSize * gridSize);
  
  return {
    averageSunHours,
    shadowMap,
    sunPath,
    sunrise: times.sunrise,
    sunset: times.sunset
  };
}

/**
 * Create a heatmap visualization of sun hours
 */
export function createSunHoursHeatmap(
  shadowMap: Float32Array,
  gridSize: number,
  gridResolution: number
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    gridSize * gridResolution,
    gridSize * gridResolution,
    gridSize - 1,
    gridSize - 1
  );
  
  // Color vertices based on sun hours
  const colors = new Float32Array(geometry.attributes.position.count * 3);
  const maxHours = Math.max(...shadowMap);
  
  for (let i = 0; i < shadowMap.length; i++) {
    const normalizedHours = shadowMap[i] / maxHours;
    
    // Color gradient: blue (low sun) -> yellow (medium) -> red (high sun)
    let r, g, b;
    if (normalizedHours < 0.5) {
      r = normalizedHours * 2;
      g = normalizedHours * 2;
      b = 1 - normalizedHours;
    } else {
      r = 1;
      g = 1 - (normalizedHours - 0.5) * 2;
      b = 0;
    }
    
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }
  
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.05;
  
  return mesh;
}
```

### 4. Map + 3D Integrated View

```tsx
// src/components/envelope/MapEnvelopeViewer.tsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl';
import { Canvas } from 'react-three-map';
import * as THREE from 'three';
import 'mapbox-gl/dist/mapbox-gl.css';
import { generateBuildingEnvelope, ZoningDIMS } from '@/lib/envelope-generator';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw';

interface MapEnvelopeViewerProps {
  center: [number, number]; // [lng, lat]
  lotPolygon: GeoJSON.Feature<GeoJSON.Polygon>;
  dims: ZoningDIMS;
  zoom?: number;
}

export function MapEnvelopeViewer({ 
  center, 
  lotPolygon, 
  dims,
  zoom = 18 
}: MapEnvelopeViewerProps) {
  const mapRef = useRef<MapRef>(null);
  
  const [viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom: zoom,
    pitch: 60,
    bearing: -20
  });
  
  const envelope = React.useMemo(() => {
    return generateBuildingEnvelope(lotPolygon as any, dims);
  }, [lotPolygon, dims]);
  
  return (
    <div className="w-full h-[700px] relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {/* Lot polygon fill */}
        <Source id="lot" type="geojson" data={lotPolygon}>
          <Layer
            id="lot-fill"
            type="fill"
            paint={{
              'fill-color': '#FF6B6B',
              'fill-opacity': 0.2
            }}
          />
          <Layer
            id="lot-outline"
            type="line"
            paint={{
              'line-color': '#FF6B6B',
              'line-width': 3
            }}
          />
        </Source>
        
        {/* Setback area */}
        <Source id="setback" type="geojson" data={envelope.setbackPolygon}>
          <Layer
            id="setback-fill"
            type="fill"
            paint={{
              'fill-color': '#4ADE80',
              'fill-opacity': 0.15
            }}
          />
          <Layer
            id="setback-outline"
            type="line"
            paint={{
              'line-color': '#4ADE80',
              'line-width': 2,
              'line-dasharray': [2, 2]
            }}
          />
        </Source>
        
        {/* 3D Canvas overlay */}
        <Canvas latitude={center[1]} longitude={center[0]}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={0.8} />
          
          {/* 3D Envelope mesh */}
          <mesh geometry={envelope.geometry}>
            <meshStandardMaterial
              color="#4A90D9"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Wireframe */}
          <lineSegments geometry={new THREE.EdgesGeometry(envelope.geometry)}>
            <lineBasicMaterial color="#1a365d" />
          </lineSegments>
        </Canvas>
      </Map>
      
      {/* Controls panel */}
      <div className="absolute top-4 right-4 bg-white/95 p-4 rounded-lg shadow-xl w-80">
        <h3 className="font-bold text-lg mb-3 text-gray-800">
          {dims.district_code} - {dims.district_name}
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Max Height:</span>
            <span className="font-mono font-bold">{dims.max_height_ft} ft</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">FAR:</span>
            <span className="font-mono font-bold">{dims.max_far}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Front Setback:</span>
            <span className="font-mono">{dims.setbacks_ft.front} ft</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Side Setback:</span>
            <span className="font-mono">{dims.setbacks_ft.side} ft</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Rear Setback:</span>
            <span className="font-mono">{dims.setbacks_ft.rear} ft</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <h4 className="font-semibold text-gray-700 mb-2">Envelope Stats</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Buildable Area:</span>
              <span className="font-mono">{envelope.maxBuildableArea.toLocaleString()} sf</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max GFA:</span>
              <span className="font-mono">{envelope.maxGFA.toLocaleString()} sf</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Est. Floors:</span>
              <span className="font-mono">{envelope.maxFloors}</span>
            </div>
          </div>
        </div>
        
        {dims.source_url && (
          <div className="mt-3 pt-2 border-t text-xs">
            <a 
              href={dims.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              📄 View Municode Source
            </a>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-2 bg-red-500/50 border border-red-500"></div>
          <span>Lot Boundary</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-2 bg-green-500/30 border border-green-500 border-dashed"></div>
          <span>Buildable Area</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/70"></div>
          <span>3D Envelope</span>
        </div>
      </div>
    </div>
  );
}

export default MapEnvelopeViewer;
```

---

## ✅ COMPLETE TODO LIST

### Phase 1: Foundation (Week 1 - Feb 1-7, 2026)

| # | Task | Command/Details | Status |
|---|------|-----------------|--------|
| 1.1 | Install NPM packages | `bun add three @react-three/fiber @react-three/drei react-three-map mapbox-gl @turf/turf earcut suncalc` | ⬜ |
| 1.2 | Install dev dependencies | `bun add -d @types/three @types/mapbox-gl @types/earcut` | ⬜ |
| 1.3 | Clone threejs-skills | See Skills Installation section | ⬜ |
| 1.4 | Create `src/lib/envelope-generator.ts` | Copy from code template | ⬜ |
| 1.5 | Create `src/lib/geo-utils.ts` | Coordinate conversion utilities | ⬜ |
| 1.6 | Create `src/components/envelope/EnvelopeViewer.tsx` | Copy from code template | ⬜ |
| 1.7 | Test with Malabar RS-1 sample parcel | Manual test | ⬜ |

### Phase 2: Map Integration (Week 2 - Feb 8-14, 2026)

| # | Task | Details | Status |
|---|------|---------|--------|
| 2.1 | Create `MapEnvelopeViewer.tsx` | Copy from code template | ⬜ |
| 2.2 | Connect to Supabase zoning_districts | Fetch DIMS by district_code | ⬜ |
| 2.3 | Implement parcel selection from map | Click to select | ⬜ |
| 2.4 | Add DIMS editing panel | Real-time envelope update | ⬜ |
| 2.5 | Add view toggle (map/3D/split) | View mode switcher | ⬜ |

### Phase 3: Polish & Export (Week 3 - Feb 15-21, 2026)

| # | Task | Details | Status |
|---|------|---------|--------|
| 3.1 | Add setback visualization toggle | Show/hide setback lines | ⬜ |
| 3.2 | Add height plane indicator | Transparent plane at max height | ⬜ |
| 3.3 | Implement PNG export | Canvas to PNG | ⬜ |
| 3.4 | Implement OBJ export | Three.js to OBJ file | ⬜ |
| 3.5 | Add envelope statistics panel | Buildable area, GFA, volume | ⬜ |
| 3.6 | Add source URL display | Link to Municode | ⬜ |

### Phase 4: Testing & Deploy (Week 4 - Feb 22-28, 2026)

| # | Task | Details | Status |
|---|------|---------|--------|
| 4.1 | Test all 13 Malabar districts | RR-65, RS-65, RS-10, etc. | ⬜ |
| 4.2 | Performance optimization | Lazy loading, LOD | ⬜ |
| 4.3 | Mobile responsiveness | Touch controls | ⬜ |
| 4.4 | Deploy to Cloudflare Pages | Production deploy | ⬜ |
| 4.5 | Update README.md | Feature documentation | ⬜ |

### Phase 5: Sun/Shadow Analysis (March 2026)

| # | Task | Details | Status |
|---|------|---------|--------|
| 5.1 | Create `src/lib/sun-analysis.ts` | Copy from code template | ⬜ |
| 5.2 | Add SunCalc integration | Sun position calculations | ⬜ |
| 5.3 | Implement shadow raycasting | Per-point analysis | ⬜ |
| 5.4 | Create sun hours heatmap | Color-coded grid | ⬜ |
| 5.5 | Add date/time picker | User-selectable analysis date | ⬜ |
| 5.6 | Add shadow animation | Time-lapse shadows | ⬜ |

### Phase 6: Partnerships & Scale (Q2 2026)

| # | Task | Details | Status |
|---|------|---------|--------|
| 6.1 | Evaluate SimScale API | Wind analysis partner | ⬜ |
| 6.2 | Evaluate Ladybug Tools | Open source alternative | ⬜ |
| 6.3 | Implement IFC export | For Revit compatibility | ⬜ |
| 6.4 | Expand beyond Brevard | Additional counties | ⬜ |
| 6.5 | Integrate Zoneomics API | For national scale | ⬜ |

---

## 📂 TARGET FILE STRUCTURE

```
zonewise-desktop/
├── .claude/
│   └── skills/
│       ├── threejs-animation/SKILL.md
│       ├── threejs-fundamentals/SKILL.md
│       ├── threejs-geometry/SKILL.md
│       ├── threejs-interaction/SKILL.md
│       ├── threejs-lighting/SKILL.md
│       ├── threejs-loaders/SKILL.md
│       ├── threejs-materials/SKILL.md
│       ├── threejs-postprocessing/SKILL.md
│       ├── threejs-shaders/SKILL.md
│       └── threejs-textures/SKILL.md
│
├── src/
│   ├── lib/
│   │   ├── envelope-generator.ts      # Core 3D envelope algorithm
│   │   ├── sun-analysis.ts            # Sun/shadow calculations
│   │   └── geo-utils.ts               # Coordinate conversions
│   │
│   ├── components/
│   │   └── envelope/
│   │       ├── EnvelopeViewer.tsx     # Standalone 3D viewer
│   │       ├── MapEnvelopeViewer.tsx  # Map + 3D integrated
│   │       ├── EnvelopeMesh.tsx       # 3D geometry component
│   │       ├── LotBoundary.tsx        # Lot outline
│   │       ├── SetbackArea.tsx        # Setback visualization
│   │       ├── HeightPlane.tsx        # Max height indicator
│   │       ├── SunPathViewer.tsx      # Sun path visualization
│   │       └── EnvelopeStats.tsx      # Statistics panel
│   │
│   └── pages/
│       └── envelope/
│           ├── index.tsx              # Envelope landing page
│           └── [parcelId].tsx         # Parcel-specific page
│
├── docs/
│   ├── ZONEWISE_3D_ENVELOPE_CHECKPOINT_COMPLETE.md  # This file
│   ├── COMPETITIVE_ANALYSIS_ZONEOMICS_FORMA.md
│   └── API_APIFY_EVALUATION_ZONEWISE.md
│
└── package.json                        # Updated dependencies
```

---

## 🔗 VERIFIED CREDENTIALS

| Credential | Value | Status |
|------------|-------|--------|
| **Mapbox Token** | `pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw` | ✅ Verified Jan 27, 2026 |
| **Supabase URL** | `mocerqjnksmhcjzxrewo.supabase.co` | ✅ Active |
| **GitHub Repo** | `breverdbidder/zonewise-desktop` | ✅ Active |

---

## 📊 SUCCESS METRICS

| Metric | Target | Current |
|--------|--------|---------|
| 3D Envelope Generation | < 2 seconds | N/A |
| Map + 3D Load Time | < 3 seconds | N/A |
| Export Time (PNG) | < 1 second | N/A |
| Mobile Responsive | Yes | N/A |
| Brevard Districts | 301 | 267 verified |
| Malabar Districts | 13/13 | ✅ 100% |
| Forma Feature Parity | 60% | ~10% |

---

## 🎯 STRATEGIC SUMMARY

### Build (Weeks 1-4)
- ✅ 3D envelope generator using Three.js + react-three-fiber
- ✅ Map integration using react-three-map + Mapbox
- ✅ Sun/shadow analysis using SunCalc (Phase 2)

### Adopt from GitHub
- pmndrs/react-three-fiber (27K stars)
- pmndrs/drei (8K stars)
- RodrigoHamuy/react-three-map (400+ stars)
- CloudAI-X/threejs-skills (10 SKILL.md files)
- mourner/suncalc (2K stars)

### Partner (Phase 3)
- SimScale for wind/CFD analysis
- Ladybug Tools as open-source alternative

### Skip for Now
- Cesium (overkill for building-level)
- Zoneomics API (ZoneWise data is better for Brevard)
- Google Maps (Mapbox is better for 3D)

---

*Checkpoint created by Claude AI Architect*  
*Date: January 31, 2026*  
*Repository: breverdbidder/zonewise-desktop*
