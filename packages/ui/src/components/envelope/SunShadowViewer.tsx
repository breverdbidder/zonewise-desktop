/**
 * ZoneWise.AI Sun Shadow Viewer Component
 * 
 * 3D visualization with real-time sun position and shadow casting.
 * Includes date/time picker, sun path visualization, and shadow animation.
 * 
 * @module SunShadowViewer
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Line,
  Sphere,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import * as turf from '@turf/turf';

import { 
  generateBuildingEnvelope, 
  ZoningDIMS, 
  EnvelopeResult 
} from '../../lib/envelope-generator';
import {
  calculateSunPosition,
  getSunTimes,
  generateSunPath,
  createSunLight,
  updateSunLight,
  getSunColor,
  formatTime,
  formatSunPosition,
  getDaylightHours,
  SunPosition,
  SunPathPoint,
  SunAnimationState,
  createSunAnimationState,
  updateSunAnimation
} from '../../lib/sun-analysis';

// ============================================================================
// Types
// ============================================================================

export interface SunShadowViewerProps {
  /** GeoJSON polygon representing the lot boundary */
  lotPolygon: GeoJSON.Feature<GeoJSON.Polygon>;
  /** Zoning Development Intensity Metrics */
  dims: ZoningDIMS;
  /** Initial date for sun analysis (default: today) */
  initialDate?: Date;
  /** Location [longitude, latitude] */
  location?: [number, number];
  /** Show sun path arc (default: true) */
  showSunPath?: boolean;
  /** Show shadow analysis (default: true) */
  showShadows?: boolean;
  /** Envelope color (default: '#4A90D9') */
  envelopeColor?: string;
  /** Callback when envelope is calculated */
  onEnvelopeCalculated?: (result: EnvelopeResult) => void;
  /** Container className */
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Animated Sun Light
 */
function AnimatedSunLight({ 
  sunPosition, 
  isPlaying 
}: { 
  sunPosition: SunPosition;
  isPlaying: boolean;
}) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  
  useEffect(() => {
    if (lightRef.current) {
      updateSunLight(lightRef.current, sunPosition, 100);
    }
  }, [sunPosition]);
  
  const color = useMemo(() => getSunColor(sunPosition.altitude), [sunPosition.altitude]);
  
  return (
    <directionalLight
      ref={lightRef}
      color={color}
      intensity={Math.max(0, Math.sin(sunPosition.altitude))}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.5}
      shadow-camera-far={200}
      shadow-camera-left={-50}
      shadow-camera-right={50}
      shadow-camera-top={50}
      shadow-camera-bottom={-50}
    />
  );
}

/**
 * Sun Position Indicator (sphere showing sun location)
 */
function SunIndicator({ 
  sunPosition, 
  distance = 80 
}: { 
  sunPosition: SunPosition;
  distance?: number;
}) {
  const position = useMemo(() => {
    const x = distance * Math.cos(sunPosition.altitude) * Math.sin(sunPosition.azimuth);
    const y = distance * Math.sin(sunPosition.altitude);
    const z = -distance * Math.cos(sunPosition.altitude) * Math.cos(sunPosition.azimuth);
    return [x, y, z] as [number, number, number];
  }, [sunPosition, distance]);
  
  const color = useMemo(() => getSunColor(sunPosition.altitude), [sunPosition.altitude]);
  
  if (!sunPosition.isDay) return null;
  
  return (
    <Sphere args={[3, 32, 32]} position={position}>
      <meshBasicMaterial color={color} />
    </Sphere>
  );
}

/**
 * Sun Path Arc Visualization
 */
function SunPathArc({ 
  sunPath, 
  color = '#FFA500' 
}: { 
  sunPath: SunPathPoint[];
  color?: string;
}) {
  const points = useMemo(() => 
    sunPath.map(p => new THREE.Vector3(...p.vector3)),
    [sunPath]
  );
  
  if (points.length < 2) return null;
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      dashed={false}
    />
  );
}

/**
 * Hour Markers on Sun Path
 */
