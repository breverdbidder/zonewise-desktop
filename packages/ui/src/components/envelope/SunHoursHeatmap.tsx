/**
 * ZoneWise.AI Sun Hours Heatmap Component
 * 
 * Visualizes sun exposure across a lot using shadow raycasting.
 * Shows areas with more/less sunlight throughout the day.
 * 
 * @module SunHoursHeatmap
 * @version 1.0.0
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera,
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
  analyzeShadows,
  getSunHoursColor,
  getSunTimes,
  getDaylightHours,
  ShadowAnalysisResult,
  ShadowAnalysisConfig
} from '../../lib/sun-analysis';

// ============================================================================
// Types
// ============================================================================

export interface SunHoursHeatmapProps {
  /** GeoJSON polygon representing the lot boundary */
  lotPolygon: GeoJSON.Feature<GeoJSON.Polygon>;
  /** Zoning Development Intensity Metrics */
  dims: ZoningDIMS;
  /** Date for analysis (default: today) */
  date?: Date;
  /** Location [longitude, latitude] */
  location?: [number, number];
  /** Grid resolution in meters (default: 2) */
  resolution?: number;
  /** Grid size in meters (default: 60) */
  gridSize?: number;
  /** Envelope color (default: '#4A90D9') */
  envelopeColor?: string;
  /** Show envelope wireframe (default: true) */
  showEnvelope?: boolean;
  /** Container className */
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Heatmap Grid Visualization
 */
function HeatmapGrid({ 
  analysis,
  height = 0.1 
}: { 
  analysis: ShadowAnalysisResult;
  height?: number;
}) {
  const { grid, resolution, daylightHours } = analysis;
  
  // Create colored plane segments
  const meshes = useMemo(() => {
    const result: JSX.Element[] = [];
    const halfRes = resolution / 2;
    
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        const color = getSunHoursColor(cell.sunHours, daylightHours);
        const [x, z] = cell.position;
        
        result.push(
          <mesh
            key={`${i}-${j}`}
            position={[x, height, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[resolution - 0.1, resolution - 0.1]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      });
    });
    
    return result;
  }, [grid, resolution, daylightHours, height]);
  
  return <group>{meshes}</group>;
}

/**
 * Heatmap Legend
 */
