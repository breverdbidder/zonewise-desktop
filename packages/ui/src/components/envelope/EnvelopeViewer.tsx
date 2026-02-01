/**
 * ZoneWise.AI Envelope Viewer Component
 * 
 * 3D visualization of building envelopes using React Three Fiber.
 * Displays lot boundary, setback area, and maximum buildable envelope.
 * 
 * @module EnvelopeViewer
 * @version 1.0.0
 */

import React, { useMemo, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Grid,
  Line
} from '@react-three/drei';
import * as THREE from 'three';
import * as turf from '@turf/turf';
import { 
  generateBuildingEnvelope, 
  ZoningDIMS, 
  EnvelopeResult 
} from '../../lib/envelope-generator';
import { geoToLocal } from '../../lib/geo-utils';

// ============================================================================
// Types
// ============================================================================

export interface EnvelopeViewerProps {
  /** GeoJSON polygon representing the lot boundary */
  lotPolygon: GeoJSON.Feature<GeoJSON.Polygon>;
  /** Zoning Development Intensity Metrics */
  dims: ZoningDIMS;
  /** Show dashed setback lines (default: true) */
  showSetbackLines?: boolean;
  /** Show transparent height plane (default: true) */
  showHeightPlane?: boolean;
  /** Show grid on ground (default: true) */
  showGrid?: boolean;
  /** Envelope color (default: '#4A90D9') */
  envelopeColor?: string;
  /** Envelope opacity 0-1 (default: 0.7) */
  envelopeOpacity?: number;
  /** Callback when envelope is calculated */
  onEnvelopeCalculated?: (result: EnvelopeResult) => void;
  /** Container className */
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * 3D Envelope Mesh
 */
function EnvelopeMesh({ 
  geometry, 
  color = '#4A90D9', 
  opacity = 0.7 
}: { 
  geometry: THREE.BufferGeometry;
  color?: string;
  opacity?: number;
}) {
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
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

/**
 * Envelope Wireframe Overlay
 */
function EnvelopeWireframe({ geometry }: { geometry: THREE.BufferGeometry }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  
  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial color="#1a365d" linewidth={1} />
    </lineSegments>
  );
}

/**
 * Lot Boundary Line (red)
 */
function LotBoundary({ 
  polygon,
  center,
  color = '#FF6B6B'
}: { 
  polygon: GeoJSON.Feature<GeoJSON.Polygon>;
  center: [number, number];
  color?: string;
}) {
  const points = useMemo(() => {
    const coords = polygon.geometry.coordinates[0];
    const [centerLng, centerLat] = center;
    
    return coords.map(coord => {
      const [x, y] = geoToLocal(coord[0], coord[1], centerLng, centerLat);
      return new THREE.Vector3(x, 0.1, -y); // Y-up, Z = -North
    });
  }, [polygon, center]);
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={3}
    />
  );
}

/**
 * Setback Area Boundary (green dashed)
 */
function SetbackArea({ 
  polygon,
  center,
  color = '#4ADE80'
}: { 
  polygon: turf.Feature<turf.Polygon>;
  center: [number, number];
  color?: string;
}) {
  const points = useMemo(() => {
    const coords = polygon.geometry.coordinates[0];
    const [centerLng, centerLat] = center;
    
    return coords.map(coord => {
      const [x, y] = geoToLocal(coord[0], coord[1], centerLng, centerLat);
      return new THREE.Vector3(x, 0.2, -y);
    });
  }, [polygon, center]);
  
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

/**
 * Maximum Height Plane (transparent green)
 */
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

/**
 * Ground Plane
 */
function Ground() {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.1, 0]}
      receiveShadow
    >
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#1a1a2e" />
    </mesh>
  );
}

/**
 * Scene Lighting
 */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[20, 40, 20]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-20, 20, -20]} intensity={0.3} />
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * EnvelopeViewer - 3D Building Envelope Visualization
 * 
 * Renders an interactive 3D view of the maximum buildable envelope
 * based on lot polygon and zoning regulations.
 * 
 * @example
 * ```tsx
 * <EnvelopeViewer
 *   lotPolygon={myLot}
 *   dims={zoningDims}
 *   onEnvelopeCalculated={(result) => console.log(result)}
 * />
 * ```
 */
export function EnvelopeViewer({
  lotPolygon,
  dims,
  showSetbackLines = true,
  showHeightPlane = true,
  showGrid = true,
  envelopeColor = '#4A90D9',
  envelopeOpacity = 0.7,
  onEnvelopeCalculated,
  className = ''
}: EnvelopeViewerProps) {
  
  // Generate envelope on lot/dims change
  const envelope = useMemo(() => {
    const result = generateBuildingEnvelope(
      lotPolygon as turf.Feature<turf.Polygon>, 
      dims
    );
    onEnvelopeCalculated?.(result);
    return result;
  }, [lotPolygon, dims, onEnvelopeCalculated]);
  
  // Format numbers with commas
  const formatNumber = useCallback((n: number) => n.toLocaleString(), []);
  
  return (
    <div className={`w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden relative ${className}`}>
      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[50, 40, 50]} fov={50} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={200}
          maxPolarAngle={Math.PI / 2.1}
        />
        
        <Lighting />
        <Ground />
        
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
        
        {/* Lot Boundary (red) */}
        <LotBoundary polygon={lotPolygon} center={envelope.center} />
        
        {/* Setback Area (green dashed) */}
        {showSetbackLines && (
          <SetbackArea polygon={envelope.setbackPolygon} center={envelope.center} />
        )}
        
        {/* 3D Envelope */}
        <EnvelopeMesh 
          geometry={envelope.geometry} 
          color={envelopeColor}
          opacity={envelopeOpacity}
        />
        <EnvelopeWireframe geometry={envelope.geometry} />
        
        {/* Height Plane */}
        {showHeightPlane && (
          <HeightPlane maxHeight={dims.max_height_ft} />
        )}
        
        {/* Environment */}
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
      
      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-sm max-w-[280px]">
        <h3 className="font-bold text-lg mb-2 text-blue-400">
          {dims.district_code}
        </h3>
        {dims.district_name && (
          <p className="text-gray-400 text-xs mb-2">{dims.district_name}</p>
        )}
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Buildable Area:</span>
            <span className="font-mono">{formatNumber(envelope.maxBuildableArea)} sf</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Max GFA (FAR {dims.max_far}):</span>
            <span className="font-mono">{formatNumber(envelope.maxGFA)} sf</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Max Height:</span>
            <span className="font-mono">{dims.max_height_ft} ft</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Est. Floors:</span>
            <span className="font-mono">{envelope.maxFloors}</span>
          </div>
        </div>
        {dims.source_url && (
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
            <a 
              href={dims.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              📄 View Municode Source
            </a>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-1 bg-red-500"></div>
          <span>Lot Boundary</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-1 bg-green-500" style={{ borderStyle: 'dashed' }}></div>
          <span>Buildable Area</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500/70 rounded-sm"></div>
          <span>3D Envelope</span>
        </div>
      </div>
      
      {/* Controls Hint */}
      <div className="absolute bottom-4 right-4 bg-black/60 text-gray-400 px-2 py-1 rounded text-xs">
        🖱️ Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}

export default EnvelopeViewer;
