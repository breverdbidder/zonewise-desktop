/**
 * ZoneWise.AI Export Panel Component
 * 
 * UI panel for exporting envelope visualizations in various formats.
 * 
 * @module ExportPanel
 * @version 1.0.0
 */

import React, { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { ZoningDIMS, EnvelopeResult } from '../../lib/envelope-generator';
import {
  exportToPNG,
  exportToPNGWithOverlay,
  exportToOBJ,
  exportToOBJWithMaterial,
  exportToJSON,
  exportToGeoJSON
} from '../../lib/export-utils';

export interface ExportPanelProps {
  /** Reference to the WebGL canvas */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Current envelope geometry */
  geometry: THREE.BufferGeometry | null;
  /** Current zoning DIMS */
  dims: ZoningDIMS;
  /** Current envelope result */
  result: EnvelopeResult | null;
  /** Current lot polygon */
  lotPolygon: GeoJSON.Feature<GeoJSON.Polygon>;
  /** Panel className */
  className?: string;
}

type ExportFormat = 'png' | 'png-overlay' | 'obj' | 'obj-mtl' | 'json' | 'geojson';

/**
 * ExportPanel - Export controls for envelope visualizations
 */
export function ExportPanel({
  canvasRef,
  geometry,
  dims,
  result,
  lotPolygon,
  className = ''
}: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  
  // Generate filename with district code and timestamp
  const getFilename = useCallback((extension: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    return `zonewise-${dims.district_code}-${timestamp}.${extension}`;
  }, [dims.district_code]);
  
  // Handle export
  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!result) {
      setExportStatus('No envelope data to export');
      return;
    }
    
    setIsExporting(true);
    setExportStatus(`Exporting ${format.toUpperCase()}...`);
    
    try {
      switch (format) {
        case 'png':
          if (!canvasRef.current) throw new Error('Canvas not available');
          await exportToPNG(canvasRef.current, getFilename('png'));
          break;
          
        case 'png-overlay':
          if (!canvasRef.current) throw new Error('Canvas not available');
          await exportToPNGWithOverlay(
            canvasRef.current, 
            dims, 
            result, 
            getFilename('png')
          );
          break;
          
        case 'obj':
          if (!geometry) throw new Error('Geometry not available');
          exportToOBJ(geometry, getFilename('obj'));
          break;
          
        case 'obj-mtl':
          if (!geometry) throw new Error('Geometry not available');
          exportToOBJWithMaterial(
            geometry,
            `zonewise-${dims.district_code}-${new Date().toISOString().split('T')[0]}`
          );
          break;
          
        case 'json':
          exportToJSON(dims, result, lotPolygon, getFilename('json'));
          break;
          
        case 'geojson':
          exportToGeoJSON(lotPolygon, result, dims, getFilename('geojson'));
          break;
      }
      
      setExportStatus(`✅ ${format.toUpperCase()} exported successfully!`);
      setTimeout(() => setExportStatus(null), 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus(`❌ Export failed: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  }, [canvasRef, geometry, dims, result, lotPolygon, getFilename]);
  
  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <h3 className="font-semibold text-lg mb-3 text-blue-300">
        📤 Export
      </h3>
      
      {/* Image Exports */}
      <div className="mb-4">
        <h4 className="text-sm text-gray-400 mb-2">Image</h4>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('png')}
            disabled={isExporting || !canvasRef.current}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-sm transition-colors"
          >
            📷 PNG
          </button>
          <button
            onClick={() => handleExport('png-overlay')}
            disabled={isExporting || !canvasRef.current || !result}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-sm transition-colors"
          >
            📊 PNG + Info
          </button>
        </div>
      </div>
      
      {/* 3D Model Exports */}
      <div className="mb-4">
        <h4 className="text-sm text-gray-400 mb-2">3D Model</h4>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('obj')}
            disabled={isExporting || !geometry}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-sm transition-colors"
          >
            🎲 OBJ
          </button>
          <button
            onClick={() => handleExport('obj-mtl')}
            disabled={isExporting || !geometry}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-sm transition-colors"
          >
            🎨 OBJ + MTL
          </button>
        </div>
      </div>
      
      {/* Data Exports */}
      <div className="mb-4">
        <h4 className="text-sm text-gray-400 mb-2">Data</h4>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting || !result}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-sm transition-colors"
          >
            📋 JSON
          </button>
          <button
            onClick={() => handleExport('geojson')}
            disabled={isExporting || !result}
            className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-sm transition-colors"
          >
            🗺️ GeoJSON
          </button>
        </div>
      </div>
      
      {/* Status */}
      {exportStatus && (
        <div className={`text-sm p-2 rounded ${
          exportStatus.includes('✅') 
            ? 'bg-green-900/50 text-green-300'
            : exportStatus.includes('❌')
            ? 'bg-red-900/50 text-red-300'
            : 'bg-blue-900/50 text-blue-300'
        }`}>
          {exportStatus}
        </div>
      )}
      
      {/* Format info */}
      <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500">
        <p className="mb-1">• <strong>PNG:</strong> Screenshot of current view</p>
        <p className="mb-1">• <strong>OBJ:</strong> 3D model for CAD/Revit</p>
        <p className="mb-1">• <strong>JSON:</strong> Full data export</p>
        <p>• <strong>GeoJSON:</strong> Map-ready polygons</p>
      </div>
    </div>
  );
}

export default ExportPanel;
