'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ImageGenerator from '@/components/ImageGenerator'
import Topbar from '@/components/layout/Topbar'
import { Select, Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Badge'
import { useProfiles } from '@/hooks/useProfiles'
import { useGenerate, useUpdateContent, useRegenerateSection, useSchedule, useUpdateStatus } from '@/hooks/useContents'
import { Content, ContentType, Objective, Tone } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

function Spinner({ size = 14 }: { size?: number }) {
  return <span style={{ width: size, height: size }} className="border-2 border-current border-t-transparent rounded-full animate-spin inline-block flex-shrink-0" />
}

function CopyBtn({ text }: { text: string }) {
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); toast.success('Copiado!') }}
      className="w-7 h-7 bg-surface2 border border-border rounded-md flex items-center justify-center text-ink-muted hover:border-border-strong hover:text-ink transition-all text-xs flex-shrink-0">
      ⎘
    </button>
  )
}

function SectionActions({ onRegen, onEdit, isEditing, isRegening, hasChanges, onSave, onDiscard }: {
  onRegen: () => void; onEdit: () => void; isEditing: boolean; isRegening: boolean
  hasChanges: boolean; onSave: () => void; onDiscard: () => void
}) {
  if (isEditing) return (
    <div className="flex items-center gap-1.5">
      {hasChanges && (
        <button onClick={onSave} className="px-2.5 py-1 rounded-md bg-ink text-white text-[11px] font-semibold hover:bg-ink-mid transition-all">
          Salvar
        </button>
      )}
      <button onClick={onDiscard} className="px-2.5 py-1 rounded-md bg-surface2 border border-border text-ink-muted text-[11px] font-medium hover:border-border-strong hover:text-ink transition-all">
        {hasChanges ? 'Descartar' : 'Fechar'}
      </button>
    </div>
  )
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={onEdit} className="px-2.5 py-1 rounded-md bg-surface2 border border-border text-ink-muted text-[11px] font-medium hover:border-border-strong hover:text-ink transition-all flex items-center gap-1">
        ✎ Editar
      </button>
      <button onClick={onRegen} disabled={isRegening} className="px-2.5 py-1 rounded-md bg-surface2 border border-border text-ink-muted text-[11px] font-medium hover:border-green/40 hover:text-green hover:bg-green-light transition-all flex items-center gap-1.5 disabled:opacity-40">
        {isRegening ? <Spinner size={11} /> : '↺'} Regenerar
      </button>
    </div>
  )
}

