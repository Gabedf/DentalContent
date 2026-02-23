'use client'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export function useCheckout() {
  return useMutation({
    mutationFn: async (plan: 'essencial' | 'pro' | 'clinica') => {
      const res = await api.post<{ url: string }>('/stripe/checkout', { plan })
      return res.data
    },
    onSuccess: ({ url }) => {
      // Redireciona para o Stripe Checkout
      window.location.href = url
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao abrir checkout.')
    },
  })
}