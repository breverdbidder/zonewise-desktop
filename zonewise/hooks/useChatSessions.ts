import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc'
import type { ChatSession, ChatMessage } from '@/components/CraftAgentLayout'

/**
 * Custom hook for managing chat sessions and messages
 * Integrates with tRPC backend and provides localStorage fallback
 */
export function useChatSessions() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // tRPC queries
  const { data: sessionsData, refetch: refetchSessions } = trpc.chat.getSessions.useQuery(
    undefined,
    {
      // Fallback to localStorage on error
      onError: () => {
        const stored = localStorage.getItem('zonewise_sessions')
        if (stored) {
          try {
            setSessions(JSON.parse(stored))
          } catch (e) {
            console.error('Failed to parse stored sessions:', e)
          }
        }
      },
    }
  )

  const { data: messagesData, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { sessionId: Number(activeSessionId) || 0 },
    {
      enabled: !!activeSessionId,
      // Fallback to localStorage on error
      onError: () => {
        if (activeSessionId) {
          const stored = localStorage.getItem(`zonewise_messages_${activeSessionId}`)
          if (stored) {
            try {
              setMessages(JSON.parse(stored))
            } catch (e) {
              console.error('Failed to parse stored messages:', e)
            }
          }
        }
      },
    }
  )

  // tRPC mutations
  const createSessionMutation = trpc.chat.createSession.useMutation()
  const updateSessionMutation = trpc.chat.updateSession.useMutation()
  const deleteSessionMutation = trpc.chat.deleteSession.useMutation()
  const sendMessageMutation = trpc.chat.sendMessage.useMutation()

  // Load sessions from backend
  useEffect(() => {
    if (sessionsData) {
      const mapped = sessionsData.map((s) => ({
        id: String(s.id),
        title: s.title,
        createdAt: new Date(s.createdAt).getTime(),
        updatedAt: new Date(s.updatedAt).getTime(),
        messageCount: s.messageCount,
        preview: s.lastMessagePreview || undefined,
        propertyAddress: s.propertyAddress || undefined,
        jurisdiction: s.jurisdiction || undefined,
        zoningDistrict: s.zoningDistrict || undefined,
      }))
      setSessions(mapped)
      
      // Save to localStorage as backup
      localStorage.setItem('zonewise_sessions', JSON.stringify(mapped))
      
      if (mapped.length > 0 && !activeSessionId) {
        setActiveSessionId(mapped[0].id)
      }
    }
  }, [sessionsData, activeSessionId])

  // Load messages from backend
  useEffect(() => {
    if (messagesData) {
      const mapped = messagesData.map((m) => ({
        id: String(m.id),
        sessionId: String(m.sessionId),
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: new Date(m.createdAt).getTime(),
        attachments: m.attachments,
        metadata: m.metadata,
      }))
      setMessages(mapped)
      
      // Save to localStorage as backup
      if (activeSessionId) {
        localStorage.setItem(`zonewise_messages_${activeSessionId}`, JSON.stringify(mapped))
      }
    }
  }, [messagesData, activeSessionId])

  // Create new session
  const createSession = useCallback(
    async (title?: string) => {
      try {
        const result = await createSessionMutation.mutateAsync({
          title: title || `Session ${sessions.length + 1}`,
        })
        await refetchSessions()
        setActiveSessionId(String(result.id))
        setMessages([])
        return String(result.id)
      } catch (error) {
        console.error('Failed to create session:', error)
        // Fallback to localStorage
        const newSession: ChatSession = {
          id: `session-${Date.now()}`,
          title: title || `Session ${sessions.length + 1}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messageCount: 0,
        }
        setSessions((prev) => [newSession, ...prev])
        setActiveSessionId(newSession.id)
        setMessages([])
        return newSession.id
      }
    },
    [sessions.length, createSessionMutation, refetchSessions]
  )

  // Update session
  const updateSession = useCallback(
    async (sessionId: string, updates: Partial<ChatSession>) => {
      try {
        await updateSessionMutation.mutateAsync({
          sessionId: Number(sessionId),
          title: updates.title,
          propertyAddress: updates.propertyAddress,
          jurisdiction: updates.jurisdiction,
          zoningDistrict: updates.zoningDistrict,
        })
        await refetchSessions()
      } catch (error) {
        console.error('Failed to update session:', error)
        // Fallback to localStorage
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, ...updates, updatedAt: Date.now() } : s
          )
        )
      }
    },
    [updateSessionMutation, refetchSessions]
  )

  // Delete session
  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await deleteSessionMutation.mutateAsync({ sessionId: Number(sessionId) })
        await refetchSessions()
        if (activeSessionId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId)
          setActiveSessionId(remaining[0]?.id || null)
        }
      } catch (error) {
        console.error('Failed to delete session:', error)
        // Fallback to localStorage
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
        localStorage.removeItem(`zonewise_messages_${sessionId}`)
        if (activeSessionId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId)
          setActiveSessionId(remaining[0]?.id || null)
        }
      }
    },
    [activeSessionId, sessions, deleteSessionMutation, refetchSessions]
  )

  // Send message
  const sendMessage = useCallback(
    async (content: string, attachments?: ChatMessage['attachments']) => {
      if (!activeSessionId) return

      try {
        await sendMessageMutation.mutateAsync({
          sessionId: Number(activeSessionId),
          content,
          attachments,
        })
        await refetchMessages()
        await refetchSessions()
      } catch (error) {
        console.error('Failed to send message:', error)
        // Fallback to localStorage
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sessionId: activeSessionId,
          role: 'user',
          content,
          timestamp: Date.now(),
          attachments,
        }
        setMessages((prev) => [...prev, userMessage])
        
        // Simulate assistant response
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sessionId: activeSessionId,
            role: 'assistant',
            content: 'I understand you want to analyze a property. Let me help you with that...',
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, assistantMessage])
        }, 500)
      }
    },
    [activeSessionId, sendMessageMutation, refetchMessages, refetchSessions]
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
    isLoading: createSessionMutation.isPending || sendMessageMutation.isPending,
  }
}
