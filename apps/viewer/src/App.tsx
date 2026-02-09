/**
 * ZoneWise.AI — Florida Zoning Intelligence Platform
 *
 * Craft Agents-inspired sidebar layout:
 *  - Left (280px): Logo, Agents, Skills, History
 *  - Right (flex-1): Chat with SSE streaming + collapsible Artifacts panel
 *
 * Navy brand: #1E3A5F primary, #F47B20 accent
 * 7 languages (EN, ES, HE/RTL, PT, FR, ZH, HI)
 *
 * @module ZoneWise
 * @version 3.0.0
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Markdown,
  Spinner,
  cn,
  TooltipProvider,
} from '@craft-agent/ui'
import {
  Search,
  MapPin,
  GitCompare,
  FlaskConical,
  ClipboardCheck,
  Building2,
  Ruler,
  Scale,
  FileSearch,
  ChevronDown,
  ChevronRight,
  Plus,
  Send,
  Sun,
  Moon,
  Menu,
  X,
  MessageSquare,
  Trash2,
  Sparkles,
  BarChart3,
  Globe,
  Map,
  PanelRightOpen,
  PanelRightClose,
  Layers,
  LayoutGrid,
} from 'lucide-react'

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
  agent?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  intent?: string
  data?: unknown
}

interface Agent {
  id: string
  name: string
  icon: typeof MapPin
  description: string
  placeholder: string
  systemPrompt: string
}

interface Skill {
  id: string
  name: string
  icon: typeof Building2
  value: string
}

type Lang = 'en' | 'es' | 'he' | 'pt' | 'fr' | 'zh' | 'hi'

const LANGS: Record<Lang, { flag: string; name: string; dir: 'ltr' | 'rtl'; placeholder: string }> = {
  en: { flag: '🇺🇸', name: 'English', dir: 'ltr', placeholder: 'Ask about any Florida property, zoning code, or district...' },
  es: { flag: '🇪🇸', name: 'Español', dir: 'ltr', placeholder: 'Pregunte sobre cualquier propiedad en Florida...' },
  he: { flag: '🇮🇱', name: 'עברית', dir: 'rtl', placeholder: '...שאל על נכס, אזור, או היתר בנייה' },
  pt: { flag: '🇧🇷', name: 'Português', dir: 'ltr', placeholder: 'Pergunte sobre qualquer propriedade na Flórida...' },
  fr: { flag: '🇫🇷', name: 'Français', dir: 'ltr', placeholder: 'Posez une question sur n\'importe quelle propriété en Floride...' },
  zh: { flag: '🇨🇳', name: '中文', dir: 'ltr', placeholder: '询问佛罗里达州的任何房产、分区代码或地区...' },
  hi: { flag: '🇮🇳', name: 'हिन्दी', dir: 'ltr', placeholder: 'फ्लोरिडा की किसी भी संपत्ति के बारे में पूछें...' },
}

// ═══════════════════════════════════════════════════════════════
// DATA: AGENTS & SKILLS
// ═══════════════════════════════════════════════════════════════

const AGENTS: Agent[] = [
  {
    id: 'zoning-lookup',
    name: 'Zoning Lookup',
    icon: MapPin,
    description: 'Find zones in any city',
    placeholder: 'What zones are in [city]?',
    systemPrompt: 'You are a zoning lookup agent. Help users find zoning districts for any Florida city or county.',
  },
  {
    id: 'district-compare',
    name: 'District Compare',
    icon: GitCompare,
    description: 'Compare districts side by side',
    placeholder: 'Compare [city A] vs [city B] residential density',
    systemPrompt: 'You are a district comparison agent. Compare zoning districts between different Florida jurisdictions.',
  },
  {
    id: 'research',
    name: 'Research',
    icon: FlaskConical,
    description: 'Open-ended zoning intelligence',
    placeholder: 'Ask any zoning research question...',
    systemPrompt: 'You are a zoning research agent with deep knowledge of Florida zoning codes. Answer open-ended questions.',
  },
  {
    id: 'permit-check',
    name: 'Permit Check',
    icon: ClipboardCheck,
    description: 'Check permitted uses',
    placeholder: "What's allowed in [district] [city]?",
    systemPrompt: 'You are a permit check agent. Help users understand what uses are permitted in specific zoning districts.',
  },
]

const SKILLS: Skill[] = [
  { id: 'counties', name: '67 FL Counties', icon: Map, value: '369 jurisdictions' },
  { id: 'districts', name: '5,395 Districts', icon: Layers, value: 'Indexed & searchable' },
  { id: 'district-lookup', name: 'District Lookup', icon: Search, value: 'Instant regex path' },
  { id: 'density', name: 'Density Compare', icon: LayoutGrid, value: 'Claude Sonnet 4.5' },
  { id: 'setback', name: 'Setback Analysis', icon: Ruler, value: 'Front/side/rear' },
  { id: 'permitted-use', name: 'Permitted Use Search', icon: FileSearch, value: 'By-right & conditional' },
]

const STARTERS = [
  { text: 'What can I build at 625 Ocean St, Satellite Beach?' },
  { text: 'Show me all zoning districts in Brevard County' },
  { text: 'Compare setbacks: R-1 vs R-2 in Melbourne' },
  { text: "What's permitted in Palm Bay RM-15?" },
]

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

function timeAgo(ts: number): string {
  const d = Date.now() - ts
  if (d < 60000) return 'Just now'
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}

// ═══════════════════════════════════════════════════════════════
// ZONEWISE LOGO
// ═══════════════════════════════════════════════════════════════

function ZoneWiseLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#F47B20" />
      <path d="M10 14h20v3H15.5l14.5 9v3H10v-3h14.5L10 17v-3z" fill="white" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR SECTION (collapsible)
// ═══════════════════════════════════════════════════════════════

function SidebarSection({
  title, children, defaultOpen = true,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-300 transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {title}
      </button>
      {open && <div className="px-2">{children}</div>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LEFT SIDEBAR
// ═══════════════════════════════════════════════════════════════

function Sidebar({
  activeAgent, onSelectAgent, sessions, activeSessionId, onSelectSession, onNewSession,
  onDeleteSession, isDark, onToggleDark, lang, onLangChange, mobileOpen, onMobileClose,
}: {
  activeAgent: string | null
  onSelectAgent: (id: string) => void
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
  isDark: boolean
  onToggleDark: () => void
  lang: Lang
  onLangChange: (l: Lang) => void
  mobileOpen: boolean
  onMobileClose: () => void
}) {
  const [langOpen, setLangOpen] = useState(false)

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[var(--zw-sidebar-bg)] text-slate-300 zw-sidebar">
      {/* Header: Logo + Brand + Controls */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <ZoneWiseLogo size={28} />
          <div>
            <div className="text-sm font-bold text-white tracking-tight">ZoneWise<span className="text-[#F47B20]">.AI</span></div>
            <div className="text-[9px] text-slate-400 tracking-wider uppercase">Florida Zoning Intel</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs"
              title="Language"
            >
              <Globe size={14} />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-50 bg-[var(--zw-navy-dark)] border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]">
                  {(Object.keys(LANGS) as Lang[]).map(code => (
                    <button
                      key={code}
                      onClick={() => { onLangChange(code); setLangOpen(false) }}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors',
                        lang === code ? 'text-[#F47B20] bg-white/5' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <span>{LANGS[code].flag}</span>
                      <span>{LANGS[code].name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Dark/Light toggle */}
          <button
            onClick={onToggleDark}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors md:hidden"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* New Chat button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#F47B20] hover:bg-[#F69345] text-white text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          New Chat
        </button>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* AGENTS */}
        <SidebarSection title="Agents">
          {AGENTS.map(agent => {
            const Icon = agent.icon
            const isActive = activeAgent === agent.id
            return (
              <button
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all mb-0.5',
                  isActive
                    ? 'bg-[var(--zw-sidebar-active)] text-[#F47B20]'
                    : 'text-slate-300 hover:bg-[var(--zw-sidebar-hover)] hover:text-white'
                )}
              >
                <Icon size={16} className={isActive ? 'text-[#F47B20]' : 'text-slate-400'} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{agent.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{agent.description}</div>
                </div>
              </button>
            )
          })}
        </SidebarSection>

        {/* SKILLS */}
        <SidebarSection title="Skills">
          {SKILLS.map(skill => {
            const Icon = skill.icon
            return (
              <div
                key={skill.id}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-400 mb-0.5"
              >
                <Icon size={14} className="text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-slate-300">{skill.name}</div>
                </div>
                <span className="text-[9px] text-slate-500 shrink-0">{skill.value}</span>
              </div>
            )
          })}
        </SidebarSection>

        {/* HISTORY */}
        <SidebarSection title="History" defaultOpen={sessions.length > 0}>
          {sessions.length === 0 ? (
            <p className="text-center text-[11px] text-slate-500 py-4">No chat history yet</p>
          ) : (
            sessions.slice(0, 20).map(s => (
              <div
                key={s.id}
                onClick={() => { onSelectSession(s.id); onMobileClose() }}
                className={cn(
                  'group flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all mb-0.5',
                  s.id === activeSessionId
                    ? 'bg-[var(--zw-sidebar-active)] text-white'
                    : 'text-slate-300 hover:bg-[var(--zw-sidebar-hover)] hover:text-white'
                )}
              >
                <MessageSquare size={13} className="mt-0.5 shrink-0 text-slate-500" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium truncate">{s.title}</div>
                  <div className="text-[10px] text-slate-500">{timeAgo(s.updatedAt)}</div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteSession(s.id) }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}
        </SidebarSection>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>Powered by Claude Opus 4.6</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-[280px] shrink-0 h-full border-r border-white/5">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative w-[280px] h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// ARTIFACTS PANEL (collapsible right side)
// ═══════════════════════════════════════════════════════════════

function ArtifactsPanel({
  visible, onClose,
}: {
  visible: boolean; onClose: () => void
}) {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    if (visible && !stats) {
      setStatsLoading(true)
      fetch(`${API_BASE}/api/stats`)
        .then(r => r.json())
        .then(d => { setStats(d); setStatsLoading(false) })
        .catch(() => setStatsLoading(false))
    }
  }, [visible, stats])

  if (!visible) return null

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-81.5,28.0,6.5,0/480x280@2x?access_token=${MAPBOX_TOKEN}`

  return (
    <div className="w-80 xl:w-96 shrink-0 h-full border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-[#F47B20]" />
          <span className="text-sm font-semibold text-foreground">Artifacts</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats Cards */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platform Data</h3>
          {statsLoading ? (
            <div className="flex justify-center py-8"><Spinner size={20} /></div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(stats).map(([k, v]) => (
                <div key={k} className="bg-foreground/3 border border-border rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#F47B20]">
                    {typeof v === 'number' ? v.toLocaleString() : String(v)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                    {k.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {[{ label: 'Jurisdictions', value: '369' }, { label: 'Districts', value: '5,395' }, { label: 'Standards', value: '59' }, { label: 'Uses', value: '350+' }].map(item => (
                <div key={item.label} className="bg-foreground/3 border border-border rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#F47B20]">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Preview */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Florida Coverage</h3>
          <div className="rounded-lg overflow-hidden border border-border">
            <img src={mapUrl} alt="Florida Coverage Map" className="w-full h-36 object-cover" loading="lazy" />
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">67 counties covered with interactive Mapbox GL JS</p>
        </div>

        {/* Data table placeholder */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Results</h3>
          <div className="bg-foreground/3 border border-border rounded-lg p-6 text-center">
            <Scale size={24} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Query data will appear here</p>
            <p className="text-[10px] text-muted-foreground mt-1">Tables, charts, and comparison views</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CHAT AREA
// ═══════════════════════════════════════════════════════════════

function ChatArea({
  messages, onSend, isLoading, thinkText, session, activeAgent, lang, artifactsOpen, onToggleArtifacts,
  onMobileMenuOpen,
}: {
  messages: ChatMessage[]
  onSend: (text: string) => void
  isLoading: boolean
  thinkText: string
  session: ChatSession | null
  activeAgent: Agent | null
  lang: Lang
  artifactsOpen: boolean
  onToggleArtifacts: () => void
  onMobileMenuOpen: () => void
}) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dir = LANGS[lang].dir
  const placeholder = activeAgent?.placeholder || LANGS[lang].placeholder

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
    <div className="flex-1 flex flex-col min-w-0 bg-background" dir={dir}>
      {/* Chat header */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-background/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <button onClick={onMobileMenuOpen} className="p-1.5 rounded-md hover:bg-foreground/5 text-muted-foreground md:hidden">
            <Menu size={16} />
          </button>
          <div className="w-7 h-7 rounded-lg bg-[#F47B20] flex items-center justify-center">
            {activeAgent ? (
              <activeAgent.icon size={14} className="text-white" />
            ) : (
              <Sparkles size={14} className="text-white" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              {activeAgent?.name || session?.title || 'ZoneWise AI'}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {activeAgent?.description || '67 Counties · Claude Opus 4.6 · Real-Time Data'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live
          </span>
          <button
            onClick={onToggleArtifacts}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
            title={artifactsOpen ? 'Hide artifacts' : 'Show artifacts'}
          >
            {artifactsOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>
        </div>
      </div>

      {/* Messages or Empty State */}
      {display.length === 0 && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="text-center">
            <ZoneWiseLogo size={48} />
            <h2 className="text-xl font-semibold text-foreground mt-4 mb-2">
              {activeAgent ? activeAgent.name : 'ZoneWise AI'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              {activeAgent
                ? activeAgent.description
                : "Florida's zoning intelligence platform. Ask about any property, zoning district, setbacks, or permitted uses across all 67 counties."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
            {STARTERS.map((s, i) => (
              <button key={i} onClick={() => send(s.text)}
                className="text-left px-4 py-3 rounded-xl border border-border bg-background hover:bg-foreground/3 transition-colors text-sm text-foreground hover:border-[#F47B20]/30">
                {s.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {display.map((m, i) => (
            <div key={m.id || i} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#F47B20]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={14} className="text-[#F47B20]" />
                </div>
              )}
              <div className={cn(
                'max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-foreground/3 text-foreground border border-border'
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
              <div className="w-7 h-7 rounded-full bg-[#F47B20]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Spinner size={14} />
              </div>
              <div className="bg-foreground/3 border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                {thinkText || (
                  <span className="flex items-center gap-1">
                    Thinking
                    <span className="flex gap-0.5 ml-1">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground zw-typing-dot" />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground zw-typing-dot" />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground zw-typing-dot" />
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 border-t border-border bg-background/95 backdrop-blur-sm shrink-0">
        <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2 items-end">
          <textarea
            ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={placeholder}
            className="zw-chat-input flex-1 resize-none min-h-[42px] max-h-32 px-4 py-2.5 rounded-xl bg-foreground/3 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#F47B20]/30 focus:border-[#F47B20]/50 transition-all"
            rows={1} dir={dir}
          />
          <button type="submit" disabled={!input.trim() || isLoading}
            className="shrink-0 w-10 h-10 rounded-xl bg-[#F47B20] hover:bg-[#F69345] disabled:bg-muted disabled:text-muted-foreground text-white flex items-center justify-center transition-colors">
            <Send size={16} />
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
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [artifactsOpen, setArtifactsOpen] = useState(true)
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

  // Apply RTL on lang change
  useEffect(() => {
    document.documentElement.dir = LANGS[lang].dir
  }, [lang])

  const currentAgent = AGENTS.find(a => a.id === activeAgent) || null

  const newSession = useCallback(() => {
    const s: ChatSession = {
      id: uid(), title: 'New Chat', createdAt: Date.now(), updatedAt: Date.now(),
      messageCount: 0, agent: activeAgent || undefined,
    }
    setSessions(prev => [s, ...prev])
    setActiveId(s.id)
    setMessages([])
  }, [activeAgent])

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    storage.deleteMessages(id)
    if (activeId === id) {
      const remaining = sessions.filter(s => s.id !== id)
      setActiveId(remaining[0]?.id || null)
    }
  }, [activeId, sessions])

  const selectAgent = useCallback((agentId: string) => {
    setActiveAgent(prev => prev === agentId ? null : agentId)
    // Start a new session with this agent context
    const agent = AGENTS.find(a => a.id === agentId)
    if (agent) {
      const s: ChatSession = {
        id: uid(), title: agent.name, createdAt: Date.now(), updatedAt: Date.now(),
        messageCount: 0, agent: agentId,
      }
      setSessions(prev => [s, ...prev])
      setActiveId(s.id)
      setMessages([])
    }
    setMobileMenu(false)
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    let sid = activeId
    if (!sid) {
      const s: ChatSession = {
        id: uid(), title: content.slice(0, 50), createdAt: Date.now(), updatedAt: Date.now(),
        messageCount: 0, agent: activeAgent || undefined,
      }
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
        body: JSON.stringify({
          query: content,
          agent: activeAgent || undefined,
          lang: lang,
        }),
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
          body: JSON.stringify({ query: content, agent: activeAgent || undefined, lang }),
        })
        const data = await fb.json()
        setMessages(prev => [...prev, { id: uid(), role: 'assistant', content: data.answer || 'Error.', timestamp: Date.now() }])
      } catch {
        setMessages(prev => [...prev, {
          id: uid(), role: 'assistant', timestamp: Date.now(),
          content: 'Backend warming up (~30s cold start on Render). Please try again.',
        }])
      }
    } finally {
      setIsLoading(false)
      setThinkText('')
    }
  }, [activeId, activeAgent, lang])

  const activeSession = sessions.find(s => s.id === activeId) || null

  return (
    <TooltipProvider>
      <div className="h-full flex bg-background text-foreground overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeAgent={activeAgent}
          onSelectAgent={selectAgent}
          sessions={sessions}
          activeSessionId={activeId}
          onSelectSession={setActiveId}
          onNewSession={newSession}
          onDeleteSession={deleteSession}
          isDark={isDark}
          onToggleDark={() => setIsDark(d => !d)}
          lang={lang}
          onLangChange={setLang}
          mobileOpen={mobileMenu}
          onMobileClose={() => setMobileMenu(false)}
        />

        {/* Chat Center */}
        <ChatArea
          messages={messages}
          onSend={sendMessage}
          isLoading={isLoading}
          thinkText={thinkText}
          session={activeSession}
          activeAgent={currentAgent}
          lang={lang}
          artifactsOpen={artifactsOpen}
          onToggleArtifacts={() => setArtifactsOpen(v => !v)}
          onMobileMenuOpen={() => setMobileMenu(true)}
        />

        {/* Right Artifacts Panel (desktop only) */}
        <div className="hidden lg:block">
          <ArtifactsPanel
            visible={artifactsOpen}
            onClose={() => setArtifactsOpen(false)}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
