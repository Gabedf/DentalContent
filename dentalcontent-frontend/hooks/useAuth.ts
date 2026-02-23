'use client'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/authStore'
import { AuthResponse } from '@/types'

export function useAuth() {
  const router = useRouter()
  const qc = useQueryClient()
  const { setAuth, clearAuth, user, isLoggedIn } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/login', data)
      return res.data
    },
    onSuccess: ({ user, token }) => {
      // Limpa cache de qualquer conta anterior antes de setar a nova
      qc.clear()
      setAuth(user, token)
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}!`)
      router.push('/app/dashboard')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Credenciais inválidas.')
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/register', data)
      return res.data
    },
    onSuccess: ({ user, token }) => {
      // Limpa cache também no registro
      qc.clear()
      setAuth(user, token)
      toast.success('Conta criada! Bem-vindo ao DentalContent Pro.')
      router.push('/app/dashboard')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao criar conta.')
    },
  })

  const logout = () => {
    // Limpa cache ao sair para não vazar dados entre contas
    qc.clear()
    clearAuth()
    router.push('/login')
  }

  return { loginMutation, registerMutation, logout, user, isLoggedIn }
}
