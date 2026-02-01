/**
 * ZoneWise.AI Map Envelope Viewer Component
 * 
 * Integrates Mapbox GL JS with Three.js for 3D envelope visualization
 * overlaid on satellite imagery. Uses react-three-map for integration.
 * 
 * @module MapEnvelopeViewer
 * @version 1.0.0
 */

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Map, { Source, Layer, MapRef, NavigationControl, ScaleControl } from 'react-map-gl';
import { Canvas } from 'react-three-map';
import * as THREE from 'three';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';

import { 
  generateBuildingEnvelope, 
  ZoningDIMS, 
  EnvelopeResult 
} from '../../lib/envelope-generator';
import { geoToLocal } from '../../lib/geo-utils';

// ============================================================================
// Constants
// ============================================================================

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw';

const MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/streets-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12'
} as const;

type MapStyleKey = keyof typeof MAP_STYLES;

// ============================================================================
// Types
// ============================================================================

export interface MapEnvelopeViewerProps {
  /** Center coordinates [longitude, latitude] */
  center: [number, number];
  /** GeoJSON polygon representing the lot boundary */
  lotPolygon: GeoJSON.Feature<GeoJSON.Polygon>;
  /** Zoning Development Intensity Metrics */
  dims: ZoningDIMS;
  /** Initial zoom level (default: 18) */
  zoom?: number;
  /** Initial pitch angle in degrees (default: 60) */
  pitch?: number;
  /** Initial bearing in degrees (default: -20) */
  bearing?: number;
  /** Map style (default: 'satellite') */
  mapStyle?: MapStyleKey;
  /** Envelope color (default: '#4A90D9') */
  envelopeColor?: string;
  /** Envelope opacity 0-1 (default: 0.7) */
  envelopeOpacity?: number;
  /** Show lot polygon fill (default: true) */
  showLotFill?: boolean;
  /** Show setback area (default: true) */
  showSetbackArea?: boolean;
  /** Callback when envelope is calculated */
  onEnvelopeCalculated?: (result: EnvelopeResult) => void;
  /** Callback when map is clicked */
  onMapClick?: (lngLat: [number, number]) => void;
  /** Container className */
  className?: string;
  /** Container height (default: '700px') */
  height?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * 3D Envelope Mesh for Map overlay
 */
function EnvelopeMesh3D({ 
  envelope, 
  color, 
  opacity 
}: { 
  envelope: EnvelopeResult;
  color: string;
  opacity: number;
}) {
  return (
    <group>
      {/* Solid envelope */}
      <mesh geometry={envelope.geometry} castShadow>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      
      {/* Wireframe overlay */}
      <lineSegments geometry={new THREE.EdgesGeometry(envelope.geometry)}>
        <lineBasicMaterial color="#1a365d" linewidth={1} />
      </lineSegments>
    </group>
  );
}

/**
 * Style Selector Component
 */
function StyleSelector({ 
  value, 
  onChange 
}: { 
  value: MapStyleKey; 
  onChange: (style: MapStyleKey) => void;
}) {
  return (
    <div className="absolute top-4 left-4 bg-white/95 rounded-lg shadow-lg p-2 z-10">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MapStyleKey)}
        className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer"
      >
        <option value="satellite">🛰️ Satellite</option>
        <option value="streets">🗺️ Streets</option>
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
        <option value="outdoors">🏔️ Outdoors</option>
      </select>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * MapEnvelopeViewer - 3D Envelope on Mapbox Map
 * 
 * Renders an interactive map with 3D building envelope overlay.
 * Supports satellite imagery, multiple map styles, and real coordinates.
 * 
 * @example
 * ```tsx
 * <MapEnvelopeViewer
 *   center={[-80.5687, 28.004]}
 *   lotPolygon={myLot}
 *   dims={zoningDims}
 *   onEnvelopeCalculated={(result) => console.log(result)}
 * />
 * ```
 */
export function MapEnvelopeViewer({
  center,
  lotPolygon,
  dims,
  zoom = 18,
  pitch = 60,
  bearing = -20,
  mapStyle = 'satellite',
  envelopeColor = '#4A90D9',
  envelopeOpacity = 0.7,
  showLotFill = true,
  showSetbackArea = true,
  onEnvelopeCalculated,
  onMapClick,
  className = '',
  height = '700px'
}: MapEnvelopeViewerProps) {
  
  // Refs
  const mapRef = useRef<MapRef>(null);
  
  // State
  const [viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom,
    pitch,
    bearing
  });
  const [currentStyle, setCurrentStyle] = useState<MapStyleKey>(mapStyle);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Generate envelope
  const envelope = useMemo(() => {
    const result = generateBuildingEnvelope(
      lotPolygon as turf.Feature<turf.Polygon>,
      dims
    );
    onEnvelopeCalculated?.(result);
    return result;
  }, [lotPolygon, dims, onEnvelopeCalculated]);
  
