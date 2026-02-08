/**
 * Authentication hook — lightweight version without tRPC
 * Uses localStorage for user state, Supabase auth when available
 */

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  openId: string
}

const USER_KEY = 'zonewise_user'

function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function useAuth() {
  // For MVP: use a default user profile
  // When Supabase auth is wired, this will query the session
  const user = getStoredUser() || {
    id: 'local-user',
    name: 'User',
    email: '',
    role: 'user' as const,
    openId: '',
  }

  return {
    user,
    isLoading: false,
    isAuthenticated: true, // MVP: always authenticated
    error: null,
  }
}

export function getLoginUrl(): string {
  return '/auth/login'
}

export function logout(): void {
  localStorage.removeItem(USER_KEY)
  window.location.href = '/'
}
