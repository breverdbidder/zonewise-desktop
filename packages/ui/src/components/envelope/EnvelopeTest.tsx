/**
 * ZoneWise.AI Envelope Test Component
 * 
 * Test page for the EnvelopeViewer component using Malabar sample data.
 * Allows switching between all 13 Malabar zoning districts.
 * 
 * @module EnvelopeTest
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { EnvelopeViewer } from './EnvelopeViewer';
import { 
  MALABAR_DISTRICTS, 
  SAMPLE_LOT_POLYGON, 
  getAllDistrictCodes,
  type ZoningDIMS 
} from '../../data/malabar-sample-data';
import { EnvelopeResult } from '../../lib/envelope-generator';

/**
 * EnvelopeTest - Interactive test component for 3D envelope visualization
 */
export function EnvelopeTest() {
  // State
  const [selectedDistrict, setSelectedDistrict] = useState<string>('RS-1');
  const [envelopeResult, setEnvelopeResult] = useState<EnvelopeResult | null>(null);
  const [showSetbacks, setShowSetbacks] = useState(true);
  const [showHeightPlane, setShowHeightPlane] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [opacity, setOpacity] = useState(0.7);
  
  // Get current district DIMS
  const currentDims: ZoningDIMS = MALABAR_DISTRICTS[selectedDistrict];
  
  // Handle envelope calculation callback
  const handleEnvelopeCalculated = useCallback((result: EnvelopeResult) => {
    setEnvelopeResult(result);
    console.log('Envelope calculated:', result);
  }, []);
  
  // Format number with commas
  const formatNumber = (n: number) => n.toLocaleString();
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-2">
          ZoneWise.AI - 3D Envelope Test
        </h1>
        <p className="text-gray-400">
          Testing EnvelopeViewer with Malabar, FL zoning data (13 districts)
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* District Selector */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Zoning District</h3>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getAllDistrictCodes().map(code => (
                <option key={code} value={code}>
                  {code} - {MALABAR_DISTRICTS[code].district_name}
                </option>
              ))}
            </select>
          </div>
          
          {/* District Info */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">District Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Min Lot:</span>
                <span>{formatNumber(currentDims.min_lot_sqft)} sf</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Min Width:</span>
                <span>{currentDims.min_lot_width_ft} ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Height:</span>
                <span>{currentDims.max_height_ft} ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">FAR:</span>
                <span>{currentDims.max_far}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="text-gray-400 mb-1">Setbacks:</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-500">Front</div>
                    <div>{currentDims.setbacks_ft.front} ft</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Side</div>
                    <div>{currentDims.setbacks_ft.side} ft</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Rear</div>
                    <div>{currentDims.setbacks_ft.rear} ft</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Display Options */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Display Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSetbacks}
                  onChange={(e) => setShowSetbacks(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                />
                <span className="text-sm">Show Setback Lines</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeightPlane}
                  onChange={(e) => setShowHeightPlane(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                />
                <span className="text-sm">Show Height Plane</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                />
                <span className="text-sm">Show Grid</span>
              </label>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Envelope Opacity: {(opacity * 100).toFixed(0)}%
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
              <h3 className="font-semibold text-lg mb-3 text-green-400">
                Calculated Results
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Buildable Area:</span>
                  <span className="font-mono">{formatNumber(envelopeResult.maxBuildableArea)} sf</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max GFA:</span>
                  <span className="font-mono">{formatNumber(envelopeResult.maxGFA)} sf</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Floors:</span>
                  <span className="font-mono">{envelopeResult.maxFloors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Volume:</span>
                  <span className="font-mono">{formatNumber(envelopeResult.envelopeVolume)} cf</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Source */}
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
              <p className="text-xs text-gray-500 mt-1">
                Verified: {currentDims.verified_date}
              </p>
            </div>
          )}
        </div>
        
        {/* 3D Viewer */}
        <div className="lg:col-span-3">
          <EnvelopeViewer
            lotPolygon={SAMPLE_LOT_POLYGON}
            dims={currentDims}
            showSetbackLines={showSetbacks}
            showHeightPlane={showHeightPlane}
            showGrid={showGrid}
            envelopeOpacity={opacity}
            onEnvelopeCalculated={handleEnvelopeCalculated}
            className="h-[700px]"
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-6 text-center text-gray-500 text-sm">
        <p>
          ZoneWise.AI Desktop v1.0 | Malabar LDC Article III | 
          {' '}
          <span className="text-green-400">✓ 13/13 Districts Verified</span>
        </p>
      </div>
    </div>
  );
}

export default EnvelopeTest;
