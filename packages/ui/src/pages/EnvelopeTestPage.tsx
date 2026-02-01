/**
 * ZoneWise.AI Envelope Test Page
 * 
 * Test page for 3D building envelope visualization using
 * real Malabar RS-1 zoning data.
 * 
 * @module EnvelopeTestPage
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { EnvelopeViewer } from '../components/envelope/EnvelopeViewer';
import type { ZoningDIMS, EnvelopeResult } from '../lib/envelope-generator';

// ============================================================================
// Sample Data - Malabar RS-1 Zoning District
// ============================================================================

/**
 * Malabar RS-1 (Residential Single-Family) Zoning DIMS
 * Source: Malabar LDC Article III, Sec. 58-66
 * Verified: 2026-01-30
 */
const MALABAR_RS1_DIMS: ZoningDIMS = {
  district_code: 'RS-1',
  district_name: 'Residential Single-Family (1 acre)',
  min_lot_sqft: 43560, // 1 acre
  min_lot_width_ft: 150,
  max_height_ft: 35,
  max_far: 0.35,
  setbacks_ft: {
    front: 25,
    side: 15,
    rear: 20
  },
  source_url: 'https://library.municode.com/fl/malabar/codes/code_of_ordinances?nodeId=PTIICOOR_CH58LADECO_ARTIIZODIRE_DIV3DIRE_S58-66AM',
  verified_date: '2026-01-30',
  jurisdiction: 'Malabar'
};

/**
 * Sample 1-acre lot polygon in Malabar
 * Approximate location: Near Malabar Rd & US-1
 * Coordinates: [longitude, latitude]
 */
const SAMPLE_LOT_POLYGON: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: {
    parcel_id: 'SAMPLE-001',
    address: '1234 Malabar Rd, Malabar, FL 32950',
    lot_area_sqft: 45000
  },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-80.5680, 28.0040],  // SW corner
      [-80.5665, 28.0040],  // SE corner
      [-80.5665, 28.0055],  // NE corner
      [-80.5680, 28.0055],  // NW corner
      [-80.5680, 28.0040]   // Close polygon
    ]]
  }
};

/**
 * Additional Malabar zoning districts for testing
 */
const MALABAR_DISTRICTS: Record<string, ZoningDIMS> = {
  'RS-1': MALABAR_RS1_DIMS,
  'RS-2.5': {
    district_code: 'RS-2.5',
    district_name: 'Residential Single-Family (2.5 acres)',
    min_lot_sqft: 108900, // 2.5 acres
    min_lot_width_ft: 200,
    max_height_ft: 35,
    max_far: 0.25,
    setbacks_ft: { front: 35, side: 25, rear: 25 },
    source_url: 'https://library.municode.com/fl/malabar/codes/code_of_ordinances',
    verified_date: '2026-01-30',
    jurisdiction: 'Malabar'
  },
  'RS-5': {
    district_code: 'RS-5',
    district_name: 'Residential Single-Family (5 acres)',
    min_lot_sqft: 217800, // 5 acres
    min_lot_width_ft: 300,
    max_height_ft: 35,
    max_far: 0.20,
    setbacks_ft: { front: 50, side: 35, rear: 35 },
    source_url: 'https://library.municode.com/fl/malabar/codes/code_of_ordinances',
    verified_date: '2026-01-30',
    jurisdiction: 'Malabar'
  },
  'C-1': {
    district_code: 'C-1',
    district_name: 'Commercial (Neighborhood)',
    min_lot_sqft: 20000,
    min_lot_width_ft: 100,
    max_height_ft: 45,
    max_far: 0.50,
    setbacks_ft: { front: 25, side: 10, rear: 20 },
    source_url: 'https://library.municode.com/fl/malabar/codes/code_of_ordinances',
    verified_date: '2026-01-30',
    jurisdiction: 'Malabar'
  }
};

// ============================================================================
// Test Page Component
// ============================================================================

