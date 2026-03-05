import ChatWidget from '../components/web/ChatWidget'

/**
 * ZoneWise Desktop Chat Page
 * 
 * Renders the full split-screen AI chatbot for the desktop app.
 * Uses the same ChatWidget as the web version but pointed at 
 * the local IPC bridge (window.__ZONEWISE_API__) when available,
 * falling back to the production API.
 */
export default function Chat() {
  // In Electron, window.__ZONEWISE_API__ is injected by the main process
  // preload script and points to the local IPC endpoint that proxies
  // to Claude API with the key stored in main process (never renderer).
  const apiEndpoint =
    typeof window !== 'undefined' && (window as any).__ZONEWISE_API__
      ? (window as any).__ZONEWISE_API__
      : 'https://zonewise.ai/api/chat'

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950 overflow-hidden">
      <ChatWidget apiEndpoint={apiEndpoint} />
    </div>
  )
}
