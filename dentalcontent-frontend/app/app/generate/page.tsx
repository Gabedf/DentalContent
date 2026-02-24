'use client'
import { useState } from 'react'
import ImageGenerator from '@/components/ImageGenerator'
import Topbar from '@/components/layout/Topbar'
import { Select, Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Badge'
import { useProfiles } from '@/hooks/useProfiles'
import { useGenerate, useSchedule, useUpdateStatus } from '@/hooks/useContents'
import { Content, ContentType, Objective, Tone } from '@/types'
import toast from 'react-hot-toast'

function CopyBtn({ text }: { text: string }) {
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); toast.success('Copiado!') }}
      className="w-7 h-7 bg-surface2 border border-border rounded-md flex items-center justify-center text-ink-muted hover:border-border-strong hover:text-ink transition-all text-xs flex-shrink-0"
    >
      ⎘
    </button>
  )
}

export default function GeneratePage() {
  const { data: profiles } = useProfiles()
  const generateMutation = useGenerate()
  const scheduleMutation = useSchedule()
  const updateStatusMutation = useUpdateStatus()

  const [form, setForm] = useState({
    profile_id: '',
    content_type: 'educativo' as ContentType,
    theme: '',
    objective: 'educar' as Objective,
    tone: 'acessivel' as Tone,
  })

  const [result, setResult] = useState<Content | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleGenerate = async () => {
    if (!form.profile_id) { toast.error('Selecione um perfil.'); return }
    if (!form.theme.trim()) { toast.error('Informe o tema.'); return }
    const content = await generateMutation.mutateAsync({ ...form })
    setResult(content)
    setShowSchedule(false)
  }

  const handleApprove = async () => {
    if (!result) return
    await updateStatusMutation.mutateAsync({ id: result.id, status: 'approved' })
    setResult({ ...result, status: 'approved' })
  }

  const handleSchedule = async () => {
    if (!result || !scheduleDate) { toast.error('Selecione uma data.'); return }
    await scheduleMutation.mutateAsync({ id: result.id, scheduled_date: scheduleDate })
    setResult({ ...result, status: 'scheduled', scheduled_date: scheduleDate })
    setShowSchedule(false)
  }

  return (
    <div>
      <Topbar title="Gerar Conteúdo" />
      <div className="p-8">
        <div className="grid grid-cols-[360px_1fr] gap-6 items-start">

          {/* Form */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card sticky top-16">
            <h2 className="font-playfair font-semibold text-[15px] text-ink mb-5 tracking-tight">Parâmetros</h2>
            <div className="flex flex-col gap-4">
              <Select label="Perfil" value={form.profile_id} onChange={(e) => set('profile_id', e.target.value)}>
                <option value="">Selecione um perfil...</option>
                {profiles?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.subniche === 'estetico' ? 'Estético' : 'Implante'} · {p.city}</option>
                ))}
              </Select>
              <Select label="Tipo de conteúdo" value={form.content_type} onChange={(e) => set('content_type', e.target.value)}>
                <option value="educativo">Educativo</option>
                <option value="autoridade">Autoridade</option>
                <option value="quebra_objecao">Quebra de Objeção</option>
                <option value="bastidores">Bastidores</option>
                <option value="depoimento">Depoimento</option>
                <option value="procedimento">Procedimento</option>
              </Select>
              <Input label="Tema específico" placeholder="Ex: clareamento a laser, implante all-on-4..." value={form.theme} onChange={(e) => set('theme', e.target.value)} />
              <Select label="Objetivo" value={form.objective} onChange={(e) => set('objective', e.target.value)}>
                <option value="atrair_pacientes">Atrair novos pacientes</option>
                <option value="educar">Educar o público</option>
                <option value="construir_autoridade">Construir autoridade</option>
              </Select>
              <Select label="Tom" value={form.tone} onChange={(e) => set('tone', e.target.value)}>
                <option value="acessivel">Acessível</option>
                <option value="formal">Formal</option>
                <option value="tecnico">Técnico</option>
                <option value="humanizado">Humanizado</option>
              </Select>
            </div>
            <div className="mt-5 p-3 bg-surface2 rounded-lg border border-border">
              <p className="text-[12px] text-ink-muted leading-relaxed">
                Conteúdo gerado respeitando as <strong className="text-ink-mid">normas do CRO</strong> — sem promessas de resultado ou linguagem sensacionalista.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="mt-5 w-full bg-ink text-white font-semibold text-sm py-3 rounded-lg border-none cursor-pointer transition-all hover:bg-ink-mid disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {generateMutation.isPending ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gerando...</>
              ) : 'Gerar Conteúdo'}
            </button>
          </div>

          {/* Result */}
          <div className="flex flex-col gap-4">
            {!result && !generateMutation.isPending && (
              <div className="bg-surface border border-border rounded-xl flex items-center justify-center min-h-[400px] shadow-card">
                <div className="text-center">
                  <p className="font-playfair italic text-ink-muted text-lg mb-2">Pronto para gerar.</p>
                  <p className="text-sm text-ink-muted">Configure os parâmetros e clique em Gerar Conteúdo.</p>
                </div>
              </div>
            )}

            {generateMutation.isPending && (
              <div className="bg-surface border border-border rounded-xl flex items-center justify-center min-h-[400px] shadow-card">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-border border-t-green rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-ink-muted">Gerando conteúdo estratégico...</p>
                </div>
              </div>
            )}

            {result && (
              <>
                {/* Headlines */}
                <Card>
                  <CardHeader><CardTitle>3 Headlines estratégicas</CardTitle><CopyBtn text={result.headlines?.join('\n') || ''} /></CardHeader>
                  <div className="flex flex-col gap-2">
                    {result.headlines?.map((h, i) => (
                      <div key={i} className="bg-surface2 border border-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-border-strong transition-colors">
                        <span className="text-[11px] font-bold text-ink-faint w-5 flex-shrink-0">0{i+1}</span>
                        <span className="flex-1 text-[14px] text-ink">{h}</span>
                        <CopyBtn text={h} />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Caption */}
                <Card>
                  <CardHeader><CardTitle>Legenda completa</CardTitle><CopyBtn text={result.caption || ''} /></CardHeader>
                  <pre className="text-[13px] leading-relaxed text-ink-mid whitespace-pre-wrap bg-surface2 rounded-lg p-4 border border-border font-instrument">
                    {result.caption}
                  </pre>
                </Card>

                {/* Short version */}
                <Card>
                  <CardHeader><CardTitle>Versão resumida — Reels / Stories</CardTitle><CopyBtn text={result.short_version || ''} /></CardHeader>
                  <pre className="text-[13px] leading-relaxed text-ink-mid whitespace-pre-wrap bg-surface2 rounded-lg p-4 border border-border font-instrument">
                    {result.short_version}
                  </pre>
                </Card>

                {/* Hashtags */}
                <Card>
                  <CardHeader><CardTitle>Hashtags ({result.hashtags?.length || 0})</CardTitle><CopyBtn text={result.hashtags?.join(' ') || ''} /></CardHeader>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags?.map((tag, i) => (
                      <button key={i} onClick={() => { navigator.clipboard.writeText(tag); toast.success('Copiado!') }}
                        className="px-3 py-1 bg-surface2 border border-border rounded-full text-[12px] text-green hover:bg-green-light hover:border-green/30 transition-all cursor-pointer">
                        {tag}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Carousel */}
                <Card>
                  <CardHeader><CardTitle>Carrossel — {result.carousel?.length || 0} slides</CardTitle></CardHeader>
                  <div className="flex flex-col gap-2">
                    {result.carousel?.map((slide) => (
                      <div key={slide.slide} className="bg-surface2 border border-border rounded-lg p-4 flex gap-3">
                        <div className="w-7 h-7 rounded-md bg-green-light border border-green/20 flex items-center justify-center text-[12px] font-bold text-green flex-shrink-0">{slide.slide}</div>
                        <div>
                          <p className="text-[13px] font-semibold text-ink mb-0.5">{slide.title}</p>
                          <p className="text-[12px] text-ink-muted leading-relaxed">{slide.content}</p>
                          {slide.visual_suggestion && <p className="text-[11px] text-ink-faint mt-1.5 italic">{slide.visual_suggestion}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Action bar */}
                <div className="bg-surface border border-border rounded-xl px-6 py-4 flex items-center gap-3 flex-wrap shadow-card">
                  <span className="flex-1 text-[13px] text-ink-muted">Conteúdo gerado. O que deseja fazer?</span>
                  <Button variant="secondary" size="sm" onClick={handleApprove} loading={updateStatusMutation.isPending}>
                    {result.status === 'approved' ? '✓ Aprovado' : 'Aprovar'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowSchedule(!showSchedule)}>Agendar →</Button>
                </div>

                {showSchedule && (
                  <div className="bg-surface border border-border rounded-xl px-6 py-4 flex items-center gap-3 shadow-card">
                    <span className="text-[13px] text-ink-muted">Data de publicação:</span>
                    <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                      className="bg-surface2 border border-border rounded-lg px-3 py-2 text-ink text-sm outline-none focus:border-border-strong transition-colors" />
                    <Button variant="primary" size="sm" onClick={handleSchedule} loading={scheduleMutation.isPending}>Confirmar</Button>
                  </div>
                )}

                {/* Geração de imagem */}
                <ImageGenerator
                  contentType={result.content_type}
                  theme={form.theme}
                  headline={result.headlines?.[0]}
                  caption={result.caption}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}