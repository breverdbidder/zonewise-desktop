/**
 * ZoneWise.AI Building Envelope Generator
 * 
 * Core algorithm for generating 3D building envelopes from lot polygons and zoning DIMS.
 * Uses @turf/turf for geospatial operations, earcut for triangulation, and Three.js for 3D geometry.
 * 
 * @module envelope-generator
 * @version 1.0.0
 * @author ZoneWise.AI
 */

import * as turf from '@turf/turf';
import earcut from 'earcut';
import * as THREE from 'three';

/**
 * Zoning Development Intensity Metrics (DIMS)
 * Represents the zoning regulations for a specific district
 */
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
  jurisdiction?: string;
}

/**
 * Result of building envelope generation
 */
export interface EnvelopeResult {
  /** Three.js BufferGeometry representing the 3D envelope */
  geometry: THREE.BufferGeometry;
  /** Maximum buildable area after setbacks (sq ft) */
  maxBuildableArea: number;
  /** Maximum Gross Floor Area based on FAR (sq ft) */
  maxGFA: number;
  /** Total envelope volume (cubic feet) */
  envelopeVolume: number;
  /** Estimated maximum floors based on 10ft/floor */
  maxFloors: number;
  /** The setback polygon (buildable area) as GeoJSON */
  setbackPolygon: turf.Feature<turf.Polygon>;
  /** Center coordinates of the lot [lng, lat] */
  center: [number, number];
}

/**
 * Generates a 3D building envelope from a lot polygon and zoning DIMS
 * 
 * @param lotPolygon - GeoJSON polygon representing the lot boundary
 * @param dims - Zoning Development Intensity Metrics
 * @returns EnvelopeResult containing geometry and statistics
 * 
 * @example
 * ```typescript
 * const lot = turf.polygon([[[...coordinates...]]]);
 * const dims = {
 *   district_code: 'RS-1',
 *   max_height_ft: 35,
 *   max_far: 0.35,
 *   setbacks_ft: { front: 25, side: 7.5, rear: 20 }
 * };
 * const result = generateBuildingEnvelope(lot, dims);
 * ```
 */
export function generateBuildingEnvelope(
  lotPolygon: turf.Feature<turf.Polygon>,
  dims: ZoningDIMS
): EnvelopeResult {
  // Step 1: Get lot centroid for coordinate reference
  const centroid = turf.centroid(lotPolygon);
  const center: [number, number] = [
    centroid.geometry.coordinates[0],
    centroid.geometry.coordinates[1]
  ];
  
  // Step 2: Apply setbacks to lot polygon
  const setbackPolygon = applySetbacks(lotPolygon, dims.setbacks_ft);
  
  // Step 3: Calculate areas (turf returns sq meters, convert to sq ft)
  const buildableAreaM2 = turf.area(setbackPolygon);
  const buildableAreaSqFt = buildableAreaM2 * 10.7639;
  
  const lotAreaM2 = turf.area(lotPolygon);
  const lotAreaSqFt = lotAreaM2 * 10.7639;
  
  // Step 4: Calculate max GFA from FAR
  const maxGFA = lotAreaSqFt * dims.max_far;
  
  // Step 5: Calculate max floors (10 ft per floor standard)
  const avgFloorHeight = 10;
  const maxFloors = Math.floor(dims.max_height_ft / avgFloorHeight);
  
  // Step 6: Generate 3D envelope geometry
  const geometry = extrudePolygonToEnvelope(
    setbackPolygon, 
    dims.max_height_ft,
    center
  );
  
  // Step 7: Calculate envelope volume
  const envelopeVolume = buildableAreaSqFt * dims.max_height_ft;
  
  return {
    geometry,
    maxBuildableArea: Math.round(buildableAreaSqFt),
    maxGFA: Math.round(maxGFA),
    envelopeVolume: Math.round(envelopeVolume),
    maxFloors,
    setbackPolygon,
    center
  };
}

/**
 * Apply setbacks to create buildable area polygon
 * 
 * Note: This implementation uses uniform buffer for simplicity.
 * A more sophisticated version would identify front/side/rear edges
 * based on street frontage and apply individual setbacks.
 * 
 * @param polygon - Original lot polygon
 * @param setbacks - Setback distances in feet
 * @returns Inset polygon representing buildable area
 */
function applySetbacks(
  polygon: turf.Feature<turf.Polygon>,
  setbacks: { front: number; side: number; rear: number }
): turf.Feature<turf.Polygon> {
  // Calculate weighted average setback
  // Weight: front (1), side (2 for both sides), rear (1)
  const avgSetback = (setbacks.front + setbacks.side * 2 + setbacks.rear) / 4;
  const setbackMeters = avgSetback * 0.3048; // ft to meters
  
  // Use turf.buffer with negative value to inset
  const buffered = turf.buffer(polygon, -setbackMeters, { units: 'meters' });
  
  // Handle case where setbacks consume entire lot
  if (!buffered || buffered.geometry.type !== 'Polygon') {
    console.warn('Setbacks consumed entire lot, returning minimal polygon');
    const center = turf.centroid(polygon);
    return turf.buffer(center, 1, { units: 'meters' }) as turf.Feature<turf.Polygon>;
  }
  
  return buffered as turf.Feature<turf.Polygon>;
}

