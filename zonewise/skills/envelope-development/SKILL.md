# ZoneWise 3D Envelope Development Skill

## Overview
This skill provides best practices for developing 3D building envelope visualizations for the ZoneWise.AI platform using React Three Fiber and related libraries.

## Dependencies
- `three` - Core Three.js library
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers (OrbitControls, Line, Grid, etc.)
- `react-three-map` - Mapbox + Three.js integration
- `@turf/turf` - Geospatial calculations
- `earcut` - Polygon triangulation
- `suncalc` - Sun position calculations
- `mapbox-gl` - Interactive maps

## Key Components

### EnvelopeViewer
Primary component for standalone 3D envelope visualization.

```tsx
import { EnvelopeViewer } from '@craft-agent/ui/envelope';

<EnvelopeViewer
  lotPolygon={geoJsonPolygon}
  dims={zoningDims}
  showSetbackLines={true}
  showHeightPlane={true}
  envelopeColor="#4A90D9"
  envelopeOpacity={0.7}
  onEnvelopeCalculated={(result) => console.log(result)}
/>
```

### ZoningDIMS Interface
```typescript
interface ZoningDIMS {
  district_code: string;      // e.g., "RS-1"
  district_name: string;      // e.g., "Residential Single-Family"
  min_lot_sqft: number;       // Minimum lot size
  min_lot_width_ft: number;   // Minimum lot width
  max_height_ft: number;      // Maximum building height
  max_far: number;            // Floor Area Ratio
  setbacks_ft: {
    front: number;
    side: number;
    rear: number;
  };
  source_url?: string;        // Municode verification URL
  verified_date?: string;     // Last verification date
}
```

## Best Practices

### 1. Coordinate Systems
- Geographic coordinates: [longitude, latitude] (GeoJSON standard)
- Three.js: Y-up, X=East, Z=South (negate for North)
- Always use centroid as local origin for accuracy

### 2. Performance
- Use BufferGeometry (not Geometry)
- Memoize expensive calculations with useMemo
- Use InstancedMesh for multiple identical objects
- Enable shadows only when needed

### 3. Geospatial Accuracy
- Use equirectangular projection for small areas (<100km)
- Convert feet to meters: `feet * 0.3048`
- Convert sq meters to sq feet: `sqm * 10.7639`

### 4. Rendering
- Use `side: THREE.DoubleSide` for transparent materials
- Add EdgesGeometry for wireframe overlays
- Enable `castShadow` and `receiveShadow` for realism

## Testing Checklist
- [ ] Envelope generates correctly from polygon
- [ ] Setbacks reduce buildable area
- [ ] Height plane shows at correct elevation
- [ ] Statistics display accurate values
- [ ] Camera controls work smoothly
- [ ] Mobile touch controls work

## Mapbox Token
```
pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw
```

## Data Sources
- Zoning DIMS: Supabase `zoning_districts` table
- Parcel Boundaries: BCPAO GIS / Brevard County
- Source Verification: Municode library URLs
