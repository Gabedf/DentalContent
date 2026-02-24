'use client'
import { useState } from 'react'
import { useImageGeneration, useImageUsage } from '@/hooks/useImageGeneration'
import { useAuthStore } from '@/lib/authStore'
import { Download, Sparkles, Lock, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

const STYLES = [
  { id: 'clean', label: 'Clean', preview: 'from-stone-50 to-white', dot: 'bg-stone-400' },
  { id: 'bold', label: 'Bold', preview: 'from-stone-800 to-stone-950', dot: 'bg-white' },
  { id: 'warm', label: 'Warm', preview: 'from-amber-100 to-orange-50', dot: 'bg-amber-500' },
  { id: 'gradient', label: 'Modern', preview: 'from-violet-100 to-blue-50', dot: 'bg-violet-500' },
]

interface Props {
  contentType?: string
  theme?: string
  headline?: string
  caption?: string
}

export default function ImageGenerator({ theme, headline }: Props) {
  const { user } = useAuthStore()
  const [selectedStyle, setSelectedStyle] = useState('clean')
  const [generatedImage, setGeneratedImage] = useState<{ url: string } | null>(null)
  const { generateMutation } = useImageGeneration()
  const { data: usage, refetch } = useImageUsage()

  const canGenerate = usage?.available !== false
  const isEssencial = user?.plan === 'essencial'

  const handleGenerate = async () => {
    if (!canGenerate) return
    setGeneratedImage(null)
    const result = await generateMutation.mutateAsync({
      style: selectedStyle,
      headline,
      customDescription: theme,
    })
    setGeneratedImage({ url: result.url })
    refetch()
    toast.success('Imagem gerada! Disponível por 1 hora.')
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    try {
      const response = await fetch(generatedImage.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dentalcontent-${selectedStyle}-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Clique com botão direito na imagem → Salvar imagem.')
    }
  }

  if (isEssencial) {
    return (
      <div className="border border-border rounded-xl p-4 bg-surface flex items-center gap-3">
        <Lock size={15} className="text-ink-muted flex-shrink-0" />
        <p className="text-[13px] text-ink-muted flex-1">Geração de imagens disponível nos planos Pro e Clínica.</p>
        <a href="/app/settings" className="text-[13px] font-medium text-green hover:underline whitespace-nowrap">Upgrade →</a>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-green" />
          <span className="font-semibold text-[13px] text-ink">Gerar imagem para este post</span>
        </div>
        {usage && (
          <span className="text-[11px] text-ink-muted">
            {usage.used}/{usage.limit === 'unlimited' ? '∞' : usage.limit} {user?.plan === 'gratis' ? 'total' : 'este mês'}
          </span>
        )}
      </div>

      <div className="p-4">
        {!generatedImage ? (
          <>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`rounded-lg border-2 p-2 text-center transition-all ${
                    selectedStyle === s.id ? 'border-green' : 'border-border hover:border-border-strong'
                  }`}
                >
                  <div className={`w-full h-8 rounded bg-gradient-to-br ${s.preview} mb-1.5 flex items-center justify-center border border-border/30`}>
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  </div>
                  <p className="text-[11px] font-medium text-ink">{s.label}</p>
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate || generateMutation.isPending}
              className="w-full bg-ink text-white rounded-xl py-2.5 text-[13px] font-semibold hover:bg-ink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generateMutation.isPending ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gerando...</>
              ) : !canGenerate ? (
                <><Lock size={13} /> Limite atingido</>
              ) : (
                <><Sparkles size={13} /> Gerar imagem</>
              )}
            </button>

            {!canGenerate && (
              <p className="text-[11px] text-ink-muted text-center mt-2">
                <a href="/app/settings" className="text-green hover:underline">Fazer upgrade</a> para mais imagens.
              </p>
            )}
            <p className="text-[11px] text-ink-faint text-center mt-2">Imagem expira em 1 hora · Para mais opções: <a href="/app/images" className="text-green hover:underline">Gerar Imagem</a></p>
          </>
        ) : (
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden aspect-square bg-surface2">
              <img src={generatedImage.url} alt="Gerada" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">~1h</div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownload} className="flex-1 bg-green text-white rounded-xl py-2.5 text-[13px] font-semibold hover:bg-green/90 transition-all flex items-center justify-center gap-1.5">
                <Download size={13} /> Baixar
              </button>
              <button onClick={() => setGeneratedImage(null)} className="px-3 bg-surface2 border border-border text-ink rounded-xl text-[13px] hover:bg-border transition-all">
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}