/**
 * Extrude 2D polygon to 3D envelope geometry
 * 
 * Creates a Three.js BufferGeometry with:
 * - Bottom face (y = 0)
 * - Top face (y = height)
 * - Wall faces connecting bottom to top
 * 
 * @param polygon - Setback polygon to extrude
 * @param heightFt - Maximum height in feet
 * @param center - Reference center for local coordinates [lng, lat]
 * @returns Three.js BufferGeometry
 */
function extrudePolygonToEnvelope(
  polygon: turf.Feature<turf.Polygon>,
  heightFt: number,
  center: [number, number]
): THREE.BufferGeometry {
  const coords = polygon.geometry.coordinates[0];
  const heightMeters = heightFt * 0.3048;
  
  const [centerLng, centerLat] = center;
  
  // Convert geo coords to local meters relative to center
  const localCoords = coords.map(coord => {
    const dx = (coord[0] - centerLng) * 111320 * Math.cos(centerLat * Math.PI / 180);
    const dy = (coord[1] - centerLat) * 110540;
    return [dx, dy] as [number, number];
  });
  
  // Flatten coordinates for earcut triangulation
  const flatCoords: number[] = [];
  localCoords.forEach(c => {
    flatCoords.push(c[0], c[1]);
  });
  
  // Triangulate the base polygon
  const indices = earcut(flatCoords);
  
  // Build geometry arrays
  const positions: number[] = [];
  const normals: number[] = [];
  
  // === BOTTOM FACE (y = 0) ===
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];
    
    // Counter-clockwise for bottom (normal pointing down)
    positions.push(
      localCoords[i0][0], 0, localCoords[i0][1],
      localCoords[i2][0], 0, localCoords[i2][1],
      localCoords[i1][0], 0, localCoords[i1][1]
    );
    
    // Normal pointing down (-Y)
    normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
  }
  
  // === TOP FACE (y = height) ===
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];
    
    // Clockwise for top (normal pointing up)
    positions.push(
      localCoords[i0][0], heightMeters, localCoords[i0][1],
      localCoords[i1][0], heightMeters, localCoords[i1][1],
      localCoords[i2][0], heightMeters, localCoords[i2][1]
    );
    
    // Normal pointing up (+Y)
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
  }
  
  // === WALL FACES ===
  for (let i = 0; i < localCoords.length - 1; i++) {
    const c1 = localCoords[i];
    const c2 = localCoords[i + 1];
    
    // Calculate wall normal (perpendicular to edge)
    const dx = c2[0] - c1[0];
    const dy = c2[1] - c1[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    
    // Normal pointing outward (perpendicular to edge in XZ plane)
    const nx = dy / len;
    const nz = -dx / len;
    
    // Two triangles per wall segment (quad)
    // Triangle 1: bottom-left, bottom-right, top-left
    positions.push(
      c1[0], 0, c1[1],
      c2[0], 0, c2[1],
      c1[0], heightMeters, c1[1]
    );
    normals.push(nx, 0, nz, nx, 0, nz, nx, 0, nz);
    
    // Triangle 2: bottom-right, top-right, top-left
    positions.push(
      c2[0], 0, c2[1],
      c2[0], heightMeters, c2[1],
      c1[0], heightMeters, c1[1]
    );
    normals.push(nx, 0, nz, nx, 0, nz, nx, 0, nz);
  }
  
  // Create BufferGeometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(normals, 3)
  );
  
  // Compute bounding box and sphere for frustum culling
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  
  return geometry;
}

/**
 * Convert geographic coordinates to local meters
 * Uses simple equirectangular projection (accurate for small areas)
 * 
 * @param lng - Longitude
 * @param lat - Latitude
 * @param centerLng - Reference center longitude
 * @param centerLat - Reference center latitude
 * @returns [x, y] in meters from center
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
 * 
 * @param x - X offset in meters
 * @param y - Y offset in meters
 * @param centerLng - Reference center longitude
 * @param centerLat - Reference center latitude
 * @returns [lng, lat]
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

/**
 * Calculate lot statistics without generating 3D geometry
 * Useful for quick analysis without rendering
 * 
 * @param lotPolygon - GeoJSON polygon
 * @param dims - Zoning DIMS
 * @returns Basic statistics
 */
export function calculateLotStats(
  lotPolygon: turf.Feature<turf.Polygon>,
  dims: ZoningDIMS
): {
  lotArea: number;
  buildableArea: number;
  maxGFA: number;
  maxFloors: number;
  meetsMinLot: boolean;
} {
  const lotAreaM2 = turf.area(lotPolygon);
  const lotAreaSqFt = lotAreaM2 * 10.7639;
  
  const setbackPolygon = applySetbacks(lotPolygon, dims.setbacks_ft);
  const buildableAreaM2 = turf.area(setbackPolygon);
  const buildableAreaSqFt = buildableAreaM2 * 10.7639;
  
  const maxGFA = lotAreaSqFt * dims.max_far;
  const maxFloors = Math.floor(dims.max_height_ft / 10);
  const meetsMinLot = lotAreaSqFt >= dims.min_lot_sqft;
  
  return {
    lotArea: Math.round(lotAreaSqFt),
    buildableArea: Math.round(buildableAreaSqFt),
    maxGFA: Math.round(maxGFA),
    maxFloors,
    meetsMinLot
  };
}
