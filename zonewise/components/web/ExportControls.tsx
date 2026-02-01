import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileImage, Box, Map, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportToPNG, exportToOBJ, exportToGeoJSON, generateExportFilename } from '@/lib/exportUtils';
import { trpc } from '@/lib/trpc';

interface ExportControlsProps {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  propertyData: {
    jurisdiction?: string;
    district?: string;
    address?: string;
    dimensions?: any;
    lotWidth?: number;
    lotDepth?: number;
    latitude?: number;
    longitude?: number;
  };
}

export default function ExportControls({ canvasRef, propertyData }: ExportControlsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  // Track export mutation
  const trackExportMutation = trpc.exports.trackExport.useMutation({
    onError: (error: any) => {
      console.error('Failed to track export:', error);
    },
  });

  // Parse dimensions
  const parseNumeric = (value?: string): number | null => {
    if (!value) return null;
    const match = value.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  };

  const frontSetback = parseNumeric(propertyData.dimensions?.front_setback) || 25;
  const rearSetback = parseNumeric(propertyData.dimensions?.rear_setback) || 20;
  const sideSetback = parseNumeric(propertyData.dimensions?.side_setback) || 10;
  const maxHeight = parseNumeric(propertyData.dimensions?.max_height) || 35;
  const lotWidth = propertyData.lotWidth || 100;
  const lotDepth = propertyData.lotDepth || 150;

  const buildableWidth = lotWidth - sideSetback * 2;
  const buildableDepth = lotDepth - frontSetback - rearSetback;
  const buildableHeight = maxHeight;

  const handleExportPNG = async () => {
    if (!canvasRef?.current) {
      toast.error('Canvas not available for export');
      return;
    }

    setExporting('png');
    try {
      const filename = generateExportFilename('zonewise-screenshot', 'png', propertyData.address);
      const success = exportToPNG(canvasRef.current, filename);

      if (success) {
        toast.success('PNG exported successfully!');
        // Track export
        trackExportMutation.mutate({
          format: 'png',
          filename,
        });
      } else {
        toast.error('PNG export failed');
      }
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportOBJ = async () => {
    setExporting('obj');
    try {
      const filename = generateExportFilename('zonewise-3d-model', 'obj', propertyData.address);
      const success = exportToOBJ(buildableWidth, buildableDepth, buildableHeight, frontSetback, rearSetback, filename);

      if (success) {
        toast.success('OBJ model exported successfully!');
        // Track export
        trackExportMutation.mutate({
          format: 'obj',
          filename,
        });
      } else {
        toast.error('OBJ export failed');
      }
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportGeoJSON = async () => {
    if (!propertyData.latitude || !propertyData.longitude) {
      toast.error('Location data not available');
      return;
    }

    setExporting('geojson');
    try {
      const filename = generateExportFilename('zonewise-property', 'geojson', propertyData.address);
      const success = exportToGeoJSON(
        propertyData.latitude,
        propertyData.longitude,
        lotWidth,
        lotDepth,
        {
          jurisdiction: propertyData.jurisdiction,
          district: propertyData.district,
          address: propertyData.address,
          dimensions: propertyData.dimensions,
        },
        filename
      );

      if (success) {
        toast.success('GeoJSON exported successfully!');
        // Track export
        trackExportMutation.mutate({
          format: 'geojson',
          filename,
        });
      } else {
        toast.error('GeoJSON export failed');
      }
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
        <CardDescription>Download property analysis in various formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleExportPNG}
          disabled={exporting !== null || !canvasRef?.current}
        >
          {exporting === 'png' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileImage className="h-4 w-4 mr-2" />
          )}
          Export as PNG Screenshot
        </Button>

        <Button variant="outline" className="w-full justify-start" onClick={handleExportOBJ} disabled={exporting !== null}>
          {exporting === 'obj' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Box className="h-4 w-4 mr-2" />}
          Export as OBJ 3D Model
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleExportGeoJSON}
          disabled={exporting !== null || !propertyData.latitude || !propertyData.longitude}
        >
          {exporting === 'geojson' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Map className="h-4 w-4 mr-2" />}
          Export as GeoJSON
        </Button>

        <div className="pt-3 border-t text-xs text-muted-foreground space-y-1">
          <p>• PNG: High-resolution screenshot of 3D visualization</p>
          <p>• OBJ: 3D model file compatible with CAD software</p>
          <p>• GeoJSON: Geographic data for GIS applications</p>
        </div>
      </CardContent>
    </Card>
  );
}
