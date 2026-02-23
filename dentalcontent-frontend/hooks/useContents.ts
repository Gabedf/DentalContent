'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { Content, ContentStatus, GeneratePayload, UsageStats } from '@/types'

// ── List contents ─────────────────────────────────
export function useContents(
  params?: {
    profile_id?: string
    status?: ContentStatus
    month?: number
    year?: number
  },
  options?: { refetchInterval?: number }
) {
  return useQuery<Content[]>({
    queryKey: ['contents', params],
    queryFn: async () => {
      const res = await api.get('/contents', { params })
      return res.data
    },
    refetchInterval: options?.refetchInterval,
  })
}

// ── Usage stats ───────────────────────────────────
export function useUsage() {
  return useQuery<UsageStats>({
    queryKey: ['usage'],
    queryFn: async () => {
      const res = await api.get('/contents/usage')
      return res.data
    },
    refetchInterval: 30_000,
  })
}

// ── Generate ──────────────────────────────────────
export function useGenerate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: GeneratePayload) => {
      const res = await api.post<Content>('/contents/generate', payload)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contents'] })
      qc.invalidateQueries({ queryKey: ['usage'] })
      toast.success('Conteúdo gerado com sucesso!')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Erro ao gerar conteúdo.'
      if (err.response?.status === 429) {
        toast.error('Limite mensal atingido. Faça upgrade do plano.')
      } else {
        toast.error(msg)
      }
    },
  })
}

// ── Update status (Kanban) ────────────────────────
export function useUpdateStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContentStatus }) => {
      const res = await api.patch<Content>(`/contents/${id}/status`, { status })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contents'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao atualizar status.'),
  })
}

// ── Schedule ──────────────────────────────────────
export function useSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, scheduled_date }: { id: string; scheduled_date: string }) => {
      const res = await api.patch<Content>(`/contents/${id}/schedule`, { scheduled_date })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contents'] })
      toast.success('Conteúdo agendado!')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao agendar.'),
  })
}
