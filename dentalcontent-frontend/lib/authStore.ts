import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isLoggedIn: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dc_token', token)
      localStorage.setItem('dc_user', JSON.stringify(user))
    }
    set({ user, token })
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dc_token')
      localStorage.removeItem('dc_user')
    }
    set({ user: null, token: null })
  },

  isLoggedIn: () => {
    if (get().token) return true
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('dc_token')
    }
    return false
  },
}))

// Hydrate from localStorage on app load
export function hydrateAuth() {
  if (typeof window === 'undefined') return
  const token = localStorage.getItem('dc_token')
  const userStr = localStorage.getItem('dc_user')
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr)
      useAuthStore.getState().setAuth(user, token)
    } catch {}
  }
}
