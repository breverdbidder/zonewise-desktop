/**
 * ZoneWise.AI Sun Analysis Module
 * 
 * Sun position calculations, shadow analysis, and sun hours computation
 * using SunCalc library for accurate solar positioning.
 * 
 * @module sun-analysis
 * @version 1.0.0
 */

import SunCalc from 'suncalc';
import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

/**
 * Sun position in the sky
 */
export interface SunPosition {
  /** Azimuth angle in radians (direction from north, clockwise) */
  azimuth: number;
  /** Altitude angle in radians (height above horizon) */
  altitude: number;
  /** Azimuth in degrees (0-360, 0=North, 90=East) */
  azimuthDeg: number;
  /** Altitude in degrees (-90 to 90, 0=horizon) */
  altitudeDeg: number;
  /** Whether sun is above horizon */
  isDay: boolean;
  /** Time of calculation */
  time: Date;
}

/**
 * Sun times for a specific day
 */
export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dawn: Date;
  dusk: Date;
  goldenHour: Date;
  goldenHourEnd: Date;
  nightStart: Date;
  nightEnd: Date;
}

/**
 * Sun path point for visualization
 */
export interface SunPathPoint {
  time: Date;
  position: SunPosition;
  /** 3D position for visualization [x, y, z] */
  vector3: [number, number, number];
}

/**
 * Shadow analysis result for a point
 */
export interface ShadowAnalysisPoint {
  /** Grid position [x, z] in meters */
  position: [number, number];
  /** Hours of direct sunlight (0-24) */
  sunHours: number;
  /** Percentage of day with sun (0-100) */
  sunPercentage: number;
  /** Shadow intensity (0=full sun, 1=full shadow) */
  shadowIntensity: number;
}

/**
 * Full shadow analysis result
 */
export interface ShadowAnalysisResult {
  /** Date of analysis */
  date: Date;
  /** Location [lng, lat] */
  location: [number, number];
  /** Grid of shadow analysis points */
  grid: ShadowAnalysisPoint[][];
  /** Grid resolution in meters */
  resolution: number;
  /** Total analyzable hours (sunrise to sunset) */
  daylightHours: number;
  /** Average sun hours across grid */
  averageSunHours: number;
}

/**
 * Configuration for shadow analysis
 */
export interface ShadowAnalysisConfig {
  /** Date for analysis */
  date: Date;
  /** Location [longitude, latitude] */
  location: [number, number];
  /** Analysis grid size in meters */
  gridSize: number;
  /** Grid resolution in meters (smaller = more detail) */
  resolution: number;
  /** Time step for analysis in minutes */
  timeStepMinutes: number;
  /** Building/envelope geometry for shadow casting */
  geometry?: THREE.BufferGeometry;
  /** Maximum height to analyze */
  maxHeight?: number;
}

// ============================================================================
// Sun Position Calculations
// ============================================================================

/**
 * Calculate sun position for a specific time and location
 * 
 * @param date - Date and time for calculation
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Sun position with azimuth and altitude
 * 
 * @example
 * ```typescript
 * const pos = calculateSunPosition(new Date(), 28.004, -80.5687);
 * console.log(`Sun altitude: ${pos.altitudeDeg}°`);
 * ```
 */
export function calculateSunPosition(
  date: Date,
  latitude: number,
  longitude: number
): SunPosition {
  const sunPos = SunCalc.getPosition(date, latitude, longitude);
  
  // Convert azimuth from south-based to north-based
  // SunCalc returns azimuth from south, we want from north
  let azimuthFromNorth = sunPos.azimuth + Math.PI;
  if (azimuthFromNorth > 2 * Math.PI) {
    azimuthFromNorth -= 2 * Math.PI;
  }
  
  return {
    azimuth: azimuthFromNorth,
    altitude: sunPos.altitude,
    azimuthDeg: (azimuthFromNorth * 180) / Math.PI,
    altitudeDeg: (sunPos.altitude * 180) / Math.PI,
    isDay: sunPos.altitude > 0,
    time: date
  };
}

/**
 * Get sun times (sunrise, sunset, etc.) for a specific date and location
 * 
 * @param date - Date for calculation
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Object with various sun times
 */
export function getSunTimes(
  date: Date,
  latitude: number,
  longitude: number
): SunTimes {
  const times = SunCalc.getTimes(date, latitude, longitude);
  
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
    dawn: times.dawn,
    dusk: times.dusk,
    goldenHour: times.goldenHour,
    goldenHourEnd: times.goldenHourEnd,
    nightStart: times.night,
    nightEnd: times.nightEnd
  };
}

