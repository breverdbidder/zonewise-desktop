import { useState, useEffect, useCallback } from 'react'
import type { ChatSession, ChatMessage } from '@/components/CraftAgentLayout'

const API_BASE = import.meta.env.VITE_API_URL || 'https://zonewise-agents.onrender.com'
const STORAGE_KEY = 'zonewise_sessions'
const MESSAGES_KEY = 'zonewise_messages'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function loadSessions(): ChatSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

function loadMessages(sessionId: string): ChatMessage[] {
  try {
    const stored = localStorage.getItem(`${MESSAGES_KEY}_${sessionId}`)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveMessages(sessionId: string, messages: ChatMessage[]) {
  localStorage.setItem(`${MESSAGES_KEY}_${sessionId}`, JSON.stringify(messages))
}

/**
 * Chat sessions hook — localStorage for persistence,
 * zonewise-agents REST API for AI responses via SSE streaming
 */
export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions())
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const stored = loadSessions()
    return stored[0]?.id || null
  })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      setMessages(loadMessages(activeSessionId))
    } else {
      setMessages([])
    }
  }, [activeSessionId])

  // Persist sessions
  useEffect(() => {
    saveSessions(sessions)
  }, [sessions])

  // Persist messages
  useEffect(() => {
    if (activeSessionId && messages.length > 0) {
      saveMessages(activeSessionId, messages)
    }
  }, [messages, activeSessionId])

  // Create new session
  const createSession = useCallback(
    (title?: string) => {
      const newSession: ChatSession = {
        id: generateId(),
        title: title || `New Chat`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: 0,
      }
      setSessions((prev) => [newSession, ...prev])
      setActiveSessionId(newSession.id)
      setMessages([])
      return newSession.id
    },
    []
  )

  // Update session
  const updateSession = useCallback(
    (sessionId: string, updates: Partial<ChatSession>) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, ...updates, updatedAt: Date.now() } : s
        )
      )
    },
    []
  )

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      localStorage.removeItem(`${MESSAGES_KEY}_${sessionId}`)
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId)
        setActiveSessionId(remaining[0]?.id || null)
      }
    },
    [activeSessionId, sessions]
  )

  // Send message — calls zonewise-agents /chat/stream via SSE
  const sendMessage = useCallback(
    async (content: string, attachments?: ChatMessage['attachments']) => {
      if (!activeSessionId) {
        // Auto-create session
        const newId = generateId()
        const newSession: ChatSession = {
          id: newId,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messageCount: 0,
        }
        setSessions((prev) => [newSession, ...prev])
        setActiveSessionId(newId)
      }

      const sessionId = activeSessionId || generateId()

      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        sessionId,
        role: 'user',
        content,
        timestamp: Date.now(),
        attachments,
      }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)

      try {
        // Call streaming endpoint
        const response = await fetch(`${API_BASE}/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: content }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let answer = ''
        let intent = ''
        const suggestions: string[] = []
        let assistantData: unknown = null

        if (reader) {
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              try {
                const parsed = JSON.parse(line.slice(6))
                switch (parsed.type) {
                  case 'answer':
                    answer = parsed.value
                    break
                  case 'intent':
                    intent = parsed.value
                    break
                  case 'suggestion':
                    suggestions.push(parsed.value)
                    break
                  case 'data':
                    assistantData = parsed.value
                    break
                  case 'thinking':
                    // Could update a thinking state here
                    break
                  case 'done':
                    break
                }
              } catch {
                // Skip malformed lines
              }
            }
          }
        }

        // Add assistant message
        const assistantMsg: ChatMessage = {
          id: generateId(),
          sessionId,
          role: 'assistant',
          content: answer || 'Sorry, I couldn\'t process that query. Please try again.',
          timestamp: Date.now(),
          metadata: {
            toolCalls: assistantData
              ? [{ name: intent || 'query', args: {}, result: assistantData }]
              : undefined,
          },
        }
        setMessages((prev) => [...prev, assistantMsg])

        // Update session title from first message
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  title: s.messageCount === 0
                    ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
                    : s.title,
                  updatedAt: Date.now(),
                  messageCount: s.messageCount + 2,
                  preview: (answer || '').slice(0, 80),
                }
              : s
          )
        )
      } catch (error) {
        console.error('Chat API error:', error)

        // Fallback: try non-streaming endpoint
        try {
          const fallbackRes = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: content }),
          })
          const fallbackData = await fallbackRes.json()

          const assistantMsg: ChatMessage = {
            id: generateId(),
            sessionId,
            role: 'assistant',
            content: fallbackData.answer || 'I encountered an error processing your query.',
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, assistantMsg])
        } catch {
          const errorMsg: ChatMessage = {
            id: generateId(),
            sessionId,
            role: 'assistant',
            content: '⚠️ Connection error. The backend may be warming up (Render cold start ~30s). Please try again in a moment.',
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, errorMsg])
        }
      } finally {
        setIsLoading(false)
      }
    },
    [activeSessionId]
  )

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    createSession,
    updateSession,
    deleteSession,
    sendMessage,
    isLoading,
  }
}
