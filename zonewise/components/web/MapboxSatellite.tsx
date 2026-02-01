import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Layers } from 'lucide-react';

// Mapbox token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw';

interface MapboxSatelliteProps {
  latitude?: number;
  longitude?: number;
  lotWidth?: number;
  lotDepth?: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

export default function MapboxSatellite({
  latitude = 28.3922, // Brevard County, FL default
  longitude = -80.6077,
  lotWidth = 100,
  lotDepth = 150,
  onLocationChange,
}: MapboxSatelliteProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [longitude, latitude],
      zoom: 18,
      pitch: 45,
      bearing: 0,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'imperial',
      }),
      'bottom-left'
    );

    // Add marker for property location
    marker.current = new mapboxgl.Marker({
      color: '#3b82f6',
      draggable: true,
    })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Handle marker drag
    marker.current.on('dragend', () => {
      if (!marker.current) return;
      const lngLat = marker.current.getLngLat();
      onLocationChange?.(lngLat.lat, lngLat.lng);
    });

    // Add property boundary overlay
    map.current.on('load', () => {
      if (!map.current) return;

      // Convert lot dimensions from feet to approximate degrees
      // (very rough approximation for visualization)
      const latOffset = (lotDepth / 2) * 0.00000274; // feet to degrees latitude
      const lngOffset = (lotWidth / 2) * 0.00000274; // feet to degrees longitude

      // Create property boundary polygon
      map.current.addSource('property-boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [longitude - lngOffset, latitude + latOffset],
                [longitude + lngOffset, latitude + latOffset],
                [longitude + lngOffset, latitude - latOffset],
                [longitude - lngOffset, latitude - latOffset],
                [longitude - lngOffset, latitude + latOffset],
              ],
            ],
          },
          properties: {},
        },
      });

      // Add property boundary layer (fill)
      map.current.addLayer({
        id: 'property-fill',
        type: 'fill',
        source: 'property-boundary',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.2,
        },
      });

      // Add property boundary layer (outline)
      map.current.addLayer({
        id: 'property-outline',
        type: 'line',
        source: 'property-boundary',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
        },
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update marker position when props change
  useEffect(() => {
    if (marker.current && map.current) {
      marker.current.setLngLat([longitude, latitude]);
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 18,
      });

      // Update property boundary
      if (map.current.getSource('property-boundary')) {
        const latOffset = (lotDepth / 2) * 0.00000274;
        const lngOffset = (lotWidth / 2) * 0.00000274;

        (map.current.getSource('property-boundary') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [longitude - lngOffset, latitude + latOffset],
                [longitude + lngOffset, latitude + latOffset],
                [longitude + lngOffset, latitude - latOffset],
                [longitude - lngOffset, latitude - latOffset],
                [longitude - lngOffset, latitude + latOffset],
              ],
            ],
          },
          properties: {},
        });
      }
    }
  }, [latitude, longitude, lotWidth, lotDepth]);

  // Geocode address search
  const handleSearch = async () => {
    if (!searchAddress.trim() || !map.current) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchAddress
        )}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=US`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        if (marker.current && map.current) {
          marker.current.setLngLat([lng, lat]);
          map.current.flyTo({
            center: [lng, lat],
            zoom: 18,
            pitch: 45,
          });
          onLocationChange?.(lat, lng);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter property address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>Loading...</>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Current: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </CardContent>
      </Card>

      {/* Map container */}
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-border">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg p-4 text-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 opacity-20 border-2 border-blue-500 rounded"></div>
            <span>Property Boundary</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>Property Center</span>
          </div>
        </div>

        {/* Info overlay */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-lg p-3 text-xs space-y-1">
          <div className="flex items-center gap-2 font-medium">
            <Layers className="h-3 w-3" />
            <span>Satellite View</span>
          </div>
          <p className="text-muted-foreground">Drag marker to reposition</p>
          <p className="text-muted-foreground">Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
}