/**
 * Calculate daylight hours for a specific date and location
 * 
 * @param date - Date for calculation
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Number of daylight hours
 */
export function getDaylightHours(
  date: Date,
  latitude: number,
  longitude: number
): number {
  const times = getSunTimes(date, latitude, longitude);
  const daylightMs = times.sunset.getTime() - times.sunrise.getTime();
  return daylightMs / (1000 * 60 * 60); // Convert to hours
}

// ============================================================================
// Sun Path Generation
// ============================================================================

/**
 * Generate sun path for visualization (arc across sky)
 * 
 * @param date - Date for the sun path
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @param intervalMinutes - Time interval between points (default: 30)
 * @param radius - Radius of the sun path arc in meters (default: 50)
 * @returns Array of sun path points
 */
export function generateSunPath(
  date: Date,
  latitude: number,
  longitude: number,
  intervalMinutes: number = 30,
  radius: number = 50
): SunPathPoint[] {
  const times = getSunTimes(date, latitude, longitude);
  const path: SunPathPoint[] = [];
  
  // Start from sunrise, end at sunset
  const startTime = times.sunrise.getTime();
  const endTime = times.sunset.getTime();
  const intervalMs = intervalMinutes * 60 * 1000;
  
  for (let time = startTime; time <= endTime; time += intervalMs) {
    const currentDate = new Date(time);
    const position = calculateSunPosition(currentDate, latitude, longitude);
    
    // Convert spherical to Cartesian for 3D visualization
    // Y is up in Three.js
    const x = radius * Math.cos(position.altitude) * Math.sin(position.azimuth);
    const y = radius * Math.sin(position.altitude);
    const z = -radius * Math.cos(position.altitude) * Math.cos(position.azimuth);
    
    path.push({
      time: currentDate,
      position,
      vector3: [x, y, z]
    });
  }
  
  return path;
}

/**
 * Generate annual sun paths for solstices and equinoxes
 * 
 * @param year - Year for calculation
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Object with paths for key dates
 */
export function generateAnnualSunPaths(
  year: number,
  latitude: number,
  longitude: number
): {
  summerSolstice: SunPathPoint[];
  winterSolstice: SunPathPoint[];
  springEquinox: SunPathPoint[];
  fallEquinox: SunPathPoint[];
} {
  return {
    summerSolstice: generateSunPath(new Date(year, 5, 21), latitude, longitude),
    winterSolstice: generateSunPath(new Date(year, 11, 21), latitude, longitude),
    springEquinox: generateSunPath(new Date(year, 2, 20), latitude, longitude),
    fallEquinox: generateSunPath(new Date(year, 8, 22), latitude, longitude)
  };
}

// ============================================================================
// Three.js Light Helpers
// ============================================================================

/**
 * Create a Three.js DirectionalLight positioned at the sun's location
 * 
 * @param position - Sun position
 * @param intensity - Light intensity (default: 1)
 * @param distance - Distance from origin (default: 100)
 * @returns Three.js DirectionalLight
 */
export function createSunLight(
  position: SunPosition,
  intensity: number = 1,
  distance: number = 100
): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  
  // Calculate light position from sun position
  const x = distance * Math.cos(position.altitude) * Math.sin(position.azimuth);
  const y = distance * Math.sin(position.altitude);
  const z = -distance * Math.cos(position.altitude) * Math.cos(position.azimuth);
  
  light.position.set(x, y, z);
  light.castShadow = true;
  
  // Configure shadow properties
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = distance * 2;
  light.shadow.camera.left = -50;
  light.shadow.camera.right = 50;
  light.shadow.camera.top = 50;
  light.shadow.camera.bottom = -50;
  
  return light;
}

/**
 * Update an existing DirectionalLight to match sun position
 * 
 * @param light - Existing DirectionalLight
 * @param position - New sun position
 * @param distance - Distance from origin (default: 100)
 */
export function updateSunLight(
  light: THREE.DirectionalLight,
  position: SunPosition,
  distance: number = 100
): void {
  const x = distance * Math.cos(position.altitude) * Math.sin(position.azimuth);
  const y = distance * Math.sin(position.altitude);
  const z = -distance * Math.cos(position.altitude) * Math.cos(position.azimuth);
  
  light.position.set(x, y, z);
  
  // Adjust intensity based on altitude (dimmer near horizon)
  const altitudeFactor = Math.max(0, Math.sin(position.altitude));
  light.intensity = altitudeFactor;
}

/**
 * Get sun color based on altitude (orange at horizon, white at zenith)
 * 
 * @param altitude - Sun altitude in radians
 * @returns THREE.Color
 */