  // Handle map click
  const handleMapClick = useCallback((event: any) => {
    const { lngLat } = event;
    onMapClick?.([lngLat.lng, lngLat.lat]);
  }, [onMapClick]);
  
  // Handle map load
  const handleMapLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);
  
  // Fly to center when it changes
  useEffect(() => {
    if (mapRef.current && isLoaded) {
      mapRef.current.flyTo({
        center: center,
        zoom: zoom,
        pitch: pitch,
        bearing: bearing,
        duration: 1500
      });
    }
  }, [center, zoom, pitch, bearing, isLoaded]);
  
  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        mapStyle={MAP_STYLES[currentStyle]}
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        reuseMaps
      >
        {/* Navigation controls */}
        <NavigationControl position="bottom-right" />
        <ScaleControl position="bottom-left" unit="imperial" />
        
        {/* Lot polygon fill */}
        {showLotFill && (
          <Source id="lot-polygon" type="geojson" data={lotPolygon}>
            <Layer
              id="lot-fill"
              type="fill"
              paint={{
                'fill-color': '#FF6B6B',
                'fill-opacity': 0.15
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
        )}
        
        {/* Setback area */}
        {showSetbackArea && envelope.setbackPolygon && (
          <Source id="setback-polygon" type="geojson" data={envelope.setbackPolygon}>
            <Layer
              id="setback-fill"
              type="fill"
              paint={{
                'fill-color': '#4ADE80',
                'fill-opacity': 0.1
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
        )}
        
        {/* 3D Canvas overlay */}
        {isLoaded && (
          <Canvas latitude={center[1]} longitude={center[0]}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[50, 100, 50]} intensity={0.8} castShadow />
            <directionalLight position={[-50, 50, -50]} intensity={0.3} />
            
            <EnvelopeMesh3D
              envelope={envelope}
              color={envelopeColor}
              opacity={envelopeOpacity}
            />
          </Canvas>
        )}
      </Map>
      
      {/* Style selector */}
      <StyleSelector value={currentStyle} onChange={setCurrentStyle} />
      
      {/* Info panel */}
      <div className="absolute top-4 right-4 bg-white/95 p-4 rounded-lg shadow-xl w-72 max-h-[calc(100%-2rem)] overflow-auto">
        <h3 className="font-bold text-lg mb-1 text-gray-800">
          {dims.district_code}
        </h3>
        {dims.district_name && (
          <p className="text-gray-500 text-sm mb-3">{dims.district_name}</p>
        )}
        
        <div className="space-y-2 text-sm border-t pt-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Max Height:</span>
            <span className="font-mono font-semibold">{dims.max_height_ft} ft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">FAR:</span>
            <span className="font-mono font-semibold">{dims.max_far}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-xs mt-2 pt-2 border-t">
            <div className="text-center">
              <div className="text-gray-500">Front</div>
              <div className="font-mono">{dims.setbacks_ft.front}'</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Side</div>
              <div className="font-mono">{dims.setbacks_ft.side}'</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Rear</div>
              <div className="font-mono">{dims.setbacks_ft.rear}'</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t space-y-2 text-sm">
          <h4 className="font-semibold text-gray-700">Envelope Stats</h4>
          <div className="flex justify-between">
            <span className="text-gray-600">Buildable:</span>
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
        
        {dims.source_url && (
          <div className="mt-3 pt-2 border-t">
            <a
              href={dims.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs flex items-center gap-1"
            >
              📄 View Municode Source
            </a>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-12 left-4 bg-white/95 p-2 rounded-lg shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-2 bg-red-500/40 border border-red-500"></div>
          <span>Lot Boundary</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-2 bg-green-500/30 border border-green-500 border-dashed"></div>
          <span>Buildable Area</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500/70 rounded-sm"></div>
          <span>3D Envelope</span>
        </div>
      </div>
      
      {/* Coordinates display */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
        {viewState.latitude.toFixed(5)}, {viewState.longitude.toFixed(5)}
      </div>
    </div>
  );
}

export default MapEnvelopeViewer;