function HeatmapLegend({ maxHours }: { maxHours: number }) {
  const gradientSteps = 10;
  const steps = Array.from({ length: gradientSteps + 1 }, (_, i) => {
    const hours = (i / gradientSteps) * maxHours;
    const color = getSunHoursColor(hours, maxHours);
    return { hours, color };
  });
  
  return (
    <div className="bg-black/80 p-3 rounded-lg">
      <h4 className="text-sm font-semibold mb-2 text-gray-300">Sun Hours</h4>
      <div className="flex flex-col gap-0.5">
        {steps.reverse().map(({ hours, color }, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-6 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-400 font-mono w-12">
              {hours.toFixed(1)}h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Envelope Wireframe
 */
function EnvelopeWireframe({ 
  geometry, 
  color = '#4A90D9' 
}: { 
  geometry: THREE.BufferGeometry;
  color?: string;
}) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  
  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>
    </group>
  );
}

/**
 * Analysis Loading Indicator
 */
function LoadingIndicator({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
      <div className="text-center">
        <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-yellow-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-400">Analyzing shadows... {progress.toFixed(0)}%</p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * SunHoursHeatmap - Shadow Analysis Visualization
 */
export function SunHoursHeatmap({
  lotPolygon,
  dims,
  date = new Date(),
  location,
  resolution = 2,
  gridSize = 60,
  envelopeColor = '#4A90D9',
  showEnvelope = true,
  className = ''
}: SunHoursHeatmapProps) {
  
  // Default location (Malabar, FL)
  const defaultLocation: [number, number] = location || [-80.5687, 28.004];
  const [lng, lat] = defaultLocation;
  
  // State
  const [analysis, setAnalysis] = useState<ShadowAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState(date);
  
  // Generate envelope
  const envelope = useMemo(() => {
    return generateBuildingEnvelope(
      lotPolygon as turf.Feature<turf.Polygon>,
      dims
    );
  }, [lotPolygon, dims]);
  
  // Create mesh for raycasting
  const envelopeMesh = useMemo(() => {
    const geometry = envelope.geometry;
    const material = new THREE.MeshBasicMaterial();
    return new THREE.Mesh(geometry, material);
  }, [envelope]);
  
  // Get daylight info
  const sunTimes = useMemo(() => getSunTimes(selectedDate, lat, lng), [selectedDate, lat, lng]);
  const daylightHours = useMemo(() => getDaylightHours(selectedDate, lat, lng), [selectedDate, lat, lng]);
  
  // Run analysis
  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate progress for UI
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 5, 95));
    }, 100);
    
    // Run analysis in chunks to avoid blocking UI
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const config: ShadowAnalysisConfig = {
      date: selectedDate,
      location: defaultLocation,
      gridSize,
      resolution,
      timeStepMinutes: 30
    };
    
    try {
      const result = analyzeShadows(config, [envelopeMesh]);
      setAnalysis(result);
      setProgress(100);
    } catch (error) {
      console.error('Shadow analysis failed:', error);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  }, [selectedDate, defaultLocation, gridSize, resolution, envelopeMesh]);
  
  // Run analysis on mount and when date changes
  useEffect(() => {
    runAnalysis();
  }, [selectedDate]);
  
  // Handle date change
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  }, []);
  
  return (
    <div className={`w-full h-[700px] bg-gray-900 rounded-lg overflow-hidden relative ${className}`}>
      {/* 3D Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[60, 80, 60]} fov={50} />
        <OrbitControls 
          enableDamping
          minDistance={30}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2.2}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[50, 100, 50]} intensity={0.5} />
        
        {/* Grid Helper */}
        <gridHelper args={[100, 20, '#333', '#222']} position={[0, 0.01, 0]} />
        
        {/* Heatmap */}
        {analysis && <HeatmapGrid analysis={analysis} />}
        
        {/* Envelope */}
        {showEnvelope && (
          <EnvelopeWireframe geometry={envelope.geometry} color={envelopeColor} />
        )}
      </Canvas>
      
      {/* Loading Indicator */}
      {isAnalyzing && <LoadingIndicator progress={progress} />}
      
      {/* Controls */}
      <div className="absolute top-4 left-4 bg-black/85 text-white p-4 rounded-lg w-72 space-y-4">
        <h3 className="font-bold text-lg text-yellow-400 flex items-center gap-2">
          🌡️ Sun Hours Analysis
        </h3>
        
        {/* Date Picker */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Analysis Date</label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
          />
        </div>
        
        {/* Day Info */}
        <div className="border-t border-gray-700 pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Daylight:</span>
            <span className="font-mono">{daylightHours.toFixed(1)} hours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sunrise:</span>
            <span className="font-mono">
              {sunTimes.sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sunset:</span>
            <span className="font-mono">
              {sunTimes.sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        {/* Analysis Results */}
        {analysis && (
          <div className="border-t border-gray-700 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Sun Hours:</span>
              <span className="font-mono text-yellow-400">
                {analysis.averageSunHours.toFixed(1)} hrs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Grid Cells:</span>
              <span className="font-mono">
                {analysis.grid.length * analysis.grid[0]?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Resolution:</span>
              <span className="font-mono">{resolution}m</span>
            </div>
          </div>
        )}
        
        {/* Re-run Button */}
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded font-medium"
        >
          {isAnalyzing ? 'Analyzing...' : '🔄 Re-analyze'}
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4">
        <HeatmapLegend maxHours={daylightHours} />
      </div>
      
      {/* Zoning Info */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-sm">
        <span className="text-blue-400 font-semibold">{dims.district_code}</span>
        <span className="text-gray-400 ml-2">• Max {dims.max_height_ft}ft</span>
      </div>
      
      {/* How to read */}
      <div className="absolute bottom-4 right-4 bg-black/60 text-gray-400 px-3 py-2 rounded text-xs max-w-xs">
        <p><strong>Yellow</strong> = Full sun exposure</p>
        <p><strong>Purple</strong> = Heavy shadow from building</p>
      </div>
    </div>
  );
}

export default SunHoursHeatmap;
