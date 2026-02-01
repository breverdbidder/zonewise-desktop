/**
 * ZoneWise.AI Export Utilities
 * 
 * Functions for exporting 3D envelope visualizations to various formats:
 * - PNG screenshot (TODO 3.3)
 * - OBJ 3D model (TODO 3.4)
 * - JSON data export
 * 
 * @module export-utils
 * @version 1.0.0
 */

import * as THREE from 'three';
import { EnvelopeResult, ZoningDIMS } from './envelope-generator';

// ============================================================================
// PNG Export (TODO 3.3)
// ============================================================================

/**
 * Export the current 3D canvas view as a PNG image
 * 
 * @param canvas - The WebGL canvas element from Three.js renderer
 * @param filename - Name for the downloaded file (default: 'envelope.png')
 * @param backgroundColor - Background color (default: '#1a1a2e')
 * @returns Promise that resolves when download starts
 * 
 * @example
 * ```tsx
 * const canvas = document.querySelector('canvas');
 * await exportToPNG(canvas, 'my-envelope.png');
 * ```
 */
export async function exportToPNG(
  canvas: HTMLCanvasElement,
  filename: string = 'envelope.png',
  backgroundColor?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary canvas for the export
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get 2D context');
      }
      
      // Match dimensions
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      
      // Fill background if specified
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      }
      
      // Draw the WebGL canvas
      ctx.drawImage(canvas, 0, 0);
      
      // Convert to blob and download
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png', 1.0);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Export PNG with metadata overlay
 * Adds zoning information as text overlay on the image
 */
export async function exportToPNGWithOverlay(
  canvas: HTMLCanvasElement,
  dims: ZoningDIMS,
  result: EnvelopeResult,
  filename: string = 'envelope-report.png'
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get 2D context');
      }
      
      // Add padding for overlay
      const padding = 200;
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height + padding;
      
      // Dark background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Draw 3D view
      ctx.drawImage(canvas, 0, 0);
      
      // Draw info overlay at bottom
      const overlayY = canvas.height + 20;
      
      // Title
      ctx.fillStyle = '#4A90D9';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`ZoneWise.AI - ${dims.district_code}`, 20, overlayY);
      
      // District name
      ctx.fillStyle = '#888';
      ctx.font = '16px Arial';
      ctx.fillText(dims.district_name, 20, overlayY + 30);
      
      // Stats
      ctx.fillStyle = '#fff';
      ctx.font = '14px monospace';
      const stats = [
        `Buildable Area: ${result.maxBuildableArea.toLocaleString()} sf`,
        `Max GFA: ${result.maxGFA.toLocaleString()} sf`,
        `Max Height: ${dims.max_height_ft} ft`,
        `Est. Floors: ${result.maxFloors}`,
        `FAR: ${dims.max_far}`
      ];
      
      stats.forEach((stat, i) => {
        ctx.fillText(stat, 20, overlayY + 60 + (i * 22));
      });
      
      // Setbacks
      ctx.fillText(
        `Setbacks: Front ${dims.setbacks_ft.front}' | Side ${dims.setbacks_ft.side}' | Rear ${dims.setbacks_ft.rear}'`,
        20,
        overlayY + 60 + (stats.length * 22)
      );
      
      // Timestamp and source
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(
        `Generated: ${new Date().toISOString()} | Source: Municode Verified`,
        20,
        overlayY + padding - 20
      );
      
      // Export
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png', 1.0);
      
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// OBJ Export (TODO 3.4)
// ============================================================================

/**
 * Export Three.js BufferGeometry to OBJ format
 * 
 * @param geometry - Three.js BufferGeometry to export
 * @param filename - Name for the downloaded file (default: 'envelope.obj')
 * @param objectName - Name of the object in OBJ file (default: 'BuildingEnvelope')
 * 
 * @example
 * ```tsx
 * const result = generateBuildingEnvelope(lot, dims);
 * exportToOBJ(result.geometry, 'my-envelope.obj');
 * ```
 */
