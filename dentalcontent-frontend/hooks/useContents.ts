'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { Content, ContentStatus, GeneratePayload, UsageStats } from '@/types'

// ── List ──────────────────────────────────────────────────────────
export function useContents(
  params?: { profile_id?: string; status?: ContentStatus; month?: number; year?: number },
  options?: { refetchInterval?: number }
) {
  return useQuery<Content[]>({
    queryKey: ['contents', params],
    queryFn: async () => (await api.get('/contents', { params })).data,
    refetchInterval: options?.refetchInterval,
  })
}

// ── Usage ─────────────────────────────────────────────────────────
export function useUsage() {
  return useQuery<UsageStats>({
    queryKey: ['usage'],
    queryFn: async () => (await api.get('/contents/usage')).data,
    refetchInterval: 30_000,
  })
}

// ── Generate ──────────────────────────────────────────────────────
export function useGenerate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: GeneratePayload) =>
      (await api.post<Content>('/contents/generate', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contents'] })
      qc.invalidateQueries({ queryKey: ['usage'] })
      toast.success('Conteúdo gerado com sucesso!')
    },
    onError: (err: any) => {
      if (err.response?.status === 429) toast.error('Limite mensal atingido. Faça upgrade do plano.')
      else toast.error(err.response?.data?.error || 'Erro ao gerar conteúdo.')
    },
  })
}

// ── Edit fields ───────────────────────────────────────────────────
export function useUpdateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: Partial<Pick<Content, 'headlines' | 'caption' | 'short_version' | 'hashtags' | 'carousel'>> }) =>
      (await api.patch<Content>(`/contents/${id}`, fields)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contents'] })
      toast.success('Conteúdo salvo!')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao salvar.'),
  })
}

// ── Regenerate section ────────────────────────────────────────────
export function useRegenerateSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, section }: { id: string; section: string }) =>
      (await api.post(`/contents/${id}/regenerate`, { section })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usage'] })
    },
    onError: (err: any) => {
      if (err.response?.status === 429) toast.error('Limite mensal atingido.')
      else toast.error(err.response?.data?.error || 'Erro ao regenerar.')
    },
  })
}

// ── Update status ─────────────────────────────────────────────────
export function useUpdateStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContentStatus }) =>
      (await api.patch<Content>(`/contents/${id}/status`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contents'] }),
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao atualizar status.'),
  })
}

// ── Schedule ──────────────────────────────────────────────────────
export function useSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, scheduled_date }: { id: string; scheduled_date: string }) =>
      (await api.patch<Content>(`/contents/${id}/schedule`, { scheduled_date })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contents'] })
      toast.success('Conteúdo agendado!')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao agendar.'),
  })
}

// ── Battery: suggest ──────────────────────────────────────────────
export function useSuggestBattery() {
  return useMutation({
    mutationFn: async (payload: { profile_id: string; month: number; year: number; posts_per_week: number }) =>
      (await api.post('/contents/battery/suggest', payload)).data,
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao sugerir plano.'),
  })
}

// ── Battery: generate ─────────────────────────────────────────────
export function useGenerateBattery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) =>
      (await api.post('/contents/battery/generate', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contents'] })
      qc.invalidateQueries({ queryKey: ['usage'] })
    },
    onError: (err: any) => {
      if (err.response?.status === 429) toast.error('Limite mensal atingido.')
      else toast.error(err.response?.data?.error || 'Erro ao gerar bateria.')
    },
  })
}
