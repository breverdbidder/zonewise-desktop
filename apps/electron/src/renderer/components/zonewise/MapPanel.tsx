import React, { useRef, useEffect, useState, useCallback } from 'react';

// Mapbox GL JS will be loaded via CDN in the HTML
declare const mapboxgl: any;

interface ZoningDistrict {
  id: number;
  jurisdiction_id: number;
  code: string;
  name: string;
  category: string;
  description: string;
}

interface MapPanelProps {
  accessToken: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  onDistrictSelect?: (district: ZoningDistrict) => void;
  highlightedCode?: string;
  center?: [number, number];
  zoom?: number;
}

// Brevard County jurisdiction centers
const JURISDICTION_CENTERS: Record<number, [number, number]> = {
  1: [-80.6081, 28.0836],   // Melbourne
  2: [-80.5887, 27.9606],   // Palm Bay
  3: [-80.5887, 28.1472],   // Indian Harbour Beach
  4: [-80.8076, 28.6122],   // Titusville
  5: [-80.7420, 28.3861],   // Cocoa
  6: [-80.5901, 28.1761],   // Satellite Beach
  7: [-80.6078, 28.3200],   // Cocoa Beach
  8: [-80.7248, 28.3169],   // Rockledge
  9: [-80.6519, 28.0722],   // West Melbourne
  10: [-80.6056, 28.4058],  // Cape Canaveral
  11: [-80.5656, 28.0897],  // Indialantic
  12: [-80.5617, 28.0681],  // Melbourne Beach
  13: [-80.7000, 28.3000],  // Unincorporated Brevard (center)
  14: [-80.5667, 28.0000],  // Malabar
  15: [-80.5500, 27.9400],  // Grant-Valkaria
  16: [-80.5833, 28.1167],  // Palm Shores
  17: [-80.6700, 28.0800],  // Melbourne Village
};

// Category colors matching ZoneWise theme
const CATEGORY_COLORS: Record<string, string> = {
  'Residential': '#10B981',      // Green
  'Commercial': '#0D9488',       // Teal
  'Industrial': '#6366F1',       // Indigo
  'Mixed-Use': '#8B5CF6',        // Purple
  'Agricultural': '#84CC16',     // Lime
  'Conservation': '#22C55E',     // Emerald
  'Planned Development': '#F59E0B', // Amber
  'default': '#1E3A5F',          // Navy (ZoneWise primary)
};

export const MapPanel: React.FC<MapPanelProps> = ({
  accessToken,
  supabaseUrl = 'https://mocerqjnksmhcjzxrewo.supabase.co',
  supabaseKey,
  onDistrictSelect,
  highlightedCode,
  center = [-80.6081, 28.2500], // Brevard County center
  zoom = 9,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [districts, setDistricts] = useState<ZoningDistrict[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<number | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if mapboxgl is available
    if (typeof mapboxgl === 'undefined') {
      console.error('Mapbox GL JS not loaded');
      return;
    }

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom,
      pitch: 0,
      bearing: 0,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add scale
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      setIsLoaded(true);
      
      // Add jurisdiction markers
      Object.entries(JURISDICTION_CENTERS).forEach(([id, coords]) => {
        const el = document.createElement('div');
        el.className = 'jurisdiction-marker';
        el.style.cssText = `
          width: 12px;
          height: 12px;
          background: #1E3A5F;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        
        new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map.current);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, center, zoom]);

  // Fetch districts when Supabase key is available
  useEffect(() => {
    if (!supabaseKey) return;

    const fetchDistricts = async () => {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/zoning_districts?select=id,jurisdiction_id,code,name,category,description`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }
        );
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error('Failed to fetch districts:', error);
      }
    };

    fetchDistricts();
  }, [supabaseUrl, supabaseKey]);

  // Fly to jurisdiction
  const flyToJurisdiction = useCallback((jurisdictionId: number) => {
    if (!map.current || !JURISDICTION_CENTERS[jurisdictionId]) return;
    
    setSelectedJurisdiction(jurisdictionId);
    map.current.flyTo({
      center: JURISDICTION_CENTERS[jurisdictionId],
      zoom: 12,
      duration: 1500,
    });
  }, []);

  // Get districts for selected jurisdiction
  const jurisdictionDistricts = districts.filter(
    d => d.jurisdiction_id === selectedJurisdiction
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#1E3A5F] text-white">
        <h2 className="text-lg font-semibold">ZoneWise Map</h2>
        <p className="text-sm text-gray-300">Brevard County, Florida</p>
      </div>

      {/* Jurisdiction selector */}
      <div className="px-4 py-2 border-b bg-gray-50">
        <select
          className="w-full px-3 py-2 border rounded-md text-sm"
          value={selectedJurisdiction || ''}
          onChange={(e) => flyToJurisdiction(Number(e.target.value))}
        >
          <option value="">Select Jurisdiction...</option>
          <option value="1">Melbourne (26 districts)</option>
          <option value="2">Palm Bay (25 districts)</option>
          <option value="3">Indian Harbour Beach (12 districts)</option>
          <option value="4">Titusville (40 districts)</option>
          <option value="5">Cocoa (21 districts)</option>
          <option value="6">Satellite Beach (8 districts)</option>
          <option value="7">Cocoa Beach (12 districts)</option>
          <option value="8">Rockledge (21 districts)</option>
          <option value="9">West Melbourne (11 districts)</option>
          <option value="10">Cape Canaveral (9 districts)</option>
          <option value="11">Indialantic (8 districts)</option>
          <option value="12">Melbourne Beach (8 districts)</option>
          <option value="13">Unincorporated Brevard (54 districts)</option>
          <option value="14">Malabar (13 districts)</option>
          <option value="15">Grant-Valkaria (6 districts)</option>
          <option value="16">Palm Shores (4 districts)</option>
          <option value="17">Melbourne Village (23 districts)</option>
        </select>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-gray-500">Loading map...</div>
          </div>
        )}
      </div>

      {/* District list for selected jurisdiction */}
      {selectedJurisdiction && jurisdictionDistricts.length > 0 && (
        <div className="max-h-48 overflow-y-auto border-t">
          <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 sticky top-0">
            Districts ({jurisdictionDistricts.length})
          </div>
          {jurisdictionDistricts.map((district) => (
            <div
              key={district.id}
              className="px-4 py-2 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onDistrictSelect?.(district)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[district.category] || CATEGORY_COLORS.default }}
                />
                <span className="font-medium text-sm">{district.code}</span>
                <span className="text-gray-500 text-sm">- {district.name}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{district.category}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapPanel;