export function getSunColor(altitude: number): THREE.Color {
  const altitudeDeg = (altitude * 180) / Math.PI;
  
  if (altitudeDeg < 0) {
    // Below horizon - dark blue
    return new THREE.Color(0x1a1a2e);
  } else if (altitudeDeg < 10) {
    // Golden hour - warm orange
    const t = altitudeDeg / 10;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xff6b35),
      new THREE.Color(0xffd700),
      t
    );
  } else if (altitudeDeg < 30) {
    // Morning/evening - yellow to white
    const t = (altitudeDeg - 10) / 20;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xffd700),
      new THREE.Color(0xffffff),
      t
    );
  }
  
  // Midday - white
  return new THREE.Color(0xffffff);
}

// ============================================================================
// Shadow Analysis (TODO 5.3)
// ============================================================================

/**
 * Perform shadow analysis using raycasting
 * Analyzes sun hours across a grid for a specific date
 * 
 * @param config - Shadow analysis configuration
 * @param meshes - Array of Three.js meshes that cast shadows
 * @returns Shadow analysis result with sun hours grid
 */
export function analyzeShadows(
  config: ShadowAnalysisConfig,
  meshes: THREE.Mesh[]
): ShadowAnalysisResult {
  const {
    date,
    location,
    gridSize,
    resolution,
    timeStepMinutes
  } = config;
  
  const [longitude, latitude] = location;
  const times = getSunTimes(date, latitude, longitude);
  const daylightHours = getDaylightHours(date, latitude, longitude);
  
  // Create raycaster
  const raycaster = new THREE.Raycaster();
  
  // Calculate grid dimensions
  const gridCells = Math.ceil(gridSize / resolution);
  const halfGrid = gridSize / 2;
  
  // Initialize grid
  const grid: ShadowAnalysisPoint[][] = [];
  
  // Create time samples through the day
  const startTime = times.sunrise.getTime();
  const endTime = times.sunset.getTime();
  const timeStep = timeStepMinutes * 60 * 1000;
  const timeSamples: Date[] = [];
  
  for (let t = startTime; t <= endTime; t += timeStep) {
    timeSamples.push(new Date(t));
  }
  
  // Analyze each grid cell
  for (let i = 0; i < gridCells; i++) {
    grid[i] = [];
    const x = -halfGrid + (i + 0.5) * resolution;
    
    for (let j = 0; j < gridCells; j++) {
      const z = -halfGrid + (j + 0.5) * resolution;
      
      // Count sun hours at this point
      let sunSamples = 0;
      
      for (const time of timeSamples) {
        const sunPos = calculateSunPosition(time, latitude, longitude);
        
        // Skip if sun is below horizon
        if (!sunPos.isDay) continue;
        
        // Calculate ray direction from point to sun
        const sunDirection = new THREE.Vector3(
          Math.cos(sunPos.altitude) * Math.sin(sunPos.azimuth),
          Math.sin(sunPos.altitude),
          -Math.cos(sunPos.altitude) * Math.cos(sunPos.azimuth)
        ).normalize();
        
        // Set ray origin at ground level + small offset
        const origin = new THREE.Vector3(x, 0.1, z);
        
        raycaster.set(origin, sunDirection);
        
        // Check for intersections with meshes
        const intersections = raycaster.intersectObjects(meshes, true);
        
        // If no intersections, point is in sun
        if (intersections.length === 0) {
          sunSamples++;
        }
      }
      
      const sunHours = (sunSamples / timeSamples.length) * daylightHours;
      const sunPercentage = (sunSamples / timeSamples.length) * 100;
      
      grid[i][j] = {
        position: [x, z],
        sunHours,
        sunPercentage,
        shadowIntensity: 1 - (sunSamples / timeSamples.length)
      };
    }
  }
  
  // Calculate average sun hours
  let totalSunHours = 0;
  let cellCount = 0;
  
  for (const row of grid) {
    for (const cell of row) {
      totalSunHours += cell.sunHours;
      cellCount++;
    }
  }
  
  return {
    date,
    location,
    grid,
    resolution,
    daylightHours,
    averageSunHours: totalSunHours / cellCount
  };
}

// ============================================================================
// Sun Hours Heatmap (TODO 5.4)
// ============================================================================

/**
 * Generate a color for sun hours heatmap
 * 
 * @param sunHours - Number of sun hours (0-12+)
 * @param maxHours - Maximum possible hours (for normalization)
 * @returns Hex color string
 */