// ── Headlines ────────────────────────────────────────────────────
function HeadlinesSection({ content, onSave, onRegen, regeningSection }: any) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<string[]>(content.headlines || [])
  const orig = useRef<string[]>(content.headlines || [])

  if (!editing) {
    const cur = JSON.stringify(content.headlines)
    if (cur !== JSON.stringify(orig.current)) { orig.current = content.headlines || []; setDraft(content.headlines || []) }
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(orig.current)
  const handleSave = async () => { await onSave({ headlines: draft }); orig.current = draft; setEditing(false) }

  return (
    <Card>
      <CardHeader>
        <CardTitle>3 Headlines estratégicas</CardTitle>
        <div className="flex items-center gap-2">
          <CopyBtn text={(content.headlines || []).join('\n')} />
          <SectionActions onRegen={() => onRegen('headlines')} onEdit={() => { setDraft([...orig.current]); setEditing(true) }}
            isEditing={editing} isRegening={regeningSection === 'headlines'} hasChanges={hasChanges}
            onSave={handleSave} onDiscard={() => { setDraft([...orig.current]); setEditing(false) }} />
        </div>
      </CardHeader>
      <div className="flex flex-col gap-2">
        {(editing ? draft : content.headlines || []).map((h: string, i: number) => (
          <div key={i} className={cn('bg-surface2 border rounded-lg px-4 py-3 flex items-center gap-3 transition-colors', editing ? 'border-border-strong' : 'border-border hover:border-border-strong')}>
            <span className="text-[11px] font-bold text-ink-faint w-5 flex-shrink-0">0{i + 1}</span>
            {editing
              ? <input value={h} onChange={e => setDraft(d => d.map((v, j) => j === i ? e.target.value : v))} className="flex-1 bg-transparent text-[14px] text-ink outline-none" />
              : <><span className="flex-1 text-[14px] text-ink">{h}</span><CopyBtn text={h} /></>}
          </div>
        ))}
      </div>
      {regeningSection === 'headlines' && <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-muted"><Spinner size={12} /> Gerando novas headlines...</div>}
    </Card>
  )
}

// ── Caption + Short ──────────────────────────────────────────────
function CaptionSection({ content, onSave, onRegen, regeningSection }: any) {
  const [editing, setEditing] = useState(false)
  const [dc, setDc] = useState(content.caption || '')
  const [ds, setDs] = useState(content.short_version || '')
  const oc = useRef(content.caption || '')
  const os = useRef(content.short_version || '')

  if (!editing && content.caption !== oc.current) {
    oc.current = content.caption || ''; os.current = content.short_version || ''
    setDc(content.caption || ''); setDs(content.short_version || '')
  }

  const hasChanges = dc !== oc.current || ds !== os.current
  const handleSave = async () => { await onSave({ caption: dc, short_version: ds }); oc.current = dc; os.current = ds; setEditing(false) }
  const startEdit = () => { setDc(oc.current); setDs(os.current); setEditing(true) }
  const discard = () => { setDc(oc.current); setDs(os.current); setEditing(false) }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Legenda completa</CardTitle>
          <div className="flex items-center gap-2">
            <CopyBtn text={content.caption || ''} />
            <SectionActions onRegen={() => onRegen('caption')} onEdit={startEdit} isEditing={editing}
              isRegening={regeningSection === 'caption'} hasChanges={hasChanges} onSave={handleSave} onDiscard={discard} />
          </div>
        </CardHeader>
        {editing
          ? <Textarea value={dc} onChange={e => setDc(e.target.value)} className="text-[13px] leading-relaxed min-h-[180px]" />
          : <pre className="text-[13px] leading-relaxed text-ink-mid whitespace-pre-wrap bg-surface2 rounded-lg p-4 border border-border font-instrument">{content.caption}</pre>}
        {regeningSection === 'caption' && <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-muted"><Spinner size={12} /> Regenerando legenda...</div>}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Versão resumida — Reels / Stories</CardTitle>
          <div className="flex items-center gap-2">
            <CopyBtn text={content.short_version || ''} />
            {!editing && <SectionActions onRegen={() => onRegen('short_version')} onEdit={startEdit} isEditing={false}
              isRegening={regeningSection === 'short_version'} hasChanges={false} onSave={handleSave} onDiscard={discard} />}
          </div>
        </CardHeader>
        {editing
          ? <Textarea value={ds} onChange={e => setDs(e.target.value)} className="text-[13px] leading-relaxed min-h-[80px]" />
          : <pre className="text-[13px] leading-relaxed text-ink-mid whitespace-pre-wrap bg-surface2 rounded-lg p-4 border border-border font-instrument">{content.short_version}</pre>}
        {regeningSection === 'short_version' && <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-muted"><Spinner size={12} /> Regenerando versão resumida...</div>}
      </Card>
    </>
  )
}

// ── Hashtags ─────────────────────────────────────────────────────
function HashtagsSection({ content, onSave, onRegen, regeningSection }: any) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState((content.hashtags || []).join(' '))
  const orig = useRef((content.hashtags || []).join(' '))

  if (!editing) {
    const cur = (content.hashtags || []).join(' ')
    if (cur !== orig.current) { orig.current = cur; setDraft(cur) }
  }

  const hasChanges = draft !== orig.current
  const handleSave = async () => {
    const tags = draft.split(/\s+/).filter((t: string) => t.startsWith('#') && t.length > 1)
    await onSave({ hashtags: tags }); orig.current = tags.join(' '); setDraft(orig.current); setEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hashtags ({content.hashtags?.length || 0})</CardTitle>
        <div className="flex items-center gap-2">
          <CopyBtn text={(content.hashtags || []).join(' ')} />
          <SectionActions onRegen={() => onRegen('hashtags')} onEdit={() => { setDraft(orig.current); setEditing(true) }}
            isEditing={editing} isRegening={regeningSection === 'hashtags'} hasChanges={hasChanges}
            onSave={handleSave} onDiscard={() => { setDraft(orig.current); setEditing(false) }} />
        </div>
      </CardHeader>
      {editing
        ? <div><Textarea value={draft} onChange={e => setDraft(e.target.value)} className="text-[13px] min-h-[80px] font-instrument" placeholder="#hashtag1 #hashtag2..." />
            <p className="text-[11px] text-ink-muted mt-1.5">Separe com espaço. Cada uma começa com #.</p></div>
        : <div className="flex flex-wrap gap-2">
            {content.hashtags?.map((tag: string, i: number) => (
              <button key={i} onClick={() => { navigator.clipboard.writeText(tag); toast.success('Copiado!') }}
                className="px-3 py-1 bg-surface2 border border-border rounded-full text-[12px] text-green hover:bg-green-light hover:border-green/30 transition-all cursor-pointer">
                {tag}
              </button>
            ))}
          </div>}
      {regeningSection === 'hashtags' && <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-muted"><Spinner size={12} /> Gerando novas hashtags...</div>}
    </Card>
  )
}

// ── Carrossel ────────────────────────────────────────────────────
function CarouselSection({ content, onSave, onRegen, regeningSection }: any) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(content.carousel || [])
  const orig = useRef(content.carousel || [])

  if (!editing && JSON.stringify(content.carousel) !== JSON.stringify(orig.current)) {
    orig.current = content.carousel || []; setDraft(content.carousel || [])
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(orig.current)
  const handleSave = async () => { await onSave({ carousel: draft }); orig.current = draft; setEditing(false) }
  const updateSlide = (i: number, key: string, value: string) => setDraft((d: any[]) => d.map((s, j) => j === i ? { ...s, [key]: value } : s))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carrossel — {content.carousel?.length || 0} slides</CardTitle>
        <SectionActions onRegen={() => onRegen('carousel')} onEdit={() => { setDraft(orig.current.map((s: any) => ({ ...s }))); setEditing(true) }}
          isEditing={editing} isRegening={regeningSection === 'carousel'} hasChanges={hasChanges}
          onSave={handleSave} onDiscard={() => { setDraft(orig.current.map((s: any) => ({ ...s }))); setEditing(false) }} />
      </CardHeader>
      <div className="flex flex-col gap-2">
        {(editing ? draft : content.carousel || []).map((slide: any, i: number) => (
          <div key={i} className={cn('border rounded-lg p-4 flex gap-3 transition-colors', editing ? 'bg-surface2 border-border-strong' : 'bg-surface2 border-border')}>
            <div className="w-7 h-7 rounded-md bg-green-light border border-green/20 flex items-center justify-center text-[12px] font-bold text-green flex-shrink-0">{slide.slide}</div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <>
                  <input value={slide.title} onChange={e => updateSlide(i, 'title', e.target.value)} className="w-full bg-transparent text-[13px] font-semibold text-ink outline-none border-b border-border focus:border-border-strong pb-0.5 mb-2 transition-colors" placeholder="Título..." />
                  <textarea value={slide.content} onChange={e => updateSlide(i, 'content', e.target.value)} rows={2} className="w-full bg-transparent text-[12px] text-ink-muted outline-none resize-none leading-relaxed border-b border-border focus:border-border-strong pb-0.5 mb-1.5 transition-colors" placeholder="Conteúdo..." />
                  <input value={slide.visual_suggestion || ''} onChange={e => updateSlide(i, 'visual_suggestion', e.target.value)} className="w-full bg-transparent text-[11px] text-ink-faint outline-none italic" placeholder="Sugestão visual..." />
                </>
              ) : (
                <>
                  <p className="text-[13px] font-semibold text-ink mb-0.5">{slide.title}</p>
                  <p className="text-[12px] text-ink-muted leading-relaxed">{slide.content}</p>
                  {slide.visual_suggestion && <p className="text-[11px] text-ink-faint mt-1.5 italic">{slide.visual_suggestion}</p>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {regeningSection === 'carousel' && <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-muted"><Spinner size={12} /> Regenerando carrossel...</div>}
    </Card>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function GeneratePage() {
  const router = useRouter()
  const { data: profiles } = useProfiles()
  const generateMutation      = useGenerate()
  const updateContentMutation = useUpdateContent()
  const regenSectionMutation  = useRegenerateSection()
  const scheduleMutation      = useSchedule()
  const updateStatusMutation  = useUpdateStatus()

  const [form, setForm] = useState({ profile_id: '', content_type: 'educativo' as ContentType, theme: '', objective: 'educar' as Objective, tone: 'acessivel' as Tone })
  const [result, setResult] = useState<Content | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [regeningSection, setRegeningSection] = useState<string | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleGenerate = async () => {
    if (!form.profile_id) { toast.error('Selecione um perfil.'); return }
    if (!form.theme.trim()) { toast.error('Informe o tema.'); return }
    const content = await generateMutation.mutateAsync({ ...form })
    setResult(content); setShowSchedule(false)
  }

  const handleSaveFields = async (fields: any) => {
    if (!result) return
    const updated = await updateContentMutation.mutateAsync({ id: result.id, fields })
    setResult(updated)
  }

  const handleRegenerateSection = async (section: string) => {
    if (!result) return
    setRegeningSection(section)
    try {
      const { content } = await regenSectionMutation.mutateAsync({ id: result.id, section })
      setResult(content)
      const labels: Record<string, string> = { headlines: 'Headlines', caption: 'Legenda', short_version: 'Versão resumida', hashtags: 'Hashtags', carousel: 'Carrossel' }
      toast.success(`${labels[section] || 'Seção'} regenerada!`)
    } finally { setRegeningSection(null) }
  }

  const handleApprove = async () => {
    if (!result) return
    await updateStatusMutation.mutateAsync({ id: result.id, status: 'approved' })
    setResult({ ...result, status: 'approved' })
  }

  const handleSchedule = async () => {
    if (!result || !scheduleDate) { toast.error('Selecione uma data.'); return }
    await scheduleMutation.mutateAsync({ id: result.id, scheduled_date: scheduleDate })
    setResult({ ...result, status: 'scheduled', scheduled_date: scheduleDate }); setShowSchedule(false)
  }

  const sectionProps = { onSave: handleSaveFields, onRegen: handleRegenerateSection, regeningSection }

  return (
    <div>
      <Topbar title="Gerar Conteúdo" />
      <div className="p-8">
        <div className="grid grid-cols-[360px_1fr] gap-6 items-start">

          {/* Form */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card sticky top-16">
            <h2 className="font-playfair font-semibold text-[15px] text-ink mb-5 tracking-tight">Parâmetros</h2>
            <div className="flex flex-col gap-4">
              <Select
                label="Perfil"
                value={form.profile_id}
                onChange={e => {
                  if (e.target.value === '__create__') {
                    router.push('/app/profiles?from=generate')
                    return
                  }
                  set('profile_id', e.target.value)
                }}
              >
                <option value="">Selecione um perfil...</option>
                {profiles?.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.subniche === 'estetico' ? 'Estético' : 'Implante'} · {p.city}
                  </option>
                ))}
                <option value="__create__">+ Criar novo perfil...</option>
              </Select>
              <Select label="Tipo de conteúdo" value={form.content_type} onChange={e => set('content_type', e.target.value)}>
                <option value="educativo">Educativo</option>
                <option value="autoridade">Autoridade</option>
                <option value="quebra_objecao">Quebra de Objeção</option>
                <option value="bastidores">Bastidores</option>
                <option value="depoimento">Depoimento</option>
                <option value="procedimento">Procedimento</option>
              </Select>
              <Input label="Tema específico" placeholder="Ex: clareamento a laser, implante all-on-4..." value={form.theme} onChange={e => set('theme', e.target.value)} />
              <Select label="Objetivo" value={form.objective} onChange={e => set('objective', e.target.value)}>
                <option value="atrair_pacientes">Atrair novos pacientes</option>
                <option value="educar">Educar o público</option>
                <option value="construir_autoridade">Construir autoridade</option>
              </Select>
              <Select label="Tom" value={form.tone} onChange={e => set('tone', e.target.value)}>
                <option value="acessivel">Acessível</option>
                <option value="formal">Formal</option>
                <option value="tecnico">Técnico</option>
                <option value="humanizado">Humanizado</option>
              </Select>
            </div>
            <div className="mt-5 p-3 bg-surface2 rounded-lg border border-border">
              <p className="text-[12px] text-ink-muted leading-relaxed">
                Gerado com <strong className="text-ink-mid">compliance CRO automático</strong> — sem promessas ou linguagem sensacionalista.
              </p>
            </div>
            <button onClick={handleGenerate} disabled={generateMutation.isPending}
              className="mt-5 w-full bg-ink text-white font-semibold text-sm py-3 rounded-lg border-none cursor-pointer transition-all hover:bg-ink-mid disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
              {generateMutation.isPending ? <><Spinner /> Gerando...</> : result ? 'Gerar Novamente' : 'Gerar Conteúdo'}
            </button>
            {result && (
              <button onClick={() => setResult(null)} className="mt-2 w-full text-[12px] text-ink-muted hover:text-ink transition-colors py-1">
                Limpar resultado
              </button>
            )}
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
                {(result as any).edited && (
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                    <span className="text-[12px] text-ink-muted">Conteúdo editado manualmente</span>
                  </div>
                )}

                <HeadlinesSection content={result} {...sectionProps} />
                <CaptionSection content={result} {...sectionProps} />
                <HashtagsSection content={result} {...sectionProps} />
                <CarouselSection content={result} {...sectionProps} />

                {/* Action bar */}
                <div className="bg-surface border border-border rounded-xl px-6 py-4 flex items-center gap-3 flex-wrap shadow-card">
                  <span className="flex-1 text-[13px] text-ink-muted">
                    {result.status === 'approved' ? '✓ Aprovado' : result.status === 'scheduled' ? `📅 Agendado para ${result.scheduled_date}` : 'Conteúdo gerado. O que deseja fazer?'}
                  </span>
                  {result.status !== 'approved' && (
                    <Button variant="secondary" size="sm" onClick={handleApprove} loading={updateStatusMutation.isPending}>Aprovar</Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setShowSchedule(!showSchedule)}>
                    {result.status === 'scheduled' ? 'Reagendar' : 'Agendar →'}
                  </Button>
                </div>

                {showSchedule && (
                  <div className="bg-surface border border-border rounded-xl px-6 py-4 flex items-center gap-3 shadow-card">
                    <span className="text-[13px] text-ink-muted">Data de publicação:</span>
                    <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                      className="bg-surface2 border border-border rounded-lg px-3 py-2 text-ink text-sm outline-none focus:border-border-strong transition-colors" />
                    <Button variant="primary" size="sm" onClick={handleSchedule} loading={scheduleMutation.isPending}>Confirmar</Button>
                  </div>
                )}

                <ImageGenerator contentType={result.content_type} theme={form.theme} headline={result.headlines?.[0]} caption={result.caption} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
