'use client'
import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Badge'
import { useProfiles } from '@/hooks/useProfiles'
import { useSuggestBattery, useGenerateBattery } from '@/hooks/useContents'
import toast from 'react-hot-toast'

const TYPE_LABELS: Record<string, string> = {
  educativo: 'Educativo', autoridade: 'Autoridade', quebra_objecao: 'Quebra de Objeção',
  bastidores: 'Bastidores', depoimento: 'Depoimento', procedimento: 'Procedimento',
}
const TYPE_COLORS: Record<string, string> = {
  educativo: 'bg-blue-50 text-blue-700 border-blue-200',
  autoridade: 'bg-purple-50 text-purple-700 border-purple-200',
  quebra_objecao: 'bg-amber-50 text-amber-700 border-amber-200',
  bastidores: 'bg-orange-50 text-orange-700 border-orange-200',
  depoimento: 'bg-green-50 text-green-700 border-green-200',
  procedimento: 'bg-rose-50 text-rose-700 border-rose-200',
}
const OBJ_LABELS: Record<string, string> = {
  atrair_pacientes: 'Atrair pacientes',
  educar: 'Educar',
  construir_autoridade: 'Construir autoridade',
}
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// ── Etapa 1: Configuração ─────────────────────────────────────────
function StepConfig({ profiles, form, setForm, onNext, loading }: any) {
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))
  const now = new Date()

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-playfair font-semibold text-2xl text-ink mb-2">Plano Editorial do Mês</h2>
        <p className="text-ink-muted text-sm">A IA cria uma grade completa de conteúdos estratégicos. Você revisa e aprova antes de gerar.</p>
      </div>
      <Card>
        <div className="flex flex-col gap-5">
          <Select label="Perfil" value={form.profile_id} onChange={e => set('profile_id', e.target.value)}>
            <option value="">Selecione um perfil...</option>
            {profiles?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} — {p.subniche === 'estetico' ? 'Estético' : 'Implante'} · {p.city}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Mês" value={form.month} onChange={e => set('month', Number(e.target.value))}>
              {MONTH_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </Select>
            <Select label="Ano" value={form.year} onChange={e => set('year', Number(e.target.value))}>
              {[now.getFullYear(), now.getFullYear()+1].map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px] mb-2 block">Posts por semana</label>
            <div className="flex gap-3">
              {[2, 3, 4].map(n => (
                <button key={n} onClick={() => set('posts_per_week', n)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    form.posts_per_week === n
                      ? 'bg-ink text-white border-ink'
                      : 'bg-surface2 text-ink-mid border-border hover:border-border-strong'
                  }`}>
                  {n}x / semana
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-muted mt-1.5">
              = {form.posts_per_week * 4} posts no mês · distribuídos automaticamente no calendário
            </p>
          </div>

          <div className="p-3 bg-surface2 rounded-lg border border-border">
            <p className="text-[12px] text-ink-muted leading-relaxed">
              A IA vai sugerir tipos, temas e objetivos estratégicos para {MONTH_NAMES[form.month - 1]}.
              Você revisa cada post antes de confirmar a geração.
              <strong className="text-ink-mid"> Gerar a bateria usa {form.posts_per_week * 4} créditos de geração.</strong>
            </p>
          </div>

          <Button variant="primary" size="lg" onClick={onNext} loading={loading} disabled={!form.profile_id}>
            Sugerir plano para {MONTH_NAMES[form.month - 1]}
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ── Etapa 2: Revisão da sugestão ──────────────────────────────────
function StepReview({ suggestion, form, onEdit, onGenerate, loading, onBack }: any) {
  const total = suggestion?.suggestions?.length || 0
  const enabled = suggestion?.suggestions?.filter((s: any) => s._enabled !== false).length || 0

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair font-semibold text-2xl text-ink mb-1">
            Plano de {MONTH_NAMES[form.month - 1]} — {total} posts sugeridos
          </h2>
          <p className="text-ink-muted text-sm">{suggestion?.strategy_summary}</p>
        </div>
        <button onClick={onBack} className="text-ink-muted hover:text-ink text-sm transition-colors">← Voltar</button>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {suggestion?.suggestions?.map((post: any, i: number) => {
          const enabled = post._enabled !== false
          return (
            <div key={i} className={`bg-surface border rounded-xl p-4 transition-all ${enabled ? 'border-border' : 'border-border opacity-50'}`}>
              <div className="flex items-start gap-4">
                {/* Toggle */}
                <button onClick={() => onEdit(i, '_enabled', !enabled)}
                  className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                    enabled ? 'bg-green border-green text-white' : 'bg-surface2 border-border'
                  }`}>
                  {enabled && <span className="text-[11px] font-bold">✓</span>}
                </button>

                {/* Número */}
                <div className="w-6 h-6 rounded bg-surface2 border border-border flex items-center justify-center text-[12px] font-semibold text-ink-muted flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border ${TYPE_COLORS[post.content_type] || 'bg-surface2 text-ink-muted border-border'}`}>
                      {TYPE_LABELS[post.content_type] || post.content_type}
                    </span>
                    <span className="text-[11px] text-ink-muted">{OBJ_LABELS[post.objective]}</span>
                    <span className="text-[11px] text-ink-faint ml-auto">Semana {post.suggested_week}</span>
                  </div>

                  {/* Tema editável */}
                  <input
                    value={post.theme}
                    onChange={e => onEdit(i, 'theme', e.target.value)}
                    className="w-full bg-transparent text-[14px] text-ink font-medium outline-none border-b border-transparent focus:border-border-strong transition-colors pb-0.5 mb-1"
                    placeholder="Tema do post..."
                  />

                  <p className="text-[12px] text-ink-muted italic">{post.rationale}</p>
                </div>

                {/* Selects inline */}
                <div className="flex flex-col gap-1.5 flex-shrink-0 w-36">
                  <select
                    value={post.content_type}
                    onChange={e => onEdit(i, 'content_type', e.target.value)}
                    className="bg-surface2 border border-border rounded-md px-2 py-1 text-[12px] text-ink outline-none"
                  >
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <select
                    value={post.objective}
                    onChange={e => onEdit(i, 'objective', e.target.value)}
                    className="bg-surface2 border border-border rounded-md px-2 py-1 text-[12px] text-ink outline-none"
                  >
                    {Object.entries(OBJ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Barra de confirmação */}
      <div className="sticky bottom-4 bg-surface border border-border rounded-xl px-6 py-4 flex items-center gap-4 shadow-modal">
        <div>
          <p className="text-[13px] font-semibold text-ink">{enabled} de {total} posts selecionados</p>
          <p className="text-[12px] text-ink-muted">Serão gerados e agendados automaticamente em {MONTH_NAMES[form.month - 1]}</p>
        </div>
        <Button variant="primary" size="lg" onClick={onGenerate} loading={loading} disabled={enabled === 0} className="ml-auto">
          Gerar {enabled} conteúdo{enabled !== 1 ? 's' : ''} e agendar
        </Button>
      </div>
    </div>
  )
}

// ── Etapa 3: Resultado ────────────────────────────────────────────
function StepDone({ result, form, onReset }: any) {
  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-green-light border border-green/20 flex items-center justify-center text-3xl mx-auto mb-6">✓</div>
      <h2 className="font-playfair font-semibold text-2xl text-ink mb-2">Bateria gerada!</h2>
      <p className="text-ink-muted text-sm mb-6">
        {result?.generated} conteúdos foram gerados e já estão agendados no seu calendário de {MONTH_NAMES[form.month - 1]}.
        {result?.failed > 0 && ` (${result.failed} falharam — tente gerar novamente individualmente.)`}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-green-light border border-green/20 rounded-xl p-5">
          <p className="text-3xl font-bold text-green">{result?.generated}</p>
          <p className="text-sm text-green/70 mt-1">posts gerados</p>
        </div>
        <div className="bg-surface2 border border-border rounded-xl p-5">
          <p className="text-3xl font-bold text-ink">{form.month && MONTH_NAMES[form.month - 1]?.slice(0,3)}</p>
          <p className="text-sm text-ink-muted mt-1">agendado no calendário</p>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="primary" size="lg" onClick={() => window.location.href = '/app/calendar'}>
          Ver no Calendário
        </Button>
        <Button variant="secondary" size="lg" onClick={onReset}>
          Nova Bateria
        </Button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function BatteryPage() {
  const { data: profiles } = useProfiles()
  const suggestMutation  = useSuggestBattery()
  const generateMutation = useGenerateBattery()

  const now = new Date()
  const [step, setStep] = useState<'config' | 'review' | 'done'>('config')
  const [form, setForm] = useState({ profile_id: '', month: now.getMonth() + 1, year: now.getFullYear(), posts_per_week: 3 })
  const [suggestion, setSuggestion] = useState<any>(null)
  const [generateResult, setGenerateResult] = useState<any>(null)

  const handleSuggest = async () => {
    if (!form.profile_id) { toast.error('Selecione um perfil.'); return }
    const data = await suggestMutation.mutateAsync(form)
    // Adiciona flag _enabled para controle de seleção
    setSuggestion({ ...data, suggestions: data.suggestions.map((s: any) => ({ ...s, _enabled: true })) })
    setStep('review')
  }

  const handleEditSuggestion = (index: number, key: string, value: any) => {
    setSuggestion((prev: any) => ({
      ...prev,
      suggestions: prev.suggestions.map((s: any, i: number) => i === index ? { ...s, [key]: value } : s)
    }))
  }

  const handleGenerate = async () => {
    const enabled = suggestion.suggestions.filter((s: any) => s._enabled !== false)
    const result = await generateMutation.mutateAsync({
      ...form,
      suggestions: enabled.map(({ _enabled, rationale, suggested_week, suggested_day_of_week, ...rest }: any) => rest),
    })
    setGenerateResult(result)
    setStep('done')
  }

  const handleReset = () => {
    setStep('config')
    setSuggestion(null)
    setGenerateResult(null)
  }

  return (
    <div>
      <Topbar title="Bateria Editorial" />
      <div className="p-8">

        {/* Progress steps */}
        {step !== 'done' && (
          <div className="flex items-center gap-3 max-w-xs mx-auto mb-10">
            {[['config','1','Configurar'], ['review','2','Revisar']].map(([s, n, label]) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  step === s ? 'bg-ink text-white' : step === 'review' && s === 'config' ? 'bg-green text-white' : 'bg-surface2 border border-border text-ink-muted'
                }`}>{step === 'review' && s === 'config' ? '✓' : n}</div>
                <span className={`text-[12px] font-medium ${step === s ? 'text-ink' : 'text-ink-muted'}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {step === 'config' && (
          <StepConfig
            profiles={profiles}
            form={form}
            setForm={setForm}
            onNext={handleSuggest}
            loading={suggestMutation.isPending}
          />
        )}

        {step === 'review' && suggestion && (
          <StepReview
            suggestion={suggestion}
            form={form}
            onEdit={handleEditSuggestion}
            onGenerate={handleGenerate}
            loading={generateMutation.isPending}
            onBack={() => setStep('config')}
          />
        )}

        {step === 'done' && generateResult && (
          <StepDone result={generateResult} form={form} onReset={handleReset} />
        )}
      </div>
    </div>
  )
}