export function exportToOBJ(
  geometry: THREE.BufferGeometry,
  filename: string = 'envelope.obj',
  objectName: string = 'BuildingEnvelope'
): void {
  const positionAttr = geometry.getAttribute('position');
  const normalAttr = geometry.getAttribute('normal');
  
  if (!positionAttr) {
    throw new Error('Geometry has no position attribute');
  }
  
  let objContent = `# ZoneWise.AI Building Envelope Export\n`;
  objContent += `# Generated: ${new Date().toISOString()}\n`;
  objContent += `# Units: Meters\n\n`;
  objContent += `o ${objectName}\n\n`;
  
  // Vertices
  objContent += `# Vertices (${positionAttr.count})\n`;
  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i);
    const y = positionAttr.getY(i);
    const z = positionAttr.getZ(i);
    objContent += `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
  }
  
  objContent += '\n';
  
  // Normals
  if (normalAttr) {
    objContent += `# Normals (${normalAttr.count})\n`;
    for (let i = 0; i < normalAttr.count; i++) {
      const nx = normalAttr.getX(i);
      const ny = normalAttr.getY(i);
      const nz = normalAttr.getZ(i);
      objContent += `vn ${nx.toFixed(6)} ${ny.toFixed(6)} ${nz.toFixed(6)}\n`;
    }
    objContent += '\n';
  }
  
  // Faces (triangles)
  objContent += `# Faces (${positionAttr.count / 3})\n`;
  for (let i = 0; i < positionAttr.count; i += 3) {
    const v1 = i + 1;
    const v2 = i + 2;
    const v3 = i + 3;
    
    if (normalAttr) {
      objContent += `f ${v1}//${v1} ${v2}//${v2} ${v3}//${v3}\n`;
    } else {
      objContent += `f ${v1} ${v2} ${v3}\n`;
    }
  }
  
  // Download
  const blob = new Blob([objContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export envelope with accompanying MTL material file
 */
export function exportToOBJWithMaterial(
  geometry: THREE.BufferGeometry,
  baseFilename: string = 'envelope',
  color: string = '#4A90D9'
): void {
  // Create OBJ with material reference
  const positionAttr = geometry.getAttribute('position');
  const normalAttr = geometry.getAttribute('normal');
  
  if (!positionAttr) {
    throw new Error('Geometry has no position attribute');
  }
  
  // Parse color
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  
  // MTL content
  let mtlContent = `# ZoneWise.AI Material File\n`;
  mtlContent += `# Generated: ${new Date().toISOString()}\n\n`;
  mtlContent += `newmtl EnvelopeMaterial\n`;
  mtlContent += `Ns 100.0\n`;
  mtlContent += `Ka 0.1 0.1 0.1\n`;
  mtlContent += `Kd ${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)}\n`;
  mtlContent += `Ks 0.3 0.3 0.3\n`;
  mtlContent += `d 0.7\n`;
  mtlContent += `illum 2\n`;
  
  // OBJ content
  let objContent = `# ZoneWise.AI Building Envelope Export\n`;
  objContent += `# Generated: ${new Date().toISOString()}\n`;
  objContent += `# Units: Meters\n\n`;
  objContent += `mtllib ${baseFilename}.mtl\n\n`;
  objContent += `o BuildingEnvelope\n`;
  objContent += `usemtl EnvelopeMaterial\n\n`;
  
  // Vertices
  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i);
    const y = positionAttr.getY(i);
    const z = positionAttr.getZ(i);
    objContent += `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
  }
  objContent += '\n';
  
  // Normals
  if (normalAttr) {
    for (let i = 0; i < normalAttr.count; i++) {
      const nx = normalAttr.getX(i);
      const ny = normalAttr.getY(i);
      const nz = normalAttr.getZ(i);
      objContent += `vn ${nx.toFixed(6)} ${ny.toFixed(6)} ${nz.toFixed(6)}\n`;
    }
    objContent += '\n';
  }
  
  // Faces
  for (let i = 0; i < positionAttr.count; i += 3) {
    const v1 = i + 1;
    const v2 = i + 2;
    const v3 = i + 3;
    if (normalAttr) {
      objContent += `f ${v1}//${v1} ${v2}//${v2} ${v3}//${v3}\n`;
    } else {
      objContent += `f ${v1} ${v2} ${v3}\n`;
    }
  }
  
  // Download MTL
  const mtlBlob = new Blob([mtlContent], { type: 'text/plain' });
  const mtlUrl = URL.createObjectURL(mtlBlob);
  const mtlLink = document.createElement('a');
  mtlLink.href = mtlUrl;
  mtlLink.download = `${baseFilename}.mtl`;
  document.body.appendChild(mtlLink);
  mtlLink.click();
  document.body.removeChild(mtlLink);
  URL.revokeObjectURL(mtlUrl);
  
  // Download OBJ
  const objBlob = new Blob([objContent], { type: 'text/plain' });
  const objUrl = URL.createObjectURL(objBlob);
  const objLink = document.createElement('a');
  objLink.href = objUrl;
  objLink.download = `${baseFilename}.obj`;
  document.body.appendChild(objLink);
  objLink.click();
  document.body.removeChild(objLink);
  URL.revokeObjectURL(objUrl);
}

// ============================================================================
// JSON Export
// ============================================================================

/**
 * Export envelope data as JSON for integration with other systems
 */
export function exportToJSON(
  dims: ZoningDIMS,
  result: EnvelopeResult,
  lotPolygon: GeoJSON.Feature<GeoJSON.Polygon>,
  filename: string = 'envelope-data.json'
): void {
  const data = {
    generated: new Date().toISOString(),
    generator: 'ZoneWise.AI Desktop V1',
    zoning: {
      district_code: dims.district_code,
      district_name: dims.district_name,
      jurisdiction: dims.jurisdiction,
      source_url: dims.source_url,
      verified_date: dims.verified_date
    },
    regulations: {
      max_height_ft: dims.max_height_ft,
      max_far: dims.max_far,
      min_lot_sqft: dims.min_lot_sqft,
      min_lot_width_ft: dims.min_lot_width_ft,
      setbacks_ft: dims.setbacks_ft
    },
    envelope: {
      max_buildable_area_sqft: result.maxBuildableArea,
      max_gfa_sqft: result.maxGFA,
      estimated_floors: result.maxFloors,
      envelope_volume_cf: result.envelopeVolume,
      center: result.center
    },
    lot: {
      polygon: lotPolygon.geometry,
      properties: lotPolygon.properties
    },
    setback_polygon: result.setbackPolygon.geometry
  };
  
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// GeoJSON Export
// ============================================================================

/**
 * Export lot and setback polygons as GeoJSON FeatureCollection
 */
export function exportToGeoJSON(
  lotPolygon: GeoJSON.Feature<GeoJSON.Polygon>,
  result: EnvelopeResult,
  dims: ZoningDIMS,
  filename: string = 'envelope.geojson'
): void {
  const featureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        ...lotPolygon,
        properties: {
          ...lotPolygon.properties,
          type: 'lot_boundary',
          district_code: dims.district_code
        }
      },
      {
        ...result.setbackPolygon,
        properties: {
          type: 'buildable_area',
          area_sqft: result.maxBuildableArea,
          max_gfa_sqft: result.maxGFA
        }
      }
    ]
  };
  
  const jsonContent = JSON.stringify(featureCollection, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
