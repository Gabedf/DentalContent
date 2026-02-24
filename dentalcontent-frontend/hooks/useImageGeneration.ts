import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface GenerateImageParams {
  style: 'clean' | 'bold' | 'warm'
  content_type?: string
  theme?: string
  headline?: string
  caption?: string
}

interface ImageResult {
  url: string
  style: string
  revised_prompt: string
  expires_in: string
}

export function useImageGeneration() {
  const generateMutation = useMutation({
    mutationFn: async (params: GenerateImageParams): Promise<ImageResult> => {
      const res = await api.post('/images/generate', params)
      return res.data
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'Erro ao gerar imagem.'
      toast.error(msg)
    },
  })

  return { generateMutation }
}

export function useImageUsage() {
  return useQuery({
    queryKey: ['image-usage'],
    queryFn: async () => {
      const res = await api.get('/images/usage')
      return res.data
    },
  })
}