import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

type MapStyle = 'satellite' | 'dark' | 'light'
type Metric = 'value' | 'rent' | 'inventory' | 'dom'

const STYLES: Record<MapStyle, string> = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
}

interface AuctionMarker {
  id: string
  lat: number
  lng: number
  status: 'BID' | 'REVIEW' | 'SKIP'
  address?: string
  judgment?: number
  arv?: number
}

interface MapboxHeatmapProps {
  auctions?: AuctionMarker[]
  defaultCenter?: [number, number]
  defaultZoom?: number
  onParcelClick?: (parcelId: string) => void
}

export default function MapboxHeatmap({
  auctions = [],
  defaultCenter = [-81.5, 28.4],
  defaultZoom = 7.5,
  onParcelClick,
}: MapboxHeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark')
  const [metric, setMetric] = useState<Metric>('value')
  const [layers, setLayers] = useState({ heatmap: true, foreclosures: true, parcels: false })

  useEffect(() => {
    if (!mapContainer.current || map.current) return
    mapboxgl.accessToken = MAPBOX_TOKEN
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: STYLES[mapStyle],
      center: defaultCenter,
      zoom: defaultZoom,
      pitch: 30,
    })
    const m = map.current
    m.addControl(new mapboxgl.NavigationControl(), 'top-right')
    m.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'imperial' }), 'bottom-left')

    m.on('load', () => {
      // Foreclosure markers as GeoJSON source
      if (auctions.length > 0) {
        m.addSource('auctions', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: auctions.map(a => ({
              type: 'Feature' as const,
              geometry: { type: 'Point' as const, coordinates: [a.lng, a.lat] },
              properties: { id: a.id, status: a.status, address: a.address || '', judgment: a.judgment || 0, arv: a.arv || 0 },
            })),
          },
          cluster: true,
          clusterMaxZoom: 12,
          clusterRadius: 50,
        })

        // Cluster circles
        m.addLayer({
          id: 'auction-clusters',
          type: 'circle',
          source: 'auctions',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#F59E0B',
            'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 32],
            'circle-opacity': 0.85,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#020617',
          },
        })

        // Cluster count labels
        m.addLayer({
          id: 'auction-cluster-count',
          type: 'symbol',
          source: 'auctions',
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 13 },
          paint: { 'text-color': '#020617' },
        })

        // Individual auction markers
        m.addLayer({
          id: 'auction-points',
          type: 'circle',
          source: 'auctions',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'match', ['get', 'status'],
              'BID', '#22C55E',
              'REVIEW', '#F59E0B',
              'SKIP', '#EF4444',
              '#94A3B8',
            ],
            'circle-radius': 7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#020617',
          },
        })

        // Popup on click
        m.on('click', 'auction-points', (e) => {
          if (!e.features?.[0]) return
          const p = e.features[0].properties!
          const coords = (e.features[0].geometry as any).coordinates.slice()
          new mapboxgl.Popup({ closeButton: true, className: 'auction-popup' })
            .setLngLat(coords)
            .setHTML(`
              <div style="font-family:Inter,sans-serif;padding:4px">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                  <span style="background:${p.status === 'BID' ? '#22C55E' : p.status === 'REVIEW' ? '#F59E0B' : '#EF4444'};color:#020617;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700">${p.status}</span>
                </div>
                <div style="font-size:13px;font-weight:600;margin-bottom:4px">${p.address || 'Property'}</div>
                ${p.judgment ? `<div style="font-size:12px;color:#94A3B8">Judgment: $${Number(p.judgment).toLocaleString()}</div>` : ''}
                ${p.arv ? `<div style="font-size:12px;color:#94A3B8">ARV: $${Number(p.arv).toLocaleString()}</div>` : ''}
              </div>
            `)
            .addTo(m)
        })

        m.on('click', 'auction-clusters', (e) => {
          const features = m.queryRenderedFeatures(e.point, { layers: ['auction-clusters'] })
          if (!features[0]) return
          const clusterId = features[0].properties!.cluster_id
          ;(m.getSource('auctions') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return
            m.easeTo({ center: (features[0].geometry as any).coordinates, zoom })
          })
        })
      }
    })

    return () => { m.remove(); map.current = null }
  }, [])

  // Style change
  useEffect(() => {
    if (!map.current) return
    map.current.setStyle(STYLES[mapStyle])
  }, [mapStyle])

  const statusColors = [
    { label: 'BID', color: '#22C55E' },
    { label: 'REVIEW', color: '#F59E0B' },
    { label: 'SKIP', color: '#EF4444' },
  ]

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-[#1E3A5F]/30">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Controls — top right */}
      <div className="absolute top-3 right-14 z-10 flex flex-col gap-2">
        {/* Style toggle */}
        <div className="bg-[#0F172A]/90 backdrop-blur rounded-lg p-1 flex gap-1">
          {(['satellite', 'dark', 'light'] as MapStyle[]).map(s => (
            <button key={s} onClick={() => setMapStyle(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mapStyle === s ? 'bg-[#F59E0B] text-[#020617]' : 'text-slate-300 hover:text-white'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Layer toggles */}
        <div className="bg-[#0F172A]/90 backdrop-blur rounded-lg p-2 flex flex-col gap-1.5">
          {Object.entries(layers).map(([key, on]) => (
            <label key={key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" checked={on} onChange={() => setLayers(l => ({ ...l, [key]: !l[key as keyof typeof l] }))}
                className="rounded border-slate-600" />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Legend — bottom left */}
      <div className="absolute bottom-8 left-3 z-10 bg-[#0F172A]/90 backdrop-blur rounded-lg p-3">
        <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Foreclosure Status</div>
        <div className="flex flex-col gap-1.5">
          {statusColors.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
              <span className="text-xs text-slate-300">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metric selector — top left */}
      <div className="absolute top-3 left-3 z-10">
        <select value={metric} onChange={e => setMetric(e.target.value as Metric)}
          className="bg-[#0F172A]/90 backdrop-blur text-slate-300 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:border-[#F59E0B] outline-none">
          <option value="value">Home Value</option>
          <option value="rent">Rent</option>
          <option value="inventory">Inventory</option>
          <option value="dom">Days on Market</option>
        </select>
      </div>
    </div>
  )
}
