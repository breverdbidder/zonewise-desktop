/**
 * AuctionsPanel — Full-width auction intelligence view
 * Replaces Chat + Artifacts when "Auction Intel" agent is active.
 *
 * Layout: Stats Cards → Filters → Scrollable Table + Detail Side Panel
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  X,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  ChevronDown,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://zonewise-agents.onrender.com'

interface AuctionRow {
  id: number
  county: string
  case_number: string
  property_address: string | null
  auction_type: string
  auction_date: string | null
  plaintiff: string | null
  defendant: string | null
  just_value: number | null
  centroid_lat: number | null
  centroid_lng: number | null
  is_vacant_land: boolean
  is_condo: boolean
  address_status: string | null
  parcel_id: string | null
  owner_name: string | null
  year_built: number | null
  total_living_area: number | null
  photo_url: string | null
}

interface SummaryData {
  total_rows: number
  by_county: Record<string, number>
  by_auction_type: Record<string, number>
  enrichment: {
    with_address: number
    address_rate: string
    vacant_land: number
    condos: number
  }
}

function formatCurrency(val: number | null): string {
  if (val == null) return '—'
  return '$' + val.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function formatDate(val: string | null): string {
  if (!val) return '—'
  const d = new Date(val + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function typeColor(type: string): string {
  return type === 'foreclosure' ? 'text-red-400' : 'text-amber-400'
}

function typeLabel(type: string): string {
  return type === 'foreclosure' ? 'FC' : type === 'tax_deed' ? 'TD' : type
}

export function AuctionsPanel({ onBack }: { onBack: () => void }) {
  const [auctions, setAuctions] = useState<AuctionRow[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AuctionRow | null>(null)
  const [countyFilter, setCountyFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch summary and auctions in parallel
      const [sumRes, auctRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/auctions/summary`, {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_BIDDEED_API_KEY || ''}` },
        }).catch(() => null),
        fetch(`${API_BASE}/api/v1/auctions?page=1&page_size=200`, {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_BIDDEED_API_KEY || ''}` },
        }).catch(() => null),
      ])

      if (sumRes?.ok) {
        setSummary(await sumRes.json())
      }

      if (auctRes?.ok) {
        const json = await auctRes.json()
        setAuctions(json.data || [])
      } else {
        // Fallback: try direct Supabase REST (for dev when BidDeed API isn't running)
        const sbUrl = 'https://mocerqjnksmhcjzxrewo.supabase.co'
        const sbKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        if (sbKey) {
          const fallback = await fetch(
            `${sbUrl}/rest/v1/multi_county_auctions?select=*&order=auction_date.desc.nullslast&limit=200`,
            { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } }
          )
          if (fallback.ok) setAuctions(await fallback.json())
          else setError('Failed to load auctions')
        } else {
          setError('API not available. Configure VITE_BIDDEED_API_KEY.')
        }
      }
    } catch (e) {
      setError('Network error — check API connection')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Apply filters
  const filtered = auctions.filter((a) => {
    if (countyFilter && a.county !== countyFilter) return false
    if (typeFilter && a.auction_type !== typeFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const searchable = [a.property_address, a.case_number, a.plaintiff, a.defendant, a.county]
        .filter(Boolean).join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })

  const counties = [...new Set(auctions.map((a) => a.county))].sort()

  return (
    <div className="flex-1 flex min-w-0 h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Chat
          </button>
          <div className="flex-1" />
          <h2 className="text-sm font-semibold text-white">
            Auction Intelligence
          </h2>
          <span className="text-xs text-slate-500">
            {filtered.length} of {auctions.length} auctions
          </span>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="px-4 py-3 grid grid-cols-4 gap-3 border-b border-border">
            <div className="bg-foreground/3 rounded-lg px-3 py-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-lg font-bold text-[#F59E0B]">{summary.total_rows}</p>
            </div>
            <div className="bg-foreground/3 rounded-lg px-3 py-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">With Address</p>
              <p className="text-lg font-bold text-white">{summary.enrichment.with_address}</p>
              <p className="text-[9px] text-slate-500">{summary.enrichment.address_rate}</p>
            </div>
            <div className="bg-foreground/3 rounded-lg px-3 py-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Vacant Land</p>
              <p className="text-lg font-bold text-white">{summary.enrichment.vacant_land}</p>
            </div>
            <div className="bg-foreground/3 rounded-lg px-3 py-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Counties</p>
              <p className="text-lg font-bold text-white">{Object.keys(summary.by_county).length}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-4 py-2 flex items-center gap-2 border-b border-border">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, case, party..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-foreground/3 border border-border rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#F59E0B]/30"
            />
          </div>
          <select
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-foreground/3 border border-border rounded-md text-slate-300 focus:outline-none"
          >
            <option value="">All Counties</option>
            {counties.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2 py-1.5 text-xs bg-foreground/3 border border-border rounded-md text-slate-300 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="foreclosure">Foreclosure</option>
            <option value="tax_deed">Tax Deed</option>
          </select>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">No auctions match your filters.</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--zw-sidebar-bg,#1E3A5F)] z-10">
                <tr className="text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="text-left px-3 py-2 font-medium">County</th>
                  <th className="text-left px-3 py-2 font-medium">Case #</th>
                  <th className="text-left px-3 py-2 font-medium">Address</th>
                  <th className="text-left px-3 py-2 font-medium">Type</th>
                  <th className="text-left px-3 py-2 font-medium">Value</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className={`cursor-pointer transition-colors ${
                      selected?.id === a.id
                        ? 'bg-[rgba(244,123,32,0.1)]'
                        : 'hover:bg-foreground/3'
                    }`}
                  >
                    <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{a.county}</td>
                    <td className="px-3 py-2 text-slate-400 font-mono whitespace-nowrap">{a.case_number}</td>
                    <td className="px-3 py-2 text-slate-200 max-w-[200px] truncate">
                      {a.property_address || (
                        <span className="text-slate-600 italic">{a.is_vacant_land ? 'Vacant' : 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`font-medium ${typeColor(a.auction_type)}`}>{typeLabel(a.auction_type)}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-300 whitespace-nowrap">{formatCurrency(a.just_value)}</td>
                    <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{formatDate(a.auction_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Side Panel */}
      {selected && (
        <div className="w-80 border-l border-border overflow-y-auto bg-foreground/2">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white truncate">
              {selected.property_address || 'No Address'}
            </h3>
            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="px-4 py-3 space-y-4">
            {/* Location */}
            {selected.centroid_lat && selected.centroid_lng && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img
                  src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+F59E0B(${selected.centroid_lng},${selected.centroid_lat})/${selected.centroid_lng},${selected.centroid_lat},13,0/320x180@2x?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || ''}`}
                  alt="Property location"
                  className="w-full h-[90px] object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <DetailRow icon={MapPin} label="County" value={selected.county} />
              <DetailRow icon={Calendar} label="Auction Date" value={formatDate(selected.auction_date)} />
              <DetailRow
                icon={DollarSign}
                label="Just Value"
                value={formatCurrency(selected.just_value)}
              />
              <DetailRow icon={Building} label="Type" value={
                <span className={typeColor(selected.auction_type)}>
                  {selected.auction_type === 'foreclosure' ? 'Foreclosure' : 'Tax Deed'}
                </span>
              } />

              {selected.plaintiff && (
                <DetailRow label="Plaintiff" value={selected.plaintiff} />
              )}
              {selected.defendant && (
                <DetailRow label="Defendant" value={selected.defendant} />
              )}
              {selected.year_built && (
                <DetailRow label="Year Built" value={String(selected.year_built)} />
              )}
              {selected.total_living_area && (
                <DetailRow label="Living Area" value={`${selected.total_living_area.toLocaleString()} sqft`} />
              )}
              {selected.parcel_id && (
                <DetailRow label="Parcel ID" value={<span className="font-mono">{selected.parcel_id}</span>} />
              )}
              {selected.owner_name && (
                <DetailRow label="Owner" value={selected.owner_name} />
              )}
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-1.5">
              {selected.is_vacant_land && (
                <span className="px-2 py-0.5 bg-gray-600/30 rounded text-[10px] text-slate-400">Vacant Land</span>
              )}
              {selected.is_condo && (
                <span className="px-2 py-0.5 bg-blue-600/20 rounded text-[10px] text-blue-400">Condo</span>
              )}
              {selected.address_status && (
                <span className="px-2 py-0.5 bg-amber-600/20 rounded text-[10px] text-amber-400">
                  {selected.address_status.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }: {
  icon?: typeof MapPin
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon size={12} className="text-slate-500 mt-0.5 shrink-0" />}
      <div className="min-w-0">
        <p className="text-slate-500 text-[10px] uppercase tracking-wider">{label}</p>
        <p className="text-slate-200 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  )
}
