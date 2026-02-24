'use client'
import { useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function useGoogleAuth() {
  const { data: session, status } = useSession()
  const { setAuth, clearAuth } = useAuthStore()
  const qc = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    // Quando o NextAuth retornar sessão com o token do backend, seta no store
    if (status === 'authenticated' && (session as any)?.backendToken) {
      const backendToken = (session as any).backendToken
      const backendUser = (session as any).backendUser
      if (backendToken && backendUser) {
        qc.clear()
        setAuth(backendUser, backendToken)
        router.push('/app/dashboard')
      }
    }
  }, [session, status])

  const loginWithGoogle = () => {
    signIn('google')
  }

  const logoutGoogle = async () => {
    qc.clear()
    clearAuth()
    await signOut({ redirect: false })
    router.push('/login')
  }

  return { loginWithGoogle, logoutGoogle }
}