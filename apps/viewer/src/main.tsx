import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { SessionViewPage } from './SessionViewPage'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

/**
 * Simple client-side router:
 *   /          → ZoneWise AI chatbot
 *   /s/{id}    → Upstream Craft Agents SessionViewer (read-only transcript)
 *   /s         → Session upload page
 */
function Router() {
  const path = window.location.pathname

  if (path === '/s' || path.startsWith('/s/')) {
    return <SessionViewPage />
  }

  // Default: ZoneWise chatbot
  return <App />
}

createRoot(container).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)
