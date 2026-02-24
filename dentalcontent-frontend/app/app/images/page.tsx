'use client'
import { useState, useCallback } from 'react'
import Topbar from '@/components/layout/Topbar'
import { useImageGeneration, useImageUsage } from '@/hooks/useImageGeneration'
import { Download, Sparkles, Lock, RotateCcw, Palette, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/authStore'

const STYLES = [
  { id: 'clean', label: 'Clean Clínico', desc: 'Minimalista, tons claros, premium', preview: 'from-stone-50 to-white', dot: 'bg-stone-400' },
  { id: 'bold', label: 'Bold Editorial', desc: 'Escuro, contraste alto, impactante', preview: 'from-stone-800 to-stone-950', dot: 'bg-white' },
  { id: 'warm', label: 'Warm Lifestyle', desc: 'Tons quentes, acolhedor, humano', preview: 'from-amber-100 to-orange-50', dot: 'bg-amber-500' },
  { id: 'gradient', label: 'Gradient Modern', desc: 'Gradiente suave, moderno, digital', preview: 'from-violet-100 to-blue-50', dot: 'bg-violet-500' },
]

const VISUAL_THEMES = [
  { id: '', label: 'Sem tema específico' },
  { id: 'smile_transformation', label: 'Transformação do Sorriso' },
  { id: 'clinical_premium', label: 'Clínica Premium' },
  { id: 'aesthetic_procedure', label: 'Procedimento Estético' },
  { id: 'oral_health', label: 'Saúde Bucal' },
  { id: 'implant_technology', label: 'Tecnologia & Implante' },
  { id: 'patient_trust', label: 'Confiança & Cuidado' },
  { id: 'whitening', label: 'Clareamento' },
  { id: 'braces_aligners', label: 'Ortodontia' },
]

const PALETTE_PRESETS = [
  { hex: '#2D6A4F', label: 'Verde Clínico' },
  { hex: '#1A1A18', label: 'Preto Editorial' },
  { hex: '#C9A96E', label: 'Dourado Premium' },
  { hex: '#4A90D9', label: 'Azul Confiança' },
  { hex: '#E8D5C4', label: 'Nude Sofisticado' },
  { hex: '#8B4B8B', label: 'Roxo Luxury' },
]

export default function ImagesPage() {
  const { user } = useAuthStore()
  const { generateMutation } = useImageGeneration()
  const { data: usage, refetch: refetchUsage } = useImageUsage()

  const [style, setStyle] = useState('clean')
  const [visualTheme, setVisualTheme] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#2D6A4F')
  const [useColor, setUseColor] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<{ url: string; style: string } | null>(null)

  const canGenerate = usage?.available !== false
  const isEssencial = user?.plan === 'essencial'
  const isGratis = user?.plan === 'gratis'

  const handleGenerate = async () => {
    if (!canGenerate) return
    setGeneratedImage(null)
    const result = await generateMutation.mutateAsync({
      style,
      visualTheme: visualTheme || undefined,
      customDescription: customDescription || undefined,
      primaryColor: useColor ? primaryColor : undefined,
    })
    setGeneratedImage({ url: result.url, style: result.style })
    refetchUsage()
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
      a.download = `dentalcontent-${style}-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erro ao baixar. Clique com botão direito → Salvar imagem.')
    }
  }

  if (isEssencial) {
    return (
      <div className="flex-1 flex flex-col">
        <Topbar title="Geração de Imagens" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-ink-muted" />
            </div>
            <h2 className="font-playfair font-bold text-2xl text-ink mb-2">Recurso Pro</h2>
            <p className="text-ink-muted text-sm mb-5">Geração de imagens está disponível nos planos Pro e Clínica.</p>
            <a href="/app/settings" className="inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-ink/90 transition-all">
              Fazer upgrade →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Geração de Imagens" />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-playfair font-bold text-2xl text-ink">Criar imagem para Instagram</h1>
              <p className="text-ink-muted text-sm mt-1">Gere imagens profissionais prontas para o seu post</p>
            </div>
            {usage && (
              <div className="text-right">
                <p className="text-[11px] text-ink-muted uppercase tracking-wider mb-1">Imagens {isGratis ? 'no total' : 'este mês'}</p>
                <p className="font-playfair font-bold text-2xl text-ink">
                  {usage.used}<span className="text-ink-muted font-normal text-base">/{usage.limit === 'unlimited' ? '∞' : usage.limit}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-[1fr_400px] gap-6">

            {/* ── Painel de configuração ── */}
            <div className="space-y-5">

              {/* 1 — Estilo visual */}
              <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">1. Estilo visual</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`rounded-xl border-2 p-3 text-left transition-all ${
                        style === s.id ? 'border-green shadow-sm' : 'border-border hover:border-border-strong'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${s.preview} mb-2.5 flex items-center justify-center border border-border/50`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                      </div>
                      <p className="text-[12px] font-semibold text-ink">{s.label}</p>
                      <p className="text-[11px] text-ink-muted mt-0.5">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2 — Tema visual */}
              <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">2. Tema visual</p>
                <div className="grid grid-cols-2 gap-2">
                  {VISUAL_THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setVisualTheme(t.id)}
                      className={`text-left px-3 py-2.5 rounded-lg border text-[13px] transition-all ${
                        visualTheme === t.id
                          ? 'border-green bg-green-light text-ink font-medium'
                          : 'border-border text-ink-mid hover:border-border-strong hover:text-ink'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 — Descrição livre */}
              <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3">3. Descrição adicional <span className="normal-case font-normal">(opcional)</span></p>
                <textarea
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  placeholder="Ex: mostrar um consultório moderno com luz natural, sem pessoas, foco nos equipamentos..."
                  rows={3}
                  className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint outline-none focus:border-border-strong transition-colors resize-none"
                />
              </div>

              {/* 4 — Cor base */}
              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">4. Cor base <span className="normal-case font-normal">(opcional)</span></p>
                  <button
                    onClick={() => setUseColor(!useColor)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${useColor ? 'bg-green' : 'bg-border'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${useColor ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>

                {useColor && (
                  <div className="space-y-3">
                    {/* Presets */}
                    <div className="flex gap-2 flex-wrap">
                      {PALETTE_PRESETS.map(p => (
                        <button
                          key={p.hex}
                          onClick={() => setPrimaryColor(p.hex)}
                          title={p.label}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${primaryColor === p.hex ? 'border-ink scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: p.hex }}
                        />
                      ))}
                    </div>

                    {/* Color picker + hex */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor }} />
                        <span className="text-[13px] font-mono text-ink">{primaryColor.toUpperCase()}</span>
                      </div>
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={e => {
                          const v = e.target.value
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setPrimaryColor(v)
                        }}
                        className="w-24 bg-surface2 border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-ink outline-none focus:border-border-strong"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                )}

                {!useColor && (
                  <p className="text-[12px] text-ink-muted">Ative para definir uma cor dominante na imagem.</p>
                )}
              </div>
            </div>

            {/* ── Painel de resultado ── */}
            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-xl overflow-hidden sticky top-4">

                {/* Preview / resultado */}
                <div className="aspect-square bg-surface2 relative">
                  {generatedImage ? (
                    <>
                      <img src={generatedImage.url} alt="Imagem gerada" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                        Expira em ~1h
                      </div>
                    </>
                  ) : generateMutation.isPending ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-border border-t-ink rounded-full animate-spin" />
                      <p className="text-[12px] text-ink-muted">Gerando imagem...</p>
                      <p className="text-[11px] text-ink-faint">Isso pode levar até 30 segundos</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center">
                        <ImageIcon size={24} className="text-ink-muted" />
                      </div>
                      <p className="text-[13px] text-ink-muted text-center px-6">Configure as opções ao lado e clique em gerar</p>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="p-4 space-y-2">
                  {!generatedImage ? (
                    <button
                      onClick={handleGenerate}
                      disabled={!canGenerate || generateMutation.isPending}
                      className="w-full bg-ink text-white rounded-xl py-3 text-[13px] font-semibold hover:bg-ink/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Gerando...
                        </>
                      ) : !canGenerate ? (
                        <><Lock size={14} /> Limite atingido</>
                      ) : (
                        <><Sparkles size={14} /> Gerar imagem</>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleDownload}
                        className="w-full bg-green text-white rounded-xl py-3 text-[13px] font-semibold hover:bg-green/90 transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={14} /> Baixar imagem (1080×1080)
                      </button>
                      <button
                        onClick={() => { setGeneratedImage(null); }}
                        className="w-full bg-surface2 text-ink rounded-xl py-2.5 text-[13px] font-medium hover:bg-border transition-all border border-border flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={13} /> Gerar outra
                      </button>
                    </>
                  )}

                  {!canGenerate && (
                    <p className="text-[12px] text-ink-muted text-center">
                      <a href="/app/settings" className="text-green hover:underline">Fazer upgrade</a> para gerar mais imagens.
                    </p>
                  )}

                  <p className="text-[11px] text-ink-faint text-center pt-1">
                    Formato 1080×1080px · Link expira em 1 hora
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}