import { trpc } from '@/lib/trpc'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  openId: string
}

/**
 * Authentication hook that provides current user state
 * Works with both Manus OAuth and custom authentication
 */
export function useAuth() {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery()

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
  }
}

/**
 * Get login URL for OAuth flow
 * Supports both Manus OAuth and custom providers
 */
export function getLoginUrl(): string {
  const portalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL
  const appId = import.meta.env.VITE_APP_ID
  const redirectUri = `${window.location.origin}/api/oauth/callback`
  
  if (portalUrl && appId) {
    // Manus OAuth
    return `${portalUrl}?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}`
  }
  
  // Fallback to custom auth (e.g., Supabase)
  return '/auth/login'
}

/**
 * Logout function that clears session and redirects
 */
export function logout(): void {
  window.location.href = '/api/auth/logout'
}
