import React, { useState, useEffect } from 'react'
import { X, Map, Building2, Sun, FileText, BarChart3, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { RightPanelContent } from '../CraftAgentLayout'

import MapboxHeatmap from '../MapboxHeatmap'

const API_BASE = import.meta.env.VITE_API_URL || 'https://zonewise-agents.onrender.com'

// ============================================================================
// Tab definitions
// ============================================================================

type TabId = 'map' | 'property' | '3d' | 'sun' | 'analytics' | 'export'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  { id: 'map', label: 'Map', icon: <Map className="size-4" /> },
  { id: 'property', label: 'Property', icon: <Building2 className="size-4" /> },
  { id: '3d', label: '3D', icon: <Building2 className="size-4" /> },
  { id: 'sun' as TabId, label: 'Sun', icon: <Sun className="size-4" /> },
  { id: 'analytics', label: 'Stats', icon: <BarChart3 className="size-4" /> },
  { id: 'export', label: 'Export', icon: <FileText className="size-4" /> },
]

// ============================================================================
// Map Panel - Static Mapbox image for now, upgradeable to interactive
// ============================================================================

function MapPanel({ data }: { data?: unknown }) {
  const mapData = data as { lat?: number; lng?: number; zoom?: number; auctions?: Array<{ id: string; lat: number; lng: number; status: 'BID' | 'REVIEW' | 'SKIP'; address?: string; judgment?: number; arv?: number }> } | undefined

  return (
    <div className="h-full flex flex-col">
      <div className="relative flex-1 rounded-lg overflow-hidden">
        <MapboxHeatmap
          auctions={mapData?.auctions || []}
          defaultCenter={[mapData?.lng || -80.6077, mapData?.lat || 28.3922]}
          defaultZoom={mapData?.zoom || 10}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Property Details Panel
// ============================================================================

function PropertyPanel({ data }: { data?: unknown }) {
  const property = data as Record<string, unknown> | undefined

  if (!property) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <p>Ask about a property to see details here</p>
      </div>
    )
  }

  const fields = Object.entries(property).filter(([, v]) => v != null)

  return (
    <ScrollArea className="h-full">
      <div className="p-1 space-y-3">
        {property.address && (
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-sm font-semibold">{String(property.address)}</p>
            {property.jurisdiction && (
              <p className="text-xs text-muted-foreground">{String(property.jurisdiction)}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {fields.map(([key, value]) => (
            <div key={key} className="bg-muted/50 rounded-md px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-sm font-medium truncate">{String(value)}</p>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

// ============================================================================
// 3D Building Envelope Panel (placeholder)
// ============================================================================

function ThreeDPanel({ data }: { data?: unknown }) {
  const envelope = data as { maxHeight?: number; setbacks?: Record<string, number>; far?: number } | undefined

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div className="w-48 h-48 relative">
        {/* Simple CSS 3D box placeholder */}
        <div className="absolute inset-0" style={{ perspective: '400px' }}>
          <div
            className="w-full h-full bg-primary/20 border-2 border-primary/40 rounded-lg"
            style={{
              transform: 'rotateX(15deg) rotateY(-20deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="size-12 text-primary/40" />
            </div>
          </div>
        </div>
      </div>
      {envelope ? (
        <div className="text-center space-y-1">
          {envelope.maxHeight && (
            <p className="text-sm">Max Height: <span className="font-semibold">{envelope.maxHeight} ft</span></p>
          )}
          {envelope.far && (
            <p className="text-sm">FAR: <span className="font-semibold">{envelope.far}</span></p>
          )}
          {envelope.setbacks && (
            <div className="text-xs text-muted-foreground">
              Front: {envelope.setbacks.front || '—'}′ · Side: {envelope.setbacks.side || '—'}′ · Rear: {envelope.setbacks.rear || '—'}′
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Ask about setbacks to generate 3D envelope
        </p>
      )}
    </div>
  )
}

// ============================================================================
// Analytics Panel
// ============================================================================

function AnalyticsPanel() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Loading stats...
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-1">
        <h3 className="text-sm font-semibold">Platform Statistics</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-primary">
                {typeof value === 'number' ? value.toLocaleString() : String(value)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {key.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

// ============================================================================
// Sun & Shadow Panel
// ============================================================================

function SunPanel({ data }: { data?: unknown }) {
  const sunData = data as { lat?: number; lng?: number; date?: string } | undefined

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <Sun className="size-12 text-amber-400/60" />
      <div>
        <p className="text-sm font-medium">Sun & Shadow Analysis</p>
        {sunData?.lat ? (
          <p className="text-xs text-muted-foreground mt-1">
            Location: {sunData.lat.toFixed(4)}, {sunData.lng?.toFixed(4)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Ask about a property's solar exposure to generate sun/shadow study
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Export Panel
// ============================================================================

function ExportPanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <FileText className="size-12 text-muted-foreground/30" />
      <div>
        <p className="text-sm font-medium">Export Reports</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Ask the AI to "create a full report" for any property to generate PDF/DOCX exports
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Right Panel Component
// ============================================================================

interface RightPanelProps {
  content: RightPanelContent
  onClose: () => void
}

export function RightPanel({ content, onClose }: RightPanelProps) {
  // Map content type to initial tab
  const getInitialTab = (): TabId => {
    switch (content.type) {
      case 'property': return 'property'
      case 'map': return 'map'
      case '3d': return '3d'
      case 'sun-shadow': return 'sun'
      case 'export': return 'export'
      case 'documents': return 'export'
      default: return 'map'
    }
  }

  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab)

  // Update tab when content changes
  useEffect(() => {
    if (content.type !== 'none') {
      setActiveTab(getInitialTab())
    }
  }, [content.type])

  return (
    <div className="w-96 border-l border-border bg-background flex flex-col">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-border">
        <div className="flex-1 flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              <span className="hidden xl:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 mr-1"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-4 overflow-hidden">
        {activeTab === 'map' && <MapPanel data={content.type === 'map' ? content.data : undefined} />}
        {activeTab === 'property' && <PropertyPanel data={content.type === 'property' ? content.data : undefined} />}
        {activeTab === '3d' && <ThreeDPanel data={content.type === '3d' ? content.data : undefined} />}
        {activeTab === 'sun' && <SunPanel data={content.type === 'sun-shadow' ? content.data : undefined} />}
        {activeTab === 'analytics' && <AnalyticsPanel />}
        {activeTab === 'export' && <ExportPanel />}
      </div>
    </div>
  )
}
