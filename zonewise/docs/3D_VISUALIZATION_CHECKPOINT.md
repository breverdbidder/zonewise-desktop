# ZoneWise V2: 3D Visualization Implementation Checkpoint

**Date:** February 1, 2026  
**Phase:** 2 - Build 3D Visualization with React Three Fiber and Mapbox  
**Status:** 🔍 PRE-IMPLEMENTATION REVIEW (Measure Twice, Cut Once)

---

## 🎯 Objective

Migrate the Electron desktop app's 3D building envelope visualization to a web-based React Three Fiber implementation with Mapbox integration, sun/shadow analysis, and interactive controls.

---

## 📋 Implementation Plan

### Component Architecture

```
client/src/
├── components/
│   ├── 3d/
│   │   ├── BuildingEnvelope.tsx      # Main 3D scene component
│   │   ├── EnvelopeGeometry.tsx      # 3D building mesh generator
│   │   ├── SetbackVisualization.tsx  # Setback lines and zones
│   │   ├── SunPosition.tsx           # Sun position and shadows
│   │   ├── MeasurementTools.tsx      # Distance/height measurements
│   │   └── SceneControls.tsx         # Camera and interaction controls
│   ├── map/
│   │   ├── MapboxView.tsx            # Mapbox GL JS integration
│   │   ├── PropertyMarker.tsx        # Property location marker
│   │   └── LayerControls.tsx         # Map layer toggles
│   └── analysis/
│       ├── SunAnalysis.tsx           # Sun/shadow analysis UI
│       ├── DateTimePicker.tsx        # Date/time selection
│       └── ShadowReport.tsx          # Shadow analysis results
└── pages/
    └── PropertyAnalysis.tsx          # Main property analysis page
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| 3D Rendering | React Three Fiber | WebGL 3D visualization |
| 3D Helpers | @react-three/drei | Camera controls, helpers |
| Map | Mapbox GL JS | Satellite imagery, 2D map |
| Sun Calculations | suncalc | Sun position and shadow angles |
| Geometry | three.js | 3D math and geometry |
| State Management | React hooks | Component state |
| Data Fetching | tRPC | Zoning data from Supabase |

---

## 🏗️ Implementation Steps

### Step 1: Install Dependencies
```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add mapbox-gl suncalc
pnpm add @types/three @types/mapbox-gl @types/suncalc --save-dev
```

### Step 2: Create 3D Scene Foundation
**File:** `client/src/components/3d/BuildingEnvelope.tsx`

**Features:**
- Canvas setup with React Three Fiber
- Camera positioning and controls (OrbitControls)
- Lighting (ambient + directional)
- Grid helper for spatial reference
- Axes helper for orientation

### Step 3: Build Envelope Geometry Generator
**File:** `client/src/components/3d/EnvelopeGeometry.tsx`

**Inputs:**
- Lot dimensions (width, depth)
- Setbacks (front, side, rear)
- Max height
- Lot coverage percentage

**Outputs:**
- 3D mesh representing buildable envelope
- Wireframe for setback boundaries
- Ground plane with lot outline

**Algorithm:**
```typescript
1. Calculate buildable area from setbacks
2. Create box geometry with dimensions:
   - Width: lot_width - (left_setback + right_setback)
   - Depth: lot_depth - (front_setback + rear_setback)
   - Height: max_height
3. Position box at correct offset from lot origin
4. Add wireframe for setback lines
5. Add ground plane with lot boundary
```

### Step 4: Integrate Mapbox for Context
**File:** `client/src/components/map/MapboxView.tsx`

**Features:**
- Satellite imagery layer
- Property location marker
- 3D buildings layer (optional)
- Zoom/pan controls
- Coordinate display

**Integration Pattern:**
```typescript
1. Initialize Mapbox with API token
2. Center map on property coordinates
3. Add satellite layer
4. Overlay property marker
5. Sync camera between Mapbox and Three.js (optional)
```

### Step 5: Sun/Shadow Analysis
**File:** `client/src/components/analysis/SunAnalysis.tsx`

**Features:**
- Date/time picker
- Sun position calculation (azimuth, altitude)
- Directional light positioned at sun angle
- Shadow casting on ground plane
- Shadow length/direction display

**SunCalc Integration:**
```typescript
import SunCalc from 'suncalc';

function calculateSunPosition(date: Date, lat: number, lng: number) {
  const sunPos = SunCalc.getPosition(date, lat, lng);
  return {
    azimuth: sunPos.azimuth,
    altitude: sunPos.altitude,
    // Convert to Three.js coordinates
    x: Math.cos(sunPos.altitude) * Math.sin(sunPos.azimuth),
    y: Math.sin(sunPos.altitude),
    z: Math.cos(sunPos.altitude) * Math.cos(sunPos.azimuth),
  };
}
```

### Step 6: Measurement Tools
**File:** `client/src/components/3d/MeasurementTools.tsx`

**Features:**
- Click-to-measure distance
- Height measurement from ground
- Area calculation
- Dimension labels

### Step 7: Interactive Controls
**File:** `client/src/components/3d/SceneControls.tsx`

**Features:**
- Layer toggles (envelope, setbacks, shadows, grid)
- View presets (top, front, side, isometric)
- Measurement mode toggle
- Export screenshot button

---

## 📊 Data Flow

```
User selects property
    ↓
Fetch zoning data from Supabase
    ↓