function HourMarkers({ 
  sunPath 
}: { 
  sunPath: SunPathPoint[];
}) {
  // Show markers every 2 hours
  const markers = useMemo(() => {
    return sunPath.filter((_, i) => i % 4 === 0); // Every 2 hours (30min intervals)
  }, [sunPath]);
  
  return (
    <group>
      {markers.map((point, i) => (
        <group key={i} position={point.vector3}>
          <Sphere args={[0.8, 16, 16]}>
            <meshBasicMaterial color="#FFD700" />
          </Sphere>
          <Html center style={{ pointerEvents: 'none' }}>
            <div className="bg-black/70 text-white text-xs px-1 rounded whitespace-nowrap">
              {formatTime(point.time)}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

/**
 * 3D Envelope with Shadows
 */
function EnvelopeMesh({ 
  geometry, 
  color 
}: { 
  geometry: THREE.BufferGeometry;
  color: string;
}) {
  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      <lineSegments geometry={new THREE.EdgesGeometry(geometry)}>
        <lineBasicMaterial color="#1a365d" />
      </lineSegments>
    </group>
  );
}

/**
 * Ground Plane with Shadow Reception
 */
function GroundPlane() {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.1, 0]}
      receiveShadow
    >
      <planeGeometry args={[200, 200]} />
      <shadowMaterial opacity={0.4} />
    </mesh>
  );
}

/**
 * Ground Grid
 */
function GroundGrid() {
  return (
    <gridHelper 
      args={[100, 20, '#444', '#333']} 
      position={[0, 0.01, 0]}
    />
  );
}

/**
 * Compass Rose
 */
function CompassRose() {
  return (
    <group position={[0, 0.1, 0]}>
      {/* North */}
      <Html position={[0, 0, -55]} center>
        <div className="text-red-500 font-bold text-lg">N</div>
      </Html>
      {/* South */}
      <Html position={[0, 0, 55]} center>
        <div className="text-gray-400 text-sm">S</div>
      </Html>
      {/* East */}
      <Html position={[55, 0, 0]} center>
        <div className="text-gray-400 text-sm">E</div>
      </Html>
      {/* West */}
      <Html position={[-55, 0, 0]} center>
        <div className="text-gray-400 text-sm">W</div>
      </Html>
    </group>
  );
}

// ============================================================================
// Main Scene Component
// ============================================================================

function SunShadowScene({
  envelope,
  sunPosition,
  sunPath,
  showSunPath,
  showShadows,
  envelopeColor,
  isPlaying
}: {
  envelope: EnvelopeResult;
  sunPosition: SunPosition;
  sunPath: SunPathPoint[];
  showSunPath: boolean;
  showShadows: boolean;
  envelopeColor: string;
  isPlaying: boolean;
}) {
  const { gl } = useThree();
  
  // Enable shadows
  useEffect(() => {
    gl.shadowMap.enabled = showShadows;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl, showShadows]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <AnimatedSunLight sunPosition={sunPosition} isPlaying={isPlaying} />
      
      {/* Sun indicator */}
      <SunIndicator sunPosition={sunPosition} />
      
      {/* Sun path */}
      {showSunPath && (
        <>
          <SunPathArc sunPath={sunPath} />
          <HourMarkers sunPath={sunPath} />
        </>
      )}
      
      {/* Ground */}
      <GroundPlane />
      <GroundGrid />
      <CompassRose />
      
      {/* Envelope */}
      <EnvelopeMesh geometry={envelope.geometry} color={envelopeColor} />
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * SunShadowViewer - 3D Envelope with Sun/Shadow Analysis
 */
export function SunShadowViewer({
  lotPolygon,
  dims,
  initialDate,
  location,
  showSunPath = true,
  showShadows = true,
  envelopeColor = '#4A90D9',
  onEnvelopeCalculated,
  className = ''
}: SunShadowViewerProps) {
  
  // Default location (Malabar, FL)
  const defaultLocation: [number, number] = location || [-80.5687, 28.004];
  const [lng, lat] = defaultLocation;
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(initialDate || new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(60); // 60x = 1 hour per minute
  const animationRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(Date.now());
  
  // Generate envelope
  const envelope = useMemo(() => {
    const result = generateBuildingEnvelope(
      lotPolygon as turf.Feature<turf.Polygon>,
      dims
    );
    onEnvelopeCalculated?.(result);
    return result;
  }, [lotPolygon, dims, onEnvelopeCalculated]);
  
  // Calculate sun position for current time
  const sunPosition = useMemo(() => {
    return calculateSunPosition(selectedTime, lat, lng);
  }, [selectedTime, lat, lng]);
  
  // Get sun times for selected date
  const sunTimes = useMemo(() => {
    return getSunTimes(selectedDate, lat, lng);
  }, [selectedDate, lat, lng]);
  
  // Generate sun path for selected date
  const sunPath = useMemo(() => {
    return generateSunPath(selectedDate, lat, lng, 30, 80);
  }, [selectedDate, lat, lng]);
  
  // Daylight hours
  const daylightHours = useMemo(() => {
    return getDaylightHours(selectedDate, lat, lng);
  }, [selectedDate, lat, lng]);
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    const animate = () => {
      const now = Date.now();
      const deltaMs = now - lastFrameTime.current;
      lastFrameTime.current = now;
      
      // Advance time
      const timeAdvanceMs = deltaMs * animationSpeed * 60; // minutes to ms
      const newTime = new Date(selectedTime.getTime() + timeAdvanceMs);
      
      // Check bounds
      if (newTime >= sunTimes.sunset) {
        setSelectedTime(sunTimes.sunrise);
      } else if (newTime <= sunTimes.sunrise) {
        setSelectedTime(sunTimes.sunrise);
      } else {
        setSelectedTime(newTime);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    lastFrameTime.current = Date.now();
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animationSpeed, sunTimes, selectedTime]);
  
  // Handle date change
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    // Reset time to noon of new date
    const noon = new Date(newDate);
    noon.setHours(12, 0, 0, 0);
    setSelectedTime(noon);
  }, []);
  
  // Handle time slider change
  const handleTimeSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value);
    const newTime = new Date(sunTimes.sunrise.getTime() + minutes * 60 * 1000);
    setSelectedTime(newTime);
  }, [sunTimes.sunrise]);
  
  // Calculate current time position for slider
  const timeSliderValue = useMemo(() => {
    const minutesFromSunrise = (selectedTime.getTime() - sunTimes.sunrise.getTime()) / (60 * 1000);
    return Math.max(0, Math.min(minutesFromSunrise, daylightHours * 60));
  }, [selectedTime, sunTimes.sunrise, daylightHours]);
  
  // Quick time buttons
  const quickTimes = useMemo(() => [
    { label: 'Sunrise', time: sunTimes.sunrise },
    { label: '9 AM', time: new Date(new Date(selectedDate).setHours(9, 0, 0, 0)) },
    { label: 'Noon', time: new Date(new Date(selectedDate).setHours(12, 0, 0, 0)) },
    { label: '3 PM', time: new Date(new Date(selectedDate).setHours(15, 0, 0, 0)) },
    { label: 'Sunset', time: sunTimes.sunset },
  ], [sunTimes, selectedDate]);
  
  return (
    <div className={`w-full h-[700px] bg-gray-900 rounded-lg overflow-hidden relative ${className}`}>
      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[60, 50, 60]} fov={50} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={20}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2.1}
        />
        
        <SunShadowScene
          envelope={envelope}
          sunPosition={sunPosition}
          sunPath={sunPath}
          showSunPath={showSunPath}
          showShadows={showShadows}
          envelopeColor={envelopeColor}
          isPlaying={isPlaying}
        />
        
        <Environment preset="sunset" />
      </Canvas>
      
      {/* Date/Time Controls */}
      <div className="absolute top-4 left-4 bg-black/85 text-white p-4 rounded-lg w-80 space-y-4">
        <h3 className="font-bold text-lg text-yellow-400 flex items-center gap-2">
          ☀️ Sun Analysis
        </h3>
        
        {/* Date Picker */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
          />
        </div>
        
        {/* Time Slider */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Time: <span className="text-white font-mono">{formatTime(selectedTime)}</span>
          </label>
          <input
            type="range"
            min="0"
            max={daylightHours * 60}
            step="5"
            value={timeSliderValue}
            onChange={handleTimeSlider}
            className="w-full"
            disabled={isPlaying}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(sunTimes.sunrise)}</span>
            <span>{formatTime(sunTimes.sunset)}</span>
          </div>
        </div>
        
        {/* Quick Time Buttons */}
        <div className="flex flex-wrap gap-1">
          {quickTimes.map(({ label, time }) => (
            <button
              key={label}
              onClick={() => setSelectedTime(time)}
              disabled={isPlaying}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Animation Controls */}
        <div className="border-t border-gray-700 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded font-medium ${
                isPlaying 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? '⏸ Pause' : '▶️ Animate'}
            </button>
            <select
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm"
            >
              <option value="30">30x</option>
              <option value="60">60x</option>
              <option value="120">120x</option>
              <option value="240">240x</option>
            </select>
          </div>
          <p className="text-xs text-gray-500">
            {animationSpeed}x = 1 hour per {Math.round(60/animationSpeed)} seconds
          </p>
        </div>
      </div>
      
      {/* Sun Info Panel */}
      <div className="absolute top-4 right-4 bg-black/85 text-white p-4 rounded-lg w-64">
        <h4 className="font-semibold text-sm text-gray-400 mb-2">Sun Position</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Azimuth:</span>
            <span className="font-mono">{sunPosition.azimuthDeg.toFixed(1)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Altitude:</span>
            <span className="font-mono">{sunPosition.altitudeDeg.toFixed(1)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className={sunPosition.isDay ? 'text-yellow-400' : 'text-blue-400'}>
              {sunPosition.isDay ? '☀️ Daylight' : '🌙 Night'}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-3 pt-3">
          <h4 className="font-semibold text-sm text-gray-400 mb-2">Day Info</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Sunrise:</span>
              <span className="font-mono">{formatTime(sunTimes.sunrise)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sunset:</span>
              <span className="font-mono">{formatTime(sunTimes.sunset)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Daylight:</span>
              <span className="font-mono">{daylightHours.toFixed(1)} hrs</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Zoning Info */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-sm">
        <span className="text-blue-400 font-semibold">{dims.district_code}</span>
        <span className="text-gray-400 ml-2">• Max {dims.max_height_ft}ft</span>
      </div>
      
      {/* Controls Hint */}
      <div className="absolute bottom-4 right-4 bg-black/60 text-gray-400 px-2 py-1 rounded text-xs">
        🖱️ Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}

export default SunShadowViewer;
