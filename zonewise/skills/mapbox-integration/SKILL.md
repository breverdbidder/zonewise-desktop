---
name: mapbox-integration
version: 1.0.0
category: visualization
priority: 2
author: ZoneWise.AI
created: 2026-02-01
updated: 2026-02-01

description: |
  Mapbox GL JS integration with Three.js overlays. Satellite imagery, geocoding,
  custom map styles, and 3D building envelope visualization on maps.

dependencies:
  - mapbox-gl: ^3.0.0
  - "@mapbox/mapbox-gl-geocoder": ^5.0.0
  - react-map-gl: ^7.0.0

references:
  - mapbox-styles.md
  - react-three-map.md

tools_exposed:
  - initializeMap
  - geocodeAddress
  - addParcelLayer
  - addEnvelopeOverlay
  - getMapScreenshot

keywords:
  - mapbox
  - map
  - satellite
  - geocode
  - parcel layer
  - 3D overlay
---

# Mapbox Integration Skill

## Overview

This skill provides Mapbox GL JS integration for property visualization. Combine
satellite imagery with parcel boundaries, zoning overlays, and 3D building
envelopes using react-map-gl and Three.js.

## When to Use This Skill

Load this skill when the user asks about:
- Maps or satellite imagery
- Geocoding addresses
- Parcel boundaries on map
- Zoning overlays
- 3D envelope visualization on map
- Map screenshots or exports

## Mapbox Token

```typescript
// ZoneWise verified token (Jan 2026)
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw';
```

## React Map GL Setup

```tsx
import Map, { Source, Layer, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function PropertyMap({ parcelId, center }) {
  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: center[0],
        latitude: center[1],
        zoom: 18,
        pitch: 45,
        bearing: 0
      }}
      style={{ width: '100%', height: 500 }}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
    >
      <Source id="parcel" type="geojson" data={parcelGeoJson}>
        <Layer
          id="parcel-fill"
          type="fill"
          paint={{
            'fill-color': '#3b82f6',
            'fill-opacity': 0.3
          }}
        />
        <Layer
          id="parcel-line"
          type="line"
          paint={{
            'line-color': '#1d4ed8',
            'line-width': 2
          }}
        />
      </Source>
    </Map>
  );
}
```

## Geocoding

```typescript
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });

async function geocodeAddress(address: string): Promise<[number, number]> {
  const response = await geocodingClient
    .forwardGeocode({
      query: address,
      limit: 1,
      countries: ['us'],
      bbox: [-81.5, 27.5, -80.0, 29.0] // Brevard County bounds
    })
    .send();

  const [lng, lat] = response.body.features[0].center;
  return [lng, lat];
}
```

## Map Styles

| Style | ID | Use Case |
|-------|-----|----------|
| Satellite Streets | `mapbox://styles/mapbox/satellite-streets-v12` | Property analysis |
| Satellite | `mapbox://styles/mapbox/satellite-v9` | Clean aerial view |
| Streets | `mapbox://styles/mapbox/streets-v12` | Address context |
| Light | `mapbox://styles/mapbox/light-v11` | Overlays |
| Dark | `mapbox://styles/mapbox/dark-v11` | Night mode |

## Three.js Overlay

Combine Mapbox with Three.js for 3D envelope visualization:

```tsx
import { Canvas } from '@react-three/fiber';
import { useMap } from 'react-map-gl';

function EnvelopeOverlay({ envelope }) {
  const { current: map } = useMap();
  
  // Convert lat/lng to Mapbox mercator coordinates
  const mercator = mapboxgl.MercatorCoordinate.fromLngLat(
    [envelope.center.lng, envelope.center.lat],
    0
  );
  
  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0 }}
      camera={{ position: [0, 100, 100], fov: 45 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <mesh position={[mercator.x, mercator.y, 0]}>
        <boxGeometry args={[envelope.width, envelope.height, envelope.depth]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
      </mesh>
    </Canvas>
  );
}
```

## Parcel Layer from BCPAO

```typescript
// Fetch parcel geometry from BCPAO GIS
async function getParcelGeoJson(parcelId: string): Promise<GeoJSON.Feature> {
  const response = await fetch(
    `https://gis.brevardfl.gov/gissrv/rest/services/Base_Map/Parcel_New_WKID2881/MapServer/5/query?` +
    `where=PARCEL='${parcelId}'&outFields=*&f=geojson`
  );
  
  const data = await response.json();
  return data.features[0];
}
```

## Map Controls

```tsx
import { NavigationControl, ScaleControl, GeolocateControl } from 'react-map-gl';

<Map ...>
  <NavigationControl position="top-right" />
  <ScaleControl position="bottom-left" unit="imperial" />
  <GeolocateControl position="top-right" />
</Map>
```

## Screenshot Export

```typescript
function exportMapImage(map: mapboxgl.Map): string {
  const canvas = map.getCanvas();
  return canvas.toDataURL('image/png');
}
```

## Brevard County Bounds

```typescript
const BREVARD_BOUNDS: [number, number, number, number] = [
  -81.1,  // West
  27.8,   // South
  -80.4,  // East
  28.8    // North
];

// Fit map to Brevard County
map.fitBounds(BREVARD_BOUNDS, { padding: 50 });
```

## References

For detailed documentation, load:
- `mapbox-styles.md` - Custom style guide
- `react-three-map.md` - Three.js overlay patterns

## Related Skills

- `envelope-development` - Generate 3D envelopes to display
- `bcpao-integration` - Get parcel boundaries
- `sun-analysis` - Shadow overlay on map