export function EnvelopeTestPage() {
  // State
  const [selectedDistrict, setSelectedDistrict] = useState<string>('RS-1');
  const [envelopeResult, setEnvelopeResult] = useState<EnvelopeResult | null>(null);
  const [showSetbacks, setShowSetbacks] = useState(true);
  const [showHeight, setShowHeight] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [opacity, setOpacity] = useState(0.7);
  
  // Current DIMS
  const currentDims = MALABAR_DISTRICTS[selectedDistrict];
  
  // Handle envelope calculation
  const handleEnvelopeCalculated = useCallback((result: EnvelopeResult) => {
    setEnvelopeResult(result);
    console.log('Envelope calculated:', result);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">
          🏗️ ZoneWise.AI 3D Envelope Test
        </h1>
        <p className="text-gray-400">
          Testing 3D building envelope visualization with Malabar zoning data
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* District Selector */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-3 text-blue-300">
              Zoning District
            </h2>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            >
              {Object.keys(MALABAR_DISTRICTS).map(code => (
                <option key={code} value={code}>
                  {code} - {MALABAR_DISTRICTS[code].district_name}
                </option>
              ))}
            </select>
          </div>
          
          {/* DIMS Display */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-3 text-blue-300">
              Zoning DIMS
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Min Lot Size:</span>
                <span className="font-mono">
                  {(currentDims.min_lot_sqft / 43560).toFixed(2)} acres
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Min Lot Width:</span>
                <span className="font-mono">{currentDims.min_lot_width_ft} ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Height:</span>
                <span className="font-mono">{currentDims.max_height_ft} ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max FAR:</span>
                <span className="font-mono">{currentDims.max_far}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="text-gray-500 text-xs mb-1">Setbacks:</div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Front:</span>
                  <span className="font-mono">{currentDims.setbacks_ft.front} ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Side:</span>
                  <span className="font-mono">{currentDims.setbacks_ft.side} ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rear:</span>
                  <span className="font-mono">{currentDims.setbacks_ft.rear} ft</span>
                </div>
              </div>
            </div>
            {currentDims.source_url && (
              <a 
                href={currentDims.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 text-xs text-blue-400 hover:underline"
              >
                📄 View Municode Source →
              </a>
            )}
          </div>
          
          {/* Visualization Controls */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-3 text-blue-300">
              Display Options
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSetbacks}
                  onChange={(e) => setShowSetbacks(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Setback Lines</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeight}
                  onChange={(e) => setShowHeight(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Height Plane</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Grid</span>
              </label>
              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Opacity: {(opacity * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Envelope Results */}
          {envelopeResult && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-3 text-green-400">
                ✅ Envelope Results
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Buildable Area:</span>
                  <span className="font-mono text-green-300">
                    {envelopeResult.maxBuildableArea.toLocaleString()} sf
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max GFA:</span>
                  <span className="font-mono text-green-300">
                    {envelopeResult.maxGFA.toLocaleString()} sf
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Floors:</span>
                  <span className="font-mono text-green-300">
                    {envelopeResult.maxFloors}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Volume:</span>
                  <span className="font-mono text-green-300">
                    {envelopeResult.envelopeVolume.toLocaleString()} cf
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 3D Viewer */}
        <div className="lg:col-span-3">
          <EnvelopeViewer
            lotPolygon={SAMPLE_LOT_POLYGON}
            dims={currentDims}
            showSetbackLines={showSetbacks}
            showHeightPlane={showHeight}
            showGrid={showGrid}
            envelopeOpacity={opacity}
            onEnvelopeCalculated={handleEnvelopeCalculated}
            className="h-[700px]"
          />
        </div>
      </div>
      
      {/* Sample Data Info */}
      <div className="max-w-7xl mx-auto mt-6 bg-gray-900 rounded-lg p-4">
        <h2 className="font-semibold text-lg mb-2 text-gray-300">
          📍 Sample Parcel Data
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Parcel ID:</span>
            <span className="ml-2 font-mono">{SAMPLE_LOT_POLYGON.properties?.parcel_id}</span>
          </div>
          <div>
            <span className="text-gray-500">Address:</span>
            <span className="ml-2">{SAMPLE_LOT_POLYGON.properties?.address}</span>
          </div>
          <div>
            <span className="text-gray-500">Lot Area:</span>
            <span className="ml-2 font-mono">
              {SAMPLE_LOT_POLYGON.properties?.lot_area_sqft?.toLocaleString()} sf
            </span>
          </div>
          <div>
            <span className="text-gray-500">Jurisdiction:</span>
            <span className="ml-2">Malabar, FL</span>
          </div>
        </div>
        <pre className="mt-3 bg-gray-800 rounded p-3 text-xs overflow-x-auto text-gray-400">
{JSON.stringify(SAMPLE_LOT_POLYGON.geometry.coordinates[0], null, 2)}
        </pre>
      </div>
      
      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-6 text-center text-gray-600 text-sm">
        ZoneWise.AI Desktop V1 • 3D Envelope Test Page • Malabar Zoning Data Verified 2026-01-30
      </div>
    </div>
  );
}

export default EnvelopeTestPage;
