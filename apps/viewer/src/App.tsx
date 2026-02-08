/**
 * ZoneWise.AI — Florida Zoning Intelligence Platform
 *
 * CraftAgents OSS fork with full split-screen:
 *  - Left:  Session sidebar + NLP chat (SSE streaming to zonewise-agents backend)
 *  - Right: Tabbed panels — Map (Mapbox), 3D envelope, Analytics, Export
 *
 * Powered by Claude Opus 4.6 · 67 Florida Counties · Real-Time Data
 *
 * @module ZoneWise
 * @version 2.0.0
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import {
  Markdown,
  Spinner,
  cn,
  TooltipProvider,
} from '@craft-agent/ui'

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || 'https://zonewise-agents.onrender.com'
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface ChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
  preview?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  intent?: string
  data?: unknown
}

type RightTab = 'map' | '3d' | 'stats' | 'export'
type Lang = 'en' | 'he' | 'es' | 'pt' | 'fr' | 'ar' | 'ht'

const LANGS: Record<Lang, { flag: string; name: string; dir: 'ltr' | 'rtl'; placeholder: string }> = {
  en: { flag: '🇺🇸', name: 'English', dir: 'ltr', placeholder: 'Ask about any Florida property, zoning code, or district...' },
  he: { flag: '🇮🇱', name: 'עברית', dir: 'rtl', placeholder: '...שאל על נכס, אזור, או היתר בנייה' },
  es: { flag: '🇪🇸', name: 'Español', dir: 'ltr', placeholder: 'Pregunte sobre cualquier propiedad en Florida...' },
  pt: { flag: '🇧🇷', name: 'Português', dir: 'ltr', placeholder: 'Pergunte sobre qualquer propriedade na Flórida...' },
  fr: { flag: '🇫🇷', name: 'Français', dir: 'ltr', placeholder: 'Posez une question sur n\'importe quelle propriété en Floride...' },
  ar: { flag: '🇸🇦', name: 'العربية', dir: 'rtl', placeholder: '...اسأل عن أي عقار في فلوريدا' },
  ht: { flag: '🇭🇹', name: 'Kreyòl', dir: 'ltr', placeholder: 'Mande sou nenpòt pwopriyete nan Florid...' },
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const storage = {
  getSessions(): ChatSession[] { try { return JSON.parse(localStorage.getItem('zw_sessions') || '[]') } catch { return [] } },
  saveSessions(s: ChatSession[]) { localStorage.setItem('zw_sessions', JSON.stringify(s)) },
  getMessages(id: string): ChatMessage[] { try { return JSON.parse(localStorage.getItem(`zw_msg_${id}`) || '[]') } catch { return [] } },
  saveMessages(id: string, m: ChatMessage[]) { localStorage.setItem(`zw_msg_${id}`, JSON.stringify(m)) },
  deleteMessages(id: string) { localStorage.removeItem(`zw_msg_${id}`) },
}

const STARTERS = [
  { emoji: '🏠', text: 'What can I build at 625 Ocean St, Satellite Beach?' },
  { emoji: '📊', text: 'Show me all zoning districts in Brevard County' },
  { emoji: '📋', text: 'Create a full report for Palm Bay R-1 zone' },
  { emoji: '🔍', text: 'Compare setbacks: R-1 vs R-2 in Melbourne' },
]

// ═══════════════════════════════════════════════════════════════
// ICONS (Lucide-compatible inline SVG)
// ═══════════════════════════════════════════════════════════════

function SvgIcon({ d, size = 16, className = '' }: { d: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  )
}

const ICON = {
  plus: 'M12 5v14M5 12h14',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z',
  building: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4',
  chart: 'M18 20V10M12 20V4M6 20v-6',
  x: 'M18 6L6 18M6 6l12 12',
  menu: 'M3 12h18M3 6h18M3 18h18',
  chevL: 'M15 18l-6-6 6-6',
  chevR: 'M9 18l6-6-6 6',
  search: 'M11 17.25a6.25 6.25 0 110-12.5 6.25 6.25 0 010 12.5zM16 16l4.5 4.5',
  trash: 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2',
  sparkle: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z',
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6',
  msg: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
}

// ═══════════════════════════════════════════════════════════════
// SESSION SIDEBAR
// ═══════════════════════════════════════════════════════════════

function SessionSidebar({
  sessions, activeId, onSelect, onNew, onDelete, collapsed, onToggle,
}: {
  sessions: ChatSession[]; activeId: string | null
  onSelect: (id: string) => void; onNew: () => void
  onDelete: (id: string) => void; collapsed: boolean; onToggle: () => void
}) {
  const [search, setSearch] = useState('')
  const filtered = sessions.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()))

  if (collapsed) return (
    <div className="w-12 border-r border-border bg-foreground-2 flex flex-col items-center py-4 gap-2">
      <button onClick={onToggle} className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground">
        <SvgIcon d={ICON.chevR} />
      </button>
      <button onClick={onNew} className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground">
        <SvgIcon d={ICON.plus} />
      </button>
    </div>
  )

  return (
    <div className="w-64 border-r border-border bg-foreground-2 flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sessions</span>
          <div className="flex gap-1">
            <button onClick={onNew} className="p-1.5 rounded-md hover:bg-foreground/5 text-muted-foreground" title="New chat">
              <SvgIcon d={ICON.plus} size={14} />
            </button>
            <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-foreground/5 text-muted-foreground">
              <SvgIcon d={ICON.chevL} size={14} />
            </button>
          </div>
        </div>
        <div className="relative">
          <SvgIcon d={ICON.search} size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">
            {search ? 'No matches' : 'No sessions yet'}
          </p>
        ) : filtered.map(s => (
          <div key={s.id} onClick={() => onSelect(s.id)}
            className={cn(
              'group relative px-3 py-2 rounded-lg cursor-pointer transition-colors',
              s.id === activeId ? 'bg-accent text-accent-foreground' : 'hover:bg-foreground/5 text-foreground'
            )}>
            <div className="flex items-start gap-2">
              <SvgIcon d={ICON.msg} size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate pr-5">{s.title}</div>
                {s.preview && <div className="text-[11px] text-muted-foreground truncate mt-0.5">{s.preview}</div>}
                <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(s.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); onDelete(s.id) }}
              className="absolute right-2 top-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
              <SvgIcon d={ICON.trash} size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border text-center">
        <span className="text-[10px] text-muted-foreground">ZoneWise.AI · 67 FL Counties · Opus 4.6</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// RIGHT PANEL
// ═══════════════════════════════════════════════════════════════

function RightPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<RightTab>('map')
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (tab === 'stats') {
      fetch(`${API_BASE}/api/stats`).then(r => r.json()).then(setStats).catch(() => {})
    }
  }, [tab])

  if (!visible) return null

  const tabs: { id: RightTab; icon: string; label: string }[] = [
    { id: 'map', icon: ICON.map, label: 'Map' },
    { id: '3d', icon: ICON.building, label: '3D' },
    { id: 'stats', icon: ICON.chart, label: 'Stats' },
    { id: 'export', icon: ICON.file, label: 'Export' },
  ]

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-80.61,28.39,10,0/500x400@2x?access_token=${MAPBOX_TOKEN}`

  return (
    <div className="w-80 xl:w-96 border-l border-border bg-foreground-2 flex flex-col">
      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-medium border-b-2 transition-colors',
              tab === t.id ? 'border-accent text-accent-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>
            <SvgIcon d={t.icon} size={14} /><span className="hidden xl:inline">{t.label}</span>
          </button>
        ))}
        <button onClick={onClose} className="px-2 text-muted-foreground hover:text-foreground">
          <SvgIcon d={ICON.x} size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'map' && (
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden border border-border">
              <img src={mapUrl} alt="Brevard County Map" className="w-full h-48 object-cover" loading="lazy" />
            </div>
            <div className="bg-background rounded-lg p-3 text-xs text-muted-foreground border border-border">
              <p className="font-medium text-foreground mb-1">📍 Brevard County, FL</p>
              <p>28.3900, -80.6100</p>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Interactive Mapbox GL JS · Parcel overlay in next sprint</p>
          </div>
        )}

        {tab === '3d' && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-32 h-32 bg-accent/10 border-2 border-accent/30 rounded-xl flex items-center justify-center"
              style={{ transform: 'perspective(300px) rotateX(15deg) rotateY(-20deg)' }}>
              <SvgIcon d={ICON.building} size={40} className="text-accent/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">3D Building Envelope</p>
              <p className="text-xs text-muted-foreground mt-1">React Three Fiber · EnvelopeViewer · SunShadowViewer</p>
              <p className="text-xs text-muted-foreground mt-1">Ask about setbacks to generate 3D envelope</p>
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Platform Data</h3>
            {stats ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(stats).map(([k, v]) => (
                  <div key={k} className="bg-background border border-border rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-accent">
                      {typeof v === 'number' ? v.toLocaleString() : String(v)}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {k.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            ) : <Spinner size={20} />}
          </div>
        )}

        {tab === 'export' && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <SvgIcon d={ICON.file} size={40} className="text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-foreground">Export Reports</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Ask the AI to "create a full report" for any property · PDF & DOCX exports
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CHAT CENTER
// ═══════════════════════════════════════════════════════════════

function ChatCenter({
  messages, onSend, isLoading, thinkText, session, lang, onLangChange,
}: {
  messages: ChatMessage[]; onSend: (text: string) => void; isLoading: boolean
  thinkText: string; session: ChatSession | null; lang: Lang; onLangChange: (l: Lang) => void
}) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dir = LANGS[lang].dir

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isLoading])

  const send = useCallback((text?: string) => {
    const msg = (text || input).trim()
    if (!msg || isLoading) return
    setInput('')
    onSend(msg)
    inputRef.current?.focus()
  }, [input, isLoading, onSend])

  const display = messages.filter(m => m.role !== 'system')

  return (
    <div className="flex-1 flex flex-col min-w-0" dir={dir}>
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-accent-foreground text-xs font-bold">Z</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">{session?.title || 'ZoneWise AI'}</h1>
            <p className="text-[10px] text-muted-foreground">67 Counties · Opus 4.6 · Supabase</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(Object.keys(LANGS) as Lang[]).map(code => (
            <button key={code} onClick={() => onLangChange(code)}
              className={cn(
                'px-1.5 py-0.5 text-xs rounded transition-colors',
                lang === code ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              )}>
              {LANGS[code].flag}
            </button>
          ))}
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live
          </span>
        </div>
      </div>

      {/* Messages or Empty State */}
      {display.length === 0 && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
              <SvgIcon d={ICON.sparkle} size={32} className="text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">ZoneWise AI</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Florida's zoning intelligence platform. Ask about any property, zoning district,
              setbacks, or permitted uses across all 67 counties.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
            {STARTERS.map((s, i) => (
              <button key={i} onClick={() => send(s.text)}
                className="text-left px-4 py-3 rounded-xl border border-border bg-background hover:bg-foreground/5 transition-colors text-sm text-foreground">
                <span className="mr-1">{s.emoji}</span>{s.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {display.map((m, i) => (
            <div key={m.id || i} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <SvgIcon d={ICON.sparkle} size={14} className="text-accent" />
                </div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-foreground/5 text-foreground border border-border'
              )}>
                {m.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <Markdown>{m.content}</Markdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Spinner size={14} />
              </div>
              <div className="bg-foreground/5 border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                {thinkText || 'Thinking...'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border bg-background/95 backdrop-blur-sm">
        <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2 items-end">
          <textarea
            ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={LANGS[lang].placeholder}
            className="flex-1 resize-none min-h-[40px] max-h-32 px-4 py-2.5 rounded-xl bg-foreground/5 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            rows={1} dir={dir}
          />
          <button type="submit" disabled={!input.trim() || isLoading}
            className="shrink-0 w-10 h-10 rounded-xl bg-accent hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground text-accent-foreground flex items-center justify-center transition-colors">
            <SvgIcon d={ICON.send} size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => storage.getSessions())
  const [activeId, setActiveId] = useState<string | null>(() => sessions[0]?.id || null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [thinkText, setThinkText] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightOpen, setRightOpen] = useState(true)
  const [lang, setLang] = useState<Lang>('en')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isDark, setIsDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Apply dark mode
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark) }, [isDark])
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Load messages on session change
  useEffect(() => {
    if (activeId) setMessages(storage.getMessages(activeId))
    else setMessages([])
  }, [activeId])

  // Persist sessions
  useEffect(() => { storage.saveSessions(sessions) }, [sessions])

  // Persist messages
  useEffect(() => {
    if (activeId && messages.length > 0) storage.saveMessages(activeId, messages)
  }, [messages, activeId])

  const newSession = useCallback(() => {
    const s: ChatSession = { id: uid(), title: 'New Chat', createdAt: Date.now(), updatedAt: Date.now(), messageCount: 0 }
    setSessions(prev => [s, ...prev])
    setActiveId(s.id)
    setMessages([])
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    storage.deleteMessages(id)
    if (activeId === id) {
      const remaining = sessions.filter(s => s.id !== id)
      setActiveId(remaining[0]?.id || null)
    }
  }, [activeId, sessions])

  const sendMessage = useCallback(async (content: string) => {
    let sid = activeId
    if (!sid) {
      const s: ChatSession = { id: uid(), title: content.slice(0, 50), createdAt: Date.now(), updatedAt: Date.now(), messageCount: 0 }
      setSessions(prev => [s, ...prev])
      setActiveId(s.id)
      sid = s.id
    }

    const userMsg: ChatMessage = { id: uid(), role: 'user', content, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setThinkText('Processing...')

    try {
      const res = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content }),
      })

      if (!res.ok) throw new Error(`${res.status}`)

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let answer = ''
      let buf = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() || ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const p = JSON.parse(line.slice(6))
              if (p.type === 'answer') answer = p.value
              else if (p.type === 'thinking') setThinkText(p.value)
            } catch { /* skip */ }
          }
        }
      }

      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant', content: answer || 'Sorry, I couldn\'t process that query.',
        timestamp: Date.now(),
      }])

      setSessions(prev => prev.map(s => s.id === sid ? {
        ...s,
        title: s.messageCount === 0 ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : s.title,
        updatedAt: Date.now(), messageCount: s.messageCount + 2,
        preview: (answer || '').slice(0, 80),
      } : s))
    } catch {
      // Fallback to non-streaming
      try {
        const fb = await fetch(`${API_BASE}/chat`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: content }),
        })
        const data = await fb.json()
        setMessages(prev => [...prev, { id: uid(), role: 'assistant', content: data.answer || 'Error.', timestamp: Date.now() }])
      } catch {
        setMessages(prev => [...prev, {
          id: uid(), role: 'assistant', timestamp: Date.now(),
          content: '⚠️ Backend warming up (~30s cold start on Render). Please try again.',
        }])
      }
    } finally {
      setIsLoading(false)
      setThinkText('')
    }
  }, [activeId])

  const activeSession = sessions.find(s => s.id === activeId) || null

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-foreground-2 text-foreground">
        {/* Mobile header */}
        <div className="lg:hidden border-b border-border p-3 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-accent-foreground text-xs font-bold">Z</span>
            </div>
            <span className="text-sm font-semibold text-foreground">ZoneWise AI</span>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 text-muted-foreground">
            <SvgIcon d={ICON.menu} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <SessionSidebar
              sessions={sessions} activeId={activeId} onSelect={setActiveId}
              onNew={newSession} onDelete={deleteSession}
              collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Mobile sidebar overlay */}
          {mobileMenu && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenu(false)}>
              <div className="w-72 h-full" onClick={e => e.stopPropagation()}>
                <SessionSidebar
                  sessions={sessions} activeId={activeId}
                  onSelect={id => { setActiveId(id); setMobileMenu(false) }}
                  onNew={() => { newSession(); setMobileMenu(false) }}
                  onDelete={deleteSession} collapsed={false} onToggle={() => setMobileMenu(false)}
                />
              </div>
            </div>
          )}

          {/* Chat center */}
          <ChatCenter
            messages={messages} onSend={sendMessage} isLoading={isLoading}
            thinkText={thinkText} session={activeSession} lang={lang} onLangChange={setLang}
          />

          {/* Desktop right panel */}
          <div className="hidden lg:block">
            <RightPanel visible={rightOpen} onClose={() => setRightOpen(false)} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-1.5 bg-background/80 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Powered by Claude Opus 4.6 · CraftAgents OSS · Supabase</span>
          <span>zonewise.ai</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
