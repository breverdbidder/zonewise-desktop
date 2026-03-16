import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { SessionViewPage } from './SessionViewPage'
import { OpsPage } from './OpsPage'
import Home from 'zonewise/pages/Home'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

/**
 * Client-side router:
 *   /          → ZoneWise.AI animated landing page
 *   /app       → ZoneWise AI chatbot (Craft Agent)
 *   /s/{id}    → Session viewer (read-only transcript)
 *   /s         → Session upload page
 *   /ops       → Agent ops dashboard
 */
function Router() {
  const path = window.location.pathname

  if (path === '/s' || path.startsWith('/s/')) {
    return <SessionViewPage />
  }

  if (path === '/ops') {
    return <OpsPage />
  }

  if (path === '/app' || path.startsWith('/app/')) {
    return <App />
  }

  // Default: animated landing page
  return <Home />
}

createRoot(container).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)
