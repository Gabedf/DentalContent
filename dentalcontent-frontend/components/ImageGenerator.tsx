'use client'
import { useState } from 'react'
import { useImageGeneration, useImageUsage } from '@/hooks/useImageGeneration'
import { useAuthStore } from '@/lib/authStore'
import { Download, Image as ImageIcon, Sparkles, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const STYLES = [
  {
    id: 'clean' as const,
    label: 'Clean Clínico',
    description: 'Minimalista, tons claros, premium',
    preview: 'bg-gradient-to-br from-stone-100 to-white border-stone-200',
    dot: 'bg-stone-400',
  },
  {
    id: 'bold' as const,
    label: 'Bold Editorial',
    description: 'Escuro, contraste alto, impactante',
    preview: 'bg-gradient-to-br from-stone-800 to-stone-950 border-stone-700',
    dot: 'bg-stone-300',
  },
  {
    id: 'warm' as const,
    label: 'Warm Lifestyle',
    description: 'Tons quentes, acolhedor, humano',
    preview: 'bg-gradient-to-br from-amber-100 to-orange-50 border-amber-200',
    dot: 'bg-amber-500',
  },
]

interface Props {
  contentType?: string
  theme?: string
}

export default function ImageGenerator({ contentType, theme }: Props) {
  const { user } = useAuthStore()
  const [selectedStyle, setSelectedStyle] = useState<'clean' | 'bold' | 'warm'>('clean')
  const [generatedImage, setGeneratedImage] = useState<{ url: string; style: string } | null>(null)
  const { generateMutation } = useImageGeneration()
  const { data: usage } = useImageUsage()

  const canGenerate = usage?.available !== false
  const isEssencial = user?.plan === 'essencial'
  const isGratis = user?.plan === 'gratis'

  const handleGenerate = async () => {
    if (!canGenerate) return
    const result = await generateMutation.mutateAsync({
      style: selectedStyle,
      content_type: contentType,
      theme,
    })
    setGeneratedImage({ url: result.url, style: result.style })
    toast.success('Imagem gerada! Faça o download em até 1 hora.')
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
      toast.error('Erro ao baixar. Tente clicar com botão direito → Salvar imagem.')
    }
  }

  // Plano essencial não tem imagens
  if (isEssencial) {
    return (
      <div className="border border-border rounded-xl p-5 bg-surface">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={16} className="text-ink-muted" />
          <span className="font-semibold text-sm text-ink">Geração de Imagens</span>
        </div>
        <p className="text-[13px] text-ink-muted mb-3">
          Disponível nos planos Pro e Clínica. Gere imagens para Instagram criadas especialmente para o seu conteúdo.
        </p>
        <a href="/app/settings" className="text-[13px] font-medium text-green hover:underline">
          Fazer upgrade →
        </a>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-green" />
          <span className="font-semibold text-sm text-ink">Gerar Imagem para o Post</span>
        </div>
        {usage && (
          <span className="text-[11px] text-ink-muted bg-surface2 px-2 py-1 rounded-full">
            {isGratis
              ? `${usage.used}/${usage.limit} imagem grátis`
              : `${usage.used}/${usage.limit} este mês`}
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Seleção de estilo */}
        {!generatedImage && (
          <>
            <p className="text-[12px] text-ink-muted mb-3 uppercase tracking-wider font-medium">Escolha o estilo visual</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    selectedStyle === style.id
                      ? 'border-green shadow-sm'
                      : 'border-border hover:border-border-strong'
                  }`}
                >
                  {/* Preview visual */}
                  <div className={`w-full aspect-square rounded-lg border mb-2.5 ${style.preview} flex items-center justify-center`}>
                    <div className={`w-3 h-3 rounded-full ${style.dot}`} />
                  </div>
                  <p className="text-[12px] font-semibold text-ink leading-tight">{style.label}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5 leading-tight">{style.description}</p>
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate || generateMutation.isPending}
              className="w-full bg-ink text-white rounded-xl py-3 text-[13px] font-semibold hover:bg-ink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gerando imagem...
                </>
              ) : !canGenerate ? (
                <>
                  <Lock size={14} />
                  Limite atingido
                </>
              ) : (
                <>
                  <ImageIcon size={14} />
                  Gerar imagem — {STYLES.find(s => s.id === selectedStyle)?.label}
                </>
              )}
            </button>

            {!canGenerate && (
              <p className="text-[12px] text-ink-muted text-center mt-2">
                <a href="/app/settings" className="text-green hover:underline">Fazer upgrade</a> para gerar mais imagens.
              </p>
            )}

            <p className="text-[11px] text-ink-muted text-center mt-3">
              ⏱ A imagem fica disponível por 1 hora após a geração
            </p>
          </>
        )}

        {/* Imagem gerada */}
        {generatedImage && (
          <div className="animate-slide-up">
            <div className="relative rounded-xl overflow-hidden mb-3 bg-surface2">
              <img
                src={generatedImage.url}
                alt="Imagem gerada"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                Expira em ~1h
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 bg-green text-white rounded-xl py-3 text-[13px] font-semibold hover:bg-green/90 transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} />
                Baixar imagem
              </button>
              <button
                onClick={() => setGeneratedImage(null)}
                className="px-4 bg-surface2 text-ink rounded-xl py-3 text-[13px] font-medium hover:bg-border transition-all border border-border"
              >
                Gerar outra
              </button>
            </div>

            <p className="text-[11px] text-ink-muted text-center mt-2">
              Estilo: {generatedImage.style} · Formato 1080×1080px
            </p>
          </div>
        )}
      </div>
    </div>
  )
}