import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Sparkles, MapPin, Building2, Sun, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ChatSession, ChatMessage } from '../CraftAgentLayout'

const API_BASE = import.meta.env.VITE_API_URL || 'https://zonewise-agents.onrender.com'

// ============================================================================
// Suggestion Chip Component
// ============================================================================

function SuggestionChip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs rounded-full border border-border bg-card hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
    >
      {text}
    </button>
  )
}

// ============================================================================
// Message Bubble Component
// ============================================================================

function MessageBubble({
  message,
  suggestions,
  onSuggestionClick,
  onOpenProperty,
  onOpenMap,
  onOpen3D,
  onOpenSunShadow,
}: {
  message: ChatMessage
  suggestions?: string[]
  onSuggestionClick?: (text: string) => void
  onOpenProperty?: (data: unknown) => void
  onOpenMap?: (data: unknown) => void
  onOpen3D?: (data: unknown) => void
  onOpenSunShadow?: (data: unknown) => void
}) {
  const isUser = message.role === 'user'
  const metadata = message.metadata

  return (
    <div className={cn('flex gap-3 group', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="size-4 text-primary" />
        </div>
      )}

      <div className={cn('max-w-[80%] flex flex-col gap-2')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2.5',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              {message.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-semibold mt-2 mb-1">{line.slice(3)}</h3>
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>
                if (line.startsWith('▸ ') || line.startsWith('• ') || line.startsWith('- '))
                  return <p key={i} className="ml-2 text-sm">{line}</p>
                if (line.trim() === '') return <br key={i} />
                return <p key={i}>{line}</p>
              })}
            </div>
          )}
        </div>

        {/* Tool Call Actions */}
        {metadata?.toolCalls && metadata.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 ml-1">
            {metadata.toolCalls.some((t) => t.name === 'property_lookup') && onOpenProperty && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onOpenProperty(metadata.toolCalls?.find(t => t.name === 'property_lookup')?.result)}>
                <MapPin className="size-3" /> View Property
              </Button>
            )}
            {metadata.toolCalls.some((t) => t.name === 'map_view') && onOpenMap && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onOpenMap(metadata.toolCalls?.find(t => t.name === 'map_view')?.result)}>
                <MapPin className="size-3" /> Show Map
              </Button>
            )}
            {metadata.toolCalls.some((t) => t.name === '3d_envelope') && onOpen3D && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onOpen3D(metadata.toolCalls?.find(t => t.name === '3d_envelope')?.result)}>
                <Building2 className="size-3" /> 3D View
              </Button>
            )}
            {metadata.toolCalls.some((t) => t.name === 'sun_shadow') && onOpenSunShadow && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onOpenSunShadow(metadata.toolCalls?.find(t => t.name === 'sun_shadow')?.result)}>
                <Sun className="size-3" /> Sun Study
              </Button>
            )}
          </div>
        )}

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && !isUser && (
          <div className="flex flex-wrap gap-1.5 ml-1">
            {suggestions.map((s, i) => (
              <SuggestionChip key={i} text={s} onClick={() => onSuggestionClick?.(s)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Empty State Component
// ============================================================================

const STARTER_PROMPTS = [
  '🏠 What can I build at 625 Ocean St, Satellite Beach?',
  '📊 Show me all zoning districts in Brevard County',
  '📋 Create a full report for Palm Bay R-1 zone',
  '🔍 Compare setbacks: R-1 vs R-2 in Melbourne',
]

function EmptyState({ onPromptClick }: { onPromptClick: (text: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">ZoneWise AI</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Florida's zoning intelligence platform. Ask about any property, zoning district, setbacks, or permitted uses across all 67 counties.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
        {STARTER_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onPromptClick(prompt)}
            className="text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-sm"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Thinking Indicator
// ============================================================================

function ThinkingIndicator({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
        <Loader2 className="size-4 text-primary animate-spin" />
      </div>
      <div className="rounded-lg bg-muted px-4 py-2.5">
        <p className="text-sm text-muted-foreground animate-pulse">{text || 'Thinking...'}</p>
      </div>
    </div>
  )
}

// ============================================================================
// Chat Display Component
// ============================================================================

interface ChatDisplayProps {
  session: ChatSession | null
  messages: ChatMessage[]
  onSendMessage: (content: string, attachments?: ChatMessage['attachments']) => Promise<void>
  onOpenProperty?: (data: unknown) => void
  onOpenMap?: (data: unknown) => void
  onOpen3D?: (data: unknown) => void
  onOpenSunShadow?: (data: unknown) => void
}

export function ChatDisplay({
  session,
  messages,
  onSendMessage,
  onOpenProperty,
  onOpenMap,
  onOpen3D,
  onOpenSunShadow,
}: ChatDisplayProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [thinkingText, setThinkingText] = useState('')
  const [lastSuggestions, setLastSuggestions] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
      })
    }
  }, [messages, isLoading])

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text || input).trim()
      if (!content || isLoading) return

      setInput('')
      setIsLoading(true)
      setThinkingText('Processing...')
      setLastSuggestions([])

      try {
        await onSendMessage(content)
      } finally {
        setIsLoading(false)
        setThinkingText('')
      }

      textareaRef.current?.focus()
    },
    [input, isLoading, onSendMessage]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const displayMessages = messages.filter((m) => m.role !== 'system')

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">Z</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold">
              {session?.title || 'ZoneWise AI'}
            </h1>
            <p className="text-xs text-muted-foreground">67 Counties · Real-Time Data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
      </div>

      {/* Messages */}
      {displayMessages.length === 0 && !isLoading ? (
        <EmptyState onPromptClick={(text) => handleSend(text)} />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-4">
              {displayMessages.map((msg, i) => (
                <MessageBubble
                  key={msg.id || i}
                  message={msg}
                  suggestions={
                    i === displayMessages.length - 1 && msg.role === 'assistant'
                      ? lastSuggestions
                      : undefined
                  }
                  onSuggestionClick={(text) => handleSend(text)}
                  onOpenProperty={onOpenProperty}
                  onOpenMap={onOpenMap}
                  onOpen3D={onOpen3D}
                  onOpenSunShadow={onOpenSunShadow}
                />
              ))}
              {isLoading && <ThinkingIndicator text={thinkingText} />}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-background/95 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2 items-end"
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any Florida property, zoning code, or district..."
            className="flex-1 max-h-32 resize-none min-h-[40px]"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="shrink-0 h-[40px] w-[40px]"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
