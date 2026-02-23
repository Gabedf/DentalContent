'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { Profile, Subniche, Tone } from '@/types'

export function useProfiles() {
  return useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const res = await api.get('/profiles')
      return res.data
    },
  })
}

export function useCreateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; subniche: Subniche; city: string; preferred_tone: Tone }) => {
      const res = await api.post<Profile>('/profiles', data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Perfil criado!')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao criar perfil.'),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Profile> & { id: string }) => {
      const res = await api.patch<Profile>(`/profiles/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Perfil atualizado!')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao atualizar.'),
  })
}