export function getSunHoursColor(sunHours: number, maxHours: number = 12): string {
  const normalized = Math.min(sunHours / maxHours, 1);
  
  // Color gradient: dark purple (shadow) -> yellow (partial) -> bright yellow (full sun)
  if (normalized < 0.25) {
    // Heavy shadow: dark purple to blue
    const t = normalized / 0.25;
    const r = Math.round(48 + t * 20);
    const g = Math.round(25 + t * 50);
    const b = Math.round(100 + t * 50);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else if (normalized < 0.5) {
    // Partial shadow: blue to green
    const t = (normalized - 0.25) / 0.25;
    const r = Math.round(68 + t * 50);
    const g = Math.round(75 + t * 100);
    const b = Math.round(150 - t * 50);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else if (normalized < 0.75) {
    // Partial sun: green to yellow
    const t = (normalized - 0.5) / 0.25;
    const r = Math.round(118 + t * 137);
    const g = Math.round(175 + t * 80);
    const b = Math.round(100 - t * 100);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else {
    // Full sun: yellow to bright yellow
    const t = (normalized - 0.75) / 0.25;
    const r = 255;
    const g = 255;
    const b = Math.round(t * 100);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

/**
 * Create a Three.js heatmap mesh from shadow analysis
 * 
 * @param analysis - Shadow analysis result
 * @param height - Height of the heatmap plane (default: 0.1)
 * @returns Three.js Mesh with colored vertices
 */
export function createSunHoursHeatmap(
  analysis: ShadowAnalysisResult,
  height: number = 0.1
): THREE.Mesh {
  const { grid, resolution } = analysis;
  const gridCells = grid.length;
  
  // Create plane geometry
  const geometry = new THREE.PlaneGeometry(
    gridCells * resolution,
    gridCells * resolution,
    gridCells - 1,
    gridCells - 1
  );
  
  // Rotate to horizontal
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, height, 0);
  
  // Apply vertex colors based on sun hours
  const colors: number[] = [];
  const positionAttr = geometry.getAttribute('position');
  
  for (let i = 0; i < gridCells; i++) {
    for (let j = 0; j < gridCells; j++) {
      const cell = grid[i][j];
      const colorHex = getSunHoursColor(cell.sunHours, analysis.daylightHours);
      const color = new THREE.Color(colorHex);
      colors.push(color.r, color.g, color.b);
    }
  }
  
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
  // Create material with vertex colors
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  
  return new THREE.Mesh(geometry, material);
}

// ============================================================================
// Animation Helpers (TODO 5.6)
// ============================================================================

/**
 * Animation state for sun movement
 */
export interface SunAnimationState {
  /** Current time in animation */
  currentTime: Date;
  /** Start time (sunrise) */
  startTime: Date;
  /** End time (sunset) */
  endTime: Date;
  /** Animation speed multiplier */
  speed: number;
  /** Whether animation is playing */
  isPlaying: boolean;
  /** Loop animation */
  loop: boolean;
}

/**
 * Create initial animation state for a date
 */
export function createSunAnimationState(
  date: Date,
  latitude: number,
  longitude: number,
  speed: number = 1
): SunAnimationState {
  const times = getSunTimes(date, latitude, longitude);
  
  return {
    currentTime: times.sunrise,
    startTime: times.sunrise,
    endTime: times.sunset,
    speed,
    isPlaying: false,
    loop: true
  };
}

/**
 * Update animation state (call in animation frame)
 * 
 * @param state - Current animation state
 * @param deltaMs - Time since last frame in milliseconds
 * @returns Updated animation state
 */
export function updateSunAnimation(
  state: SunAnimationState,
  deltaMs: number
): SunAnimationState {
  if (!state.isPlaying) return state;
  
  // Speed of 1 = real time, speed of 60 = 1 minute per second
  const timeAdvance = deltaMs * state.speed * 60; // Convert to minutes of sun time
  
  let newTime = new Date(state.currentTime.getTime() + timeAdvance);
  
  // Check if past end
  if (newTime >= state.endTime) {
    if (state.loop) {
      newTime = state.startTime;
    } else {
      newTime = state.endTime;
      return { ...state, currentTime: newTime, isPlaying: false };
    }
  }
  
  return { ...state, currentTime: newTime };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format time for display (HH:MM AM/PM)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format sun position for display
 */
export function formatSunPosition(position: SunPosition): string {
  const direction = getCompassDirection(position.azimuthDeg);
  return `${direction} ${position.azimuthDeg.toFixed(1)}° | Alt: ${position.altitudeDeg.toFixed(1)}°`;
}

/**
 * Get compass direction from azimuth
 */
export function getCompassDirection(azimuthDeg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(azimuthDeg / 22.5) % 16;
  return directions[index];
}

/**
 * Check if a date is during daylight saving time
 */
export function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  return date.getTimezoneOffset() < stdOffset;
}
