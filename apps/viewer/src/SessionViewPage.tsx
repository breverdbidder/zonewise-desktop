/**
 * SessionViewPage — Upstream Craft Agents session viewer
 *
 * Routes:
 *   /s       → Upload/paste a session JSON file
 *   /s/{id}  → Load session from S3 by ID (or fallback to upload)
 *
 * Uses SessionViewer from @craft-agent/ui for rendering turn cards.
 */

import { useState, useCallback, useEffect } from 'react'
import type { StoredSession } from '@craft-agent/core'
import {
  SessionViewer,
  TooltipProvider,
} from '@craft-agent/ui'
import { Header } from './components/Header'
import { SessionUpload } from './components/SessionUpload'

// S3 bucket for session storage (matches upstream craft-agents-oss)
const SESSION_CDN = 'https://craft-agent-sessions.s3.us-east-1.amazonaws.com'

function extractSessionId(): string | null {
  const path = window.location.pathname
  const match = path.match(/^\/s\/(.+)$/)
  return match ? match[1] : null
}

export function SessionViewPage() {
  const [session, setSession] = useState<StoredSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Load session from S3 if URL has an ID
  useEffect(() => {
    const sessionId = extractSessionId()
    if (!sessionId) return

    setLoading(true)
    setError(null)

    fetch(`${SESSION_CDN}/${sessionId}.json`)
      .then(r => {
        if (!r.ok) throw new Error(`Session not found (${r.status})`)
        return r.json()
      })
      .then((data: StoredSession) => {
        if (!data.id || !data.messages) {
          throw new Error('Invalid session format')
        }
        setSession(data)
      })
      .catch((e: Error) => {
        setError(e.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSessionLoad = useCallback((s: StoredSession) => {
    setSession(s)
    setError(null)
    // Update URL to reflect session ID
    if (s.id) {
      window.history.replaceState(null, '', `/s/${s.id}`)
    }
  }, [])

  const handleClear = useCallback(() => {
    setSession(null)
    setError(null)
    window.history.replaceState(null, '', '/s')
  }, [])

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-background text-foreground">
        {session ? (
          <SessionViewer
            session={session}
            mode="readonly"
            defaultExpanded={true}
            header={
              <Header
                hasSession={true}
                sessionTitle={session.name || `Session ${session.id.slice(0, 8)}`}
                isDark={isDark}
                onToggleTheme={() => setIsDark(d => !d)}
                onClear={handleClear}
              />
            }
          />
        ) : (
          <>
            <Header
              hasSession={false}
              isDark={isDark}
              onToggleTheme={() => setIsDark(d => !d)}
              onClear={handleClear}
            />
            <div className="flex-1 flex items-center justify-center p-8">
              {loading ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-foreground/50">Loading session...</p>
                </div>
              ) : error ? (
                <div className="text-center max-w-md">
                  <p className="text-destructive mb-4">{error}</p>
                  <p className="text-sm text-foreground/50 mb-6">
                    You can upload a session file manually:
                  </p>
                  <SessionUpload onSessionLoad={handleSessionLoad} />
                </div>
              ) : (
                <SessionUpload onSessionLoad={handleSessionLoad} />
              )}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
