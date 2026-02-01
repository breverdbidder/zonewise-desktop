import * as THREE from 'three';

/**
 * Export canvas as PNG screenshot
 */
export function exportToPNG(canvas: HTMLCanvasElement, filename: string = 'zonewise-export.png') {
  try {
    // Create a link element
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (error) {
    console.error('PNG export failed:', error);
    return false;
  }
}

/**
 * Export 3D geometry as OBJ file
 */
export function exportToOBJ(
  buildableWidth: number,
  buildableDepth: number,
  buildableHeight: number,
  frontSetback: number,
  rearSetback: number,
  filename: string = 'zonewise-building-envelope.obj'
) {
  try {
    // Create OBJ file content
    const vertices: string[] = [];
    const faces: string[] = [];

    // Calculate building position
    const offsetZ = (frontSetback - rearSetback) / 2;

    // Define 8 vertices of the building envelope box
    const halfWidth = buildableWidth / 2;
    const halfDepth = buildableDepth / 2;

    // Bottom vertices (y = 0)
    vertices.push(`v ${-halfWidth} 0 ${-halfDepth + offsetZ}`); // 1
    vertices.push(`v ${halfWidth} 0 ${-halfDepth + offsetZ}`);  // 2
    vertices.push(`v ${halfWidth} 0 ${halfDepth + offsetZ}`);   // 3
    vertices.push(`v ${-halfWidth} 0 ${halfDepth + offsetZ}`);  // 4

    // Top vertices (y = buildableHeight)
    vertices.push(`v ${-halfWidth} ${buildableHeight} ${-halfDepth + offsetZ}`); // 5
    vertices.push(`v ${halfWidth} ${buildableHeight} ${-halfDepth + offsetZ}`);  // 6
    vertices.push(`v ${halfWidth} ${buildableHeight} ${halfDepth + offsetZ}`);   // 7
    vertices.push(`v ${-halfWidth} ${buildableHeight} ${halfDepth + offsetZ}`);  // 8

    // Define faces (counter-clockwise winding)
    // Bottom face
    faces.push('f 1 2 3 4');
    // Top face
    faces.push('f 5 6 7 8');
    // Front face
    faces.push('f 1 2 6 5');
    // Right face
    faces.push('f 2 3 7 6');
    // Back face
    faces.push('f 3 4 8 7');
    // Left face
    faces.push('f 4 1 5 8');

    // Combine into OBJ format
    const objContent = [
      '# ZoneWise Building Envelope Export',
      `# Generated: ${new Date().toISOString()}`,
      `# Dimensions: ${buildableWidth}ft x ${buildableDepth}ft x ${buildableHeight}ft`,
      '',
      ...vertices,
      '',
      ...faces,
    ].join('\n');

    // Create blob and download
    const blob = new Blob([objContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);

    return true;
  } catch (error) {
    console.error('OBJ export failed:', error);
    return false;
  }
}

/**
 * Export property data as GeoJSON
 */
export function exportToGeoJSON(
  latitude: number,
  longitude: number,
  lotWidth: number,
  lotDepth: number,
  propertyData: {
    jurisdiction?: string;
    district?: string;
    address?: string;
    dimensions?: any;
  },
  filename: string = 'zonewise-property.geojson'
) {
  try {
    // Convert lot dimensions from feet to approximate degrees
    // (very rough approximation for visualization)
    const latOffset = (lotDepth / 2) * 0.00000274; // feet to degrees latitude
    const lngOffset = (lotWidth / 2) * 0.00000274; // feet to degrees longitude

    // Create property boundary polygon
    const coordinates = [
      [
        [longitude - lngOffset, latitude + latOffset],
        [longitude + lngOffset, latitude + latOffset],
        [longitude + lngOffset, latitude - latOffset],
        [longitude - lngOffset, latitude - latOffset],
        [longitude - lngOffset, latitude + latOffset], // Close the polygon
      ],
    ];

    // Create GeoJSON FeatureCollection
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: coordinates,
          },
          properties: {
            name: propertyData.address || 'Unknown Property',
            jurisdiction: propertyData.jurisdiction || 'Unknown',
            district: propertyData.district || 'Unknown',
            lotWidth: lotWidth,
            lotDepth: lotDepth,
            center: {
              latitude: latitude,
              longitude: longitude,
            },
            dimensions: propertyData.dimensions || {},
            exportedAt: new Date().toISOString(),
            exportedBy: 'ZoneWise.AI',
          },
        },
      ],
    };

    // Create blob and download
    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/geo+json',
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);

    return true;
  } catch (error) {
    console.error('GeoJSON export failed:', error);
    return false;
  }
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(
  prefix: string,
  extension: string,
  address?: string
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const sanitizedAddress = address
    ? address.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)
    : 'property';
  return `${prefix}-${sanitizedAddress}-${timestamp}.${extension}`;
}