Extract dimensional standards (extractDimensions)
    ↓
Pass to BuildingEnvelope component
    ↓
Generate 3D geometry
    ↓
Render in React Three Fiber canvas
    ↓
User interacts (rotate, measure, analyze sun)
    ↓
Update visualization in real-time
```

---

## 🎨 Visual Design

### Color Palette
- **Buildable Envelope:** Semi-transparent blue (#3B82F6, opacity 0.3)
- **Setback Lines:** Red (#EF4444)
- **Lot Boundary:** White (#FFFFFF)
- **Ground Plane:** Dark gray (#1F2937)
- **Grid:** Light gray (#374151, opacity 0.2)
- **Sun:** Yellow (#FCD34D)
- **Shadows:** Black (opacity 0.5)

### Camera Settings
- **Initial Position:** Isometric view (45° angle)
- **FOV:** 50°
- **Near/Far Clipping:** 0.1 / 1000
- **Controls:** OrbitControls with damping

---

## 🔌 API Integration

### tRPC Procedures Needed

```typescript
// server/routers.ts
property: router({
  // Get property by address
  getByAddress: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      // Geocode address
      // Find jurisdiction
      // Get zoning district
      // Extract dimensions
      return { property, zoning, dimensions };
    }),
  
  // Get zoning by coordinates
  getByCoordinates: publicProcedure
    .input(z.object({ lat: z.number(), lng: z.number() }))
    .query(async ({ input }) => {
      // Reverse geocode
      // Find jurisdiction
      // Get zoning district
      return { zoning, dimensions };
    }),
});
```

---

## 🧪 Testing Plan

### Unit Tests
- [ ] Envelope geometry calculations
- [ ] Sun position calculations
- [ ] Dimension extraction from description
- [ ] Coordinate transformations

### Integration Tests
- [ ] Mapbox initialization
- [ ] Three.js scene rendering
- [ ] tRPC data fetching
- [ ] User interactions (click, drag, zoom)

### Manual Testing
- [ ] Test with Malabar POC data
- [ ] Verify setback visualization accuracy
- [ ] Test sun analysis for different dates/times
- [ ] Test measurement tools
- [ ] Test export functionality
- [ ] Test on mobile devices

---

## 📦 Deliverables

1. ✅ **3D Visualization Components** - React Three Fiber implementation
2. ✅ **Mapbox Integration** - Satellite imagery with property overlay
3. ✅ **Sun/Shadow Analysis** - SunCalc integration with date/time picker
4. ✅ **Interactive Controls** - Camera, measurements, layer toggles
5. ✅ **Property Analysis Page** - Complete UI integrating all components
6. ✅ **tRPC Procedures** - Backend API for property/zoning data
7. ✅ **Documentation** - Component usage and API reference

---

## ⚠️ Known Challenges & Solutions

### Challenge 1: Performance with Complex Geometries
**Solution:** Use instanced meshes for repeated elements, implement LOD (Level of Detail)

### Challenge 2: Mapbox + Three.js Coordinate Sync
**Solution:** Use separate views initially, add sync as enhancement later

### Challenge 3: Shadow Accuracy
**Solution:** Use Three.js shadow maps with proper light/camera configuration

### Challenge 4: Mobile Performance
**Solution:** Reduce polygon count on mobile, disable shadows on low-end devices

---

## 🚀 Implementation Timeline

| Step | Estimated Time | Dependencies |
|------|---------------|--------------|
| Install dependencies | 5 min | None |
| 3D scene foundation | 30 min | Dependencies |
| Envelope geometry | 1 hour | Scene foundation |
| Mapbox integration | 45 min | None (parallel) |
| Sun/shadow analysis | 1 hour | Scene foundation |
| Measurement tools | 45 min | Scene foundation |
| Interactive controls | 30 min | All components |
| Property analysis page | 1 hour | All components |
| tRPC procedures | 45 min | Supabase client |
| Testing & refinement | 2 hours | All components |
| **Total** | **~8 hours** | |

---

## ✅ Pre-Implementation Checklist

- [x] Supabase connection verified
- [x] Zoning data available (17 jurisdictions, 301 districts)
- [x] Dimensional standards extraction working
- [ ] Mapbox API token obtained (need to request from user)
- [ ] Component architecture reviewed
- [ ] Technology stack approved
- [ ] Implementation plan reviewed
- [ ] Testing strategy defined

---

## 🎯 Success Criteria

1. ✅ User can select a property by address or coordinates
2. ✅ 3D building envelope displays with correct dimensions
3. ✅ Setbacks are clearly visualized
4. ✅ Sun/shadow analysis works for any date/time
5. ✅ Measurement tools provide accurate dimensions
6. ✅ Mapbox shows property location with satellite imagery
7. ✅ Interactive controls are intuitive and responsive
8. ✅ Performance is acceptable on desktop and mobile
9. ✅ Export functionality generates usable files

---

## 🔄 Next Steps After Approval

1. Install dependencies
2. Create component files
3. Implement 3D scene foundation
4. Build envelope geometry generator
5. Integrate Mapbox
6. Add sun/shadow analysis
7. Implement measurement tools
8. Create property analysis page
9. Add tRPC procedures
10. Test and refine

---

**Status:** 🟡 AWAITING USER APPROVAL TO PROCEED

**Question for User:** Do you have a Mapbox API token, or should I proceed without Mapbox initially and add it later?

**Estimated Completion:** 8 hours after approval
