/**
 * ZoneWise.AI Main Application Component
 * 
 * Full-featured application combining:
 * - Map view with parcel selection (TODO 2.3)
 * - DIMS editing panel (TODO 2.4)
 * - View toggle (map/3D/split) (TODO 2.5)
 * 
 * @module ZoneWiseApp
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { EnvelopeViewer } from './EnvelopeViewer';
import { MapEnvelopeViewer } from './MapEnvelopeViewer';
import { 
  MALABAR_DISTRICTS, 
  SAMPLE_LOT_POLYGON,
  getAllDistrictCodes 
} from '../../data/malabar-sample-data';
import { ZoningDIMS, EnvelopeResult } from '../../lib/envelope-generator';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'map' | '3d' | 'split';

interface ParcelData {
  polygon: GeoJSON.Feature<GeoJSON.Polygon>;
  center: [number, number];
  address?: string;
  parcelId?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * View Mode Toggle (TODO 2.5)
 */
function ViewModeToggle({ 
  mode, 
  onChange 
}: { 
  mode: ViewMode; 
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
      <button
        onClick={() => onChange('map')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          mode === 'map' 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
      >
        🗺️ Map
      </button>
      <button
        onClick={() => onChange('3d')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          mode === '3d' 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
      >
        🎲 3D
      </button>
      <button
        onClick={() => onChange('split')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          mode === 'split' 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
      >
        ⬜ Split
      </button>
    </div>
  );
}

/**
 * DIMS Editor Panel (TODO 2.4)
 */
function DIMSEditor({
  dims,
  onChange,
  onReset
}: {
  dims: ZoningDIMS;
  onChange: (dims: ZoningDIMS) => void;
  onReset: () => void;
}) {
  const handleChange = (field: string, value: number) => {
    if (field.startsWith('setbacks_ft.')) {
      const setbackField = field.replace('setbacks_ft.', '') as keyof typeof dims.setbacks_ft;
      onChange({
        ...dims,
        setbacks_ft: {
          ...dims.setbacks_ft,
          [setbackField]: value
        }
      });
    } else {
      onChange({
        ...dims,
        [field]: value
      });
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Edit DIMS</h3>
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-gray-800 rounded"
        >
          Reset
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Max Height */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Max Height: <span className="text-white font-mono">{dims.max_height_ft} ft</span>
          </label>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={dims.max_height_ft}
            onChange={(e) => handleChange('max_height_ft', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>20'</span>
            <span>100'</span>
          </div>
        </div>
        
        {/* FAR */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            FAR: <span className="text-white font-mono">{dims.max_far.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.05"
            value={dims.max_far}
            onChange={(e) => handleChange('max_far', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1</span>
            <span>2.0</span>
          </div>
        </div>
        
        {/* Setbacks */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm text-gray-400 mb-3">Setbacks</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Front</label>
              <input
                type="number"
                min="0"
                max="100"
                value={dims.setbacks_ft.front}
                onChange={(e) => handleChange('setbacks_ft.front', parseInt(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Side</label>
              <input
                type="number"
                min="0"
                max="100"
                value={dims.setbacks_ft.side}
                onChange={(e) => handleChange('setbacks_ft.side', parseInt(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Rear</label>
              <input
                type="number"
                min="0"
                max="100"
                value={dims.setbacks_ft.rear}
                onChange={(e) => handleChange('setbacks_ft.rear', parseInt(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * District Selector
 */
function DistrictSelector({
  value,
  onChange
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const districts = getAllDistrictCodes();
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-3">Zoning District</h3>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
      >
        {districts.map(code => (
          <option key={code} value={code}>
            {code} - {MALABAR_DISTRICTS[code].district_name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Envelope Results Panel
 */
function ResultsPanel({ result }: { result: EnvelopeResult | null }) {
  if (!result) return null;
  
  const formatNumber = (n: number) => n.toLocaleString();
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-3 text-green-400">
        Envelope Results
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Buildable Area:</span>
          <span className="font-mono">{formatNumber(result.maxBuildableArea)} sf</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Max GFA:</span>
          <span className="font-mono">{formatNumber(result.maxGFA)} sf</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Est. Floors:</span>
          <span className="font-mono">{result.maxFloors}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Volume:</span>
          <span className="font-mono">{formatNumber(result.envelopeVolume)} cf</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ZoneWiseApp - Main Application
 * 
 * Complete ZoneWise.AI interface with:
 * - Parcel selection (click on map) - TODO 2.3
 * - DIMS editing with sliders - TODO 2.4
 * - View mode toggle (map/3D/split) - TODO 2.5
 */
export function ZoneWiseApp() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedDistrict, setSelectedDistrict] = useState('RS-1');
  const [customDims, setCustomDims] = useState<ZoningDIMS | null>(null);
  const [envelopeResult, setEnvelopeResult] = useState<EnvelopeResult | null>(null);
  const [parcel, setParcel] = useState<ParcelData>({
    polygon: SAMPLE_LOT_POLYGON,
    center: [-80.5687, 28.004]
  });
  
  // Current DIMS (custom or from district)
  const currentDims = useMemo(() => {
    return customDims || MALABAR_DISTRICTS[selectedDistrict];
  }, [customDims, selectedDistrict]);
  
  // Handle district change
  const handleDistrictChange = useCallback((code: string) => {
    setSelectedDistrict(code);
    setCustomDims(null); // Reset custom DIMS
  }, []);
  
  // Handle DIMS edit
  const handleDIMSChange = useCallback((dims: ZoningDIMS) => {
    setCustomDims(dims);
  }, []);
  
  // Reset DIMS to district default
  const handleDIMSReset = useCallback(() => {
    setCustomDims(null);
  }, []);
  
  // Handle map click for parcel selection (TODO 2.3)
  const handleMapClick = useCallback((lngLat: [number, number]) => {
    console.log('Map clicked at:', lngLat);
    // In production, this would query BCPAO or parcel API
    // For now, just log the coordinates
  }, []);
  
  // Handle envelope calculation
  const handleEnvelopeCalculated = useCallback((result: EnvelopeResult) => {
    setEnvelopeResult(result);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-400">
              ZoneWise.AI
            </h1>
            <span className="text-gray-500 text-sm">
              3D Building Envelope Intelligence
            </span>
          </div>
          
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          
          <div className="text-sm text-gray-400">
            {parcel.address || 'Malabar, FL Sample'}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
          <div className="space-y-4">
            <DistrictSelector
              value={selectedDistrict}
              onChange={handleDistrictChange}
            />
            
            <DIMSEditor
              dims={currentDims}
              onChange={handleDIMSChange}
              onReset={handleDIMSReset}
            />
            
            <ResultsPanel result={envelopeResult} />
            
            {/* Source link */}
            {currentDims.source_url && (
              <div className="bg-gray-900 rounded-lg p-4">
                <a
                  href={currentDims.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm flex items-center gap-2"
                >
                  📄 View Municode Source
                </a>
                {currentDims.verified_date && (
                  <p className="text-xs text-gray-500 mt-1">
                    Verified: {currentDims.verified_date}
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
        
        {/* Viewer Area */}
        <main className="flex-1 relative">
          {viewMode === 'map' && (
            <MapEnvelopeViewer
              center={parcel.center}
              lotPolygon={parcel.polygon}
              dims={currentDims}
              onEnvelopeCalculated={handleEnvelopeCalculated}
              onMapClick={handleMapClick}
              height="100%"
            />
          )}
          
          {viewMode === '3d' && (
            <EnvelopeViewer
              lotPolygon={parcel.polygon}
              dims={currentDims}
              onEnvelopeCalculated={handleEnvelopeCalculated}
              className="h-full"
            />
          )}
          
          {viewMode === 'split' && (
            <div className="grid grid-cols-2 h-full gap-1 bg-gray-800">
              <div className="relative">
                <MapEnvelopeViewer
                  center={parcel.center}
                  lotPolygon={parcel.polygon}
                  dims={currentDims}
                  onEnvelopeCalculated={handleEnvelopeCalculated}
                  onMapClick={handleMapClick}
                  height="100%"
                />
              </div>
              <div className="relative">
                <EnvelopeViewer
                  lotPolygon={parcel.polygon}
                  dims={currentDims}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ZoneWiseApp;
