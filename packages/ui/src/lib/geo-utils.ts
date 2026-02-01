/**
 * ZoneWise.AI Geospatial Utilities
 * 
 * Helper functions for coordinate transformations, distance calculations,
 * and geospatial operations used throughout the envelope visualization system.
 * 
 * @module geo-utils
 * @version 1.0.0
 */

import * as turf from '@turf/turf';

/**
 * Earth radius constants
 */
export const EARTH_RADIUS_METERS = 6371000;
export const METERS_PER_DEGREE_LAT = 110540;

/**
 * Convert feet to meters
 */
export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters / 0.3048;
}

/**
 * Convert square feet to square meters
 */
export function sqftToSqm(sqft: number): number {
  return sqft * 0.092903;
}

/**
 * Convert square meters to square feet
 */
export function sqmToSqft(sqm: number): number {
  return sqm * 10.7639;
}

/**
 * Get meters per degree of longitude at a given latitude
 * (varies with latitude due to Earth's curvature)
 */
export function metersPerDegreeLon(latitude: number): number {
  return 111320 * Math.cos(latitude * Math.PI / 180);
}

/**
 * Convert geographic coordinates to local Cartesian (meters)
 * Uses equirectangular projection centered at reference point
 * Accurate for distances < 100km
 * 
 * @param lng - Longitude to convert
 * @param lat - Latitude to convert
 * @param centerLng - Reference center longitude
 * @param centerLat - Reference center latitude
 * @returns [x, y] in meters where +X is East, +Y is North
 */
export function geoToLocal(
  lng: number,
  lat: number,
  centerLng: number,
  centerLat: number
): [number, number] {
  const x = (lng - centerLng) * metersPerDegreeLon(centerLat);
  const y = (lat - centerLat) * METERS_PER_DEGREE_LAT;
  return [x, y];
}

/**
 * Convert local Cartesian coordinates back to geographic
 * 
 * @param x - X offset in meters (East positive)
 * @param y - Y offset in meters (North positive)
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
  const lng = centerLng + x / metersPerDegreeLon(centerLat);
  const lat = centerLat + y / METERS_PER_DEGREE_LAT;
  return [lng, lat];
}

/**
 * Convert Three.js Vector3 to geographic coordinates
 * Note: Three.js uses Y-up, so Y=altitude, X=East, Z=South
 * 
 * @param x - Three.js X (East)
 * @param z - Three.js Z (South, so negate for North)
 * @param centerLng - Reference longitude
 * @param centerLat - Reference latitude
 * @returns [lng, lat]
 */
export function threeToGeo(
  x: number,
  z: number,
  centerLng: number,
  centerLat: number
): [number, number] {
  // Z is negative in Three.js for North, so we negate it
  return localToGeo(x, -z, centerLng, centerLat);
}

/**
 * Convert geographic coordinates to Three.js Vector3 position
 * 
 * @param lng - Longitude
 * @param lat - Latitude
 * @param altitude - Altitude in meters (default 0)
 * @param centerLng - Reference longitude
 * @param centerLat - Reference latitude
 * @returns [x, y, z] for Three.js
 */
export function geoToThree(
  lng: number,
  lat: number,
  altitude: number,
  centerLng: number,
  centerLat: number
): [number, number, number] {
  const [x, y] = geoToLocal(lng, lat, centerLng, centerLat);
  // In Three.js: Y is up, Z is negative for North
  return [x, altitude, -y];
}

/**
 * Calculate the centroid of a GeoJSON polygon
 * 
 * @param polygon - GeoJSON polygon feature
 * @returns [lng, lat] of centroid
 */
export function getPolygonCenter(
  polygon: GeoJSON.Feature<GeoJSON.Polygon>
): [number, number] {
  const centroid = turf.centroid(polygon);
  return [
    centroid.geometry.coordinates[0],
    centroid.geometry.coordinates[1]
  ];
}

/**
 * Calculate the bounding box of a GeoJSON polygon
 * 
 * @param polygon - GeoJSON polygon feature
 * @returns [minLng, minLat, maxLng, maxLat]
 */
export function getPolygonBbox(
  polygon: GeoJSON.Feature<GeoJSON.Polygon>
): [number, number, number, number] {
  return turf.bbox(polygon) as [number, number, number, number];
}

/**
 * Calculate area of a polygon in square feet
 * 
 * @param polygon - GeoJSON polygon feature
 * @returns Area in square feet
 */
export function getPolygonAreaSqFt(
  polygon: GeoJSON.Feature<GeoJSON.Polygon>
): number {
  const areaSqM = turf.area(polygon);
  return sqmToSqft(areaSqM);
}

/**
 * Calculate the optimal camera distance for viewing a polygon
 * Based on the bounding box diagonal
 * 
 * @param polygon - GeoJSON polygon feature
 * @param paddingFactor - Extra padding (default 1.5)
 * @returns Distance in meters
 */
export function calculateViewDistance(
  polygon: GeoJSON.Feature<GeoJSON.Polygon>,
  paddingFactor: number = 1.5
): number {
  const bbox = getPolygonBbox(polygon);
  const center = getPolygonCenter(polygon);
  
  // Convert bbox corners to local meters
  const [minX, minY] = geoToLocal(bbox[0], bbox[1], center[0], center[1]);
  const [maxX, maxY] = geoToLocal(bbox[2], bbox[3], center[0], center[1]);
  
  // Calculate diagonal
  const width = maxX - minX;
  const height = maxY - minY;
  const diagonal = Math.sqrt(width * width + height * height);
  
  return diagonal * paddingFactor;
}

/**
 * Format coordinates for display
 * 
 * @param lng - Longitude
 * @param lat - Latitude
 * @param precision - Decimal places (default 6)
 * @returns Formatted string like "28.123456, -80.654321"
 */
export function formatCoordinates(
  lng: number,
  lat: number,
  precision: number = 6
): string {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

/**
 * Parse a coordinate string back to numbers
 * Accepts formats: "lat, lng" or "lat,lng" or "lat lng"
 * 
 * @param coordString - Coordinate string
 * @returns [lng, lat] or null if invalid
 */
export function parseCoordinates(
  coordString: string
): [number, number] | null {
  const cleaned = coordString.replace(/[,\s]+/g, ' ').trim();
  const parts = cleaned.split(' ');
  
  if (parts.length !== 2) return null;
  
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;
  
  return [lng, lat];
}

/**
 * Calculate bearing between two points
 * 
 * @param from - Starting point [lng, lat]
 * @param to - Ending point [lng, lat]
 * @returns Bearing in degrees (0-360, 0 = North)
 */
export function calculateBearing(
  from: [number, number],
  to: [number, number]
): number {
  const point1 = turf.point(from);
  const point2 = turf.point(to);
  return turf.bearing(point1, point2);
}

/**
 * Calculate distance between two points
 * 
 * @param from - Starting point [lng, lat]
 * @param to - Ending point [lng, lat]
 * @param units - Distance units (default 'feet')
 * @returns Distance in specified units
 */
export function calculateDistance(
  from: [number, number],
  to: [number, number],
  units: 'feet' | 'meters' | 'miles' | 'kilometers' = 'feet'
): number {
  const point1 = turf.point(from);
  const point2 = turf.point(to);
  return turf.distance(point1, point2, { units });
}
