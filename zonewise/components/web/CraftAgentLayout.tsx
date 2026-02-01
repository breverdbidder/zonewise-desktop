import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'wouter'
import {
  MessageSquare,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  MoreVertical,
  Trash2,
  Edit2,
  MapPin,
  User,
  LogOut,
  Menu,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useChatSessions } from '@/hooks/useChatSessions'
import { ChatDisplay } from './chat/ChatDisplay'
import { RightPanel } from './chat/RightPanel'

// ============================================================================
// Types
// ============================================================================

export interface ChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
  preview?: string
  propertyAddress?: string
  jurisdiction?: string
  zoningDistrict?: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  attachments?: Array<{
    type: 'property' | 'document' | 'image'
    url?: string
    name?: string
    data?: unknown
  }>
  metadata?: {
    propertyId?: string
    documentId?: string
    toolCalls?: Array<{
      name: string
      args: Record<string, unknown>
      result?: unknown
    }>
  }
}

export interface RightPanelContent {
  type: 'property' | 'map' | '3d' | 'sun-shadow' | 'documents' | 'export' | 'none'
  data?: unknown
}

interface CraftAgentLayoutProps {
  children?: React.ReactNode
}

// ============================================================================
// Session List Item Component
// ============================================================================

interface SessionItemProps {
  session: ChatSession
  isActive: boolean
  onClick: () => void
  onDelete: () => void
  onRename: () => void
}

function SessionItem({ session, isActive, onClick, onDelete, onRename }: SessionItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'group relative flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/50 text-foreground'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{session.title}</div>
        {session.preview && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {session.preview}
          </div>
        )}
        {session.propertyAddress && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{session.propertyAddress}</span>
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-0.5">
          {new Date(session.updatedAt).toLocaleDateString()}
        </div>
      </div>
      {(isHovered || isActive) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
              <Edit2 className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

// ============================================================================
// Left Sidebar Component
// ============================================================================

interface LeftSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSessionSelect: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
  onRenameSession: (sessionId: string, newTitle: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

function LeftSidebar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  isCollapsed,
  onToggleCollapse,
}: LeftSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()
  const [, navigate] = useLocation()

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      session.title.toLowerCase().includes(query) ||
      session.preview?.toLowerCase().includes(query) ||
      session.propertyAddress?.toLowerCase().includes(query) ||
      session.jurisdiction?.toLowerCase().includes(query) ||
      session.zoningDistrict?.toLowerCase().includes(query)
    )
  })

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-border bg-background flex flex-col items-center py-4 gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggleCollapse}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onNewSession}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Sessions</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onNewSession}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onToggleCollapse}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {searchQuery ? 'No matching sessions' : 'No sessions yet'}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onClick={() => onSessionSelect(session.id)}
                onDelete={() => onDeleteSession(session.id)}
                onRename={() => {
                  const newTitle = prompt('Enter new title:', session.title)
                  if (newTitle && newTitle.trim()) {
                    onRenameSession(session.id, newTitle.trim())
                  }
                }}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* User Footer */}
      <div className="p-3 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto p-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium truncate">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user?.email || ''}
                  </div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/pricing')}>
              <Settings className="w-4 h-4 mr-2" />
              Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                window.location.href = '/api/auth/logout'
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ============================================================================
// Main Layout Component
// ============================================================================

export function CraftAgentLayout({ children }: CraftAgentLayoutProps) {
  // Chat session management with backend integration
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    createSession,
    updateSession,
    deleteSession,
    sendMessage,
    isLoading,
  } = useChatSessions()

  // UI state
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false)
  const [rightPanelContent, setRightPanelContent] = useState<RightPanelContent>({
    type: 'none',
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Get active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null

  // Handlers
  const handleNewSession = useCallback(() => {
    createSession()
  }, [createSession])

  const handleSessionSelect = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
  }, [setActiveSessionId])

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      deleteSession(sessionId)
    },
    [deleteSession]
  )

  const handleRenameSession = useCallback(
    (sessionId: string, newTitle: string) => {
      updateSession(sessionId, { title: newTitle })
    },
    [updateSession]
  )

  const handleSendMessage = useCallback(
    async (content: string, attachments?: ChatMessage['attachments']) => {
      await sendMessage(content, attachments)
    },
    [sendMessage]
  )

  const handleOpenProperty = useCallback((propertyData: unknown) => {
    setRightPanelContent({ type: 'property', data: propertyData })
    setIsRightCollapsed(false)
  }, [])

  const handleOpenMap = useCallback((mapData: unknown) => {
    setRightPanelContent({ type: 'map', data: mapData })
    setIsRightCollapsed(false)
  }, [])

  const handleOpen3D = useCallback((data: unknown) => {
    setRightPanelContent({ type: '3d', data })
    setIsRightCollapsed(false)
  }, [])

  const handleOpenSunShadow = useCallback((data: unknown) => {
    setRightPanelContent({ type: 'sun-shadow', data })
    setIsRightCollapsed(false)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b border-border p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">ZoneWise AI</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block">
          <LeftSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
            isCollapsed={isLeftCollapsed}
            onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sessions</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <LeftSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSessionSelect={(id) => {
                  handleSessionSelect(id)
                  setIsMobileMenuOpen(false)
                }}
                onNewSession={() => {
                  handleNewSession()
                  setIsMobileMenuOpen(false)
                }}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleRenameSession}
                isCollapsed={false}
                onToggleCollapse={() => {}}
              />
            </div>
          </div>
        )}

        {/* Center - Chat Display */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatDisplay
            session={activeSession}
            messages={messages}
            onSendMessage={handleSendMessage}
            onOpenProperty={handleOpenProperty}
            onOpenMap={handleOpenMap}
            onOpen3D={handleOpen3D}
            onOpenSunShadow={handleOpenSunShadow}
          />
        </div>

        {/* Right Panel - Desktop */}
        {!isRightCollapsed && (
          <div className="hidden lg:block">
            <RightPanel
              content={rightPanelContent}
              onClose={() => setIsRightCollapsed(true)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
