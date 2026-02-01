import { CraftAgentLayout } from '@/components/CraftAgentLayout'

/**
 * Craft Agent Page - Conversational AI interface for zoning analysis
 * 
 * This is the primary interface for ZoneWise, providing a chat-based
 * experience for property analysis, zoning research, and regulation queries.
 * 
 * Features:
 * - Turn-based conversation with AI assistant
 * - Session management with localStorage persistence
 * - Property visualization integration (map, 3D, sun/shadow)
 * - Activity tracking for tool calls and API requests
 * - Markdown rendering with code highlighting
 * - Mobile-responsive 3-panel layout
 */
export default function CraftAgent() {
  return <CraftAgentLayout />
}
