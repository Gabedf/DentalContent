'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import { Input, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Badge'
import { useProfiles, useCreateProfile, useUpdateProfile, useDeleteProfile } from '@/hooks/useProfiles'
import { Subniche, Tone, Profile } from '@/types'
import toast from 'react-hot-toast'

// ── Constants ─────────────────────────────────────────────────────

const SUBNICHE_LABELS: Record<Subniche, string> = {
  estetico: 'Estético',
  implante: 'Implante',
}

const TONE_LABELS: Record<Tone, string> = {
  acessivel: 'Acessível',
  formal: 'Formal',
  tecnico: 'Técnico',
  humanizado: 'Humanizado',
}

const EMPTY_FORM = {
  name: '',
  subniche: 'estetico' as Subniche,
  city: '',
  preferred_tone: 'acessivel' as Tone,
}

// ── Shared form fields ────────────────────────────────────────────

function ProfileFormFields({
  value,
  onChange,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
}: {
  value: typeof EMPTY_FORM
  onChange: (k: string, v: string) => void
  onSubmit: () => void
  onCancel?: () => void
  loading: boolean
  submitLabel: string
}) {
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange(k, e.target.value)

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Nome do dentista"
        placeholder="Dr. João Silva"
        value={value.name}
        onChange={set('name')}
      />
      <Select label="Subnicho" value={value.subniche} onChange={set('subniche')}>
        <option value="estetico">Dentista Estético</option>
        <option value="implante">Implantodontista</option>
      </Select>
      <Input
        label="Cidade"
        placeholder="São Paulo, SP"
        value={value.city}
        onChange={set('city')}
      />
      <Select label="Tom preferido" value={value.preferred_tone} onChange={set('preferred_tone')}>
        <option value="acessivel">Acessível</option>
        <option value="formal">Formal</option>
        <option value="tecnico">Técnico</option>
        <option value="humanizado">Humanizado</option>
      </Select>
      <div className="flex gap-2 pt-1">
        <Button variant="primary" size="sm" onClick={onSubmit} loading={loading}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Profile Card ──────────────────────────────────────────────────

function ProfileCard({ profile }: { profile: Profile }) {
  const updateProfile = useUpdateProfile()
  const deleteProfile = useDeleteProfile()
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view')
  const [form, setForm] = useState({
    name: profile.name,
    subniche: profile.subniche,
    city: profile.city,
    preferred_tone: profile.preferred_tone,
  })

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Informe o nome.'); return }
    if (!form.city.trim()) { toast.error('Informe a cidade.'); return }
    await updateProfile.mutateAsync({ id: profile.id, ...form })
    setMode('view')
  }

  const handleCancelEdit = () => {
    setForm({
      name: profile.name,
      subniche: profile.subniche,
      city: profile.city,
      preferred_tone: profile.preferred_tone,
    })
    setMode('view')
  }

  if (mode === 'edit') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
          <button
            onClick={handleCancelEdit}
            className="text-ink-faint hover:text-ink text-[18px] leading-none transition-colors"
          >
            ✕
          </button>
        </CardHeader>
        <ProfileFormFields
          value={form}
          onChange={setF}
          onSubmit={handleSave}
          onCancel={handleCancelEdit}
          loading={updateProfile.isPending}
          submitLabel="Salvar alterações"
        />
      </Card>
    )
  }

  if (mode === 'confirm-delete') {
    return (
      <Card className="border-rose/30 bg-rose-light/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold text-ink mb-1">{profile.name}</p>
            <p className="text-[13px] text-ink-muted">
              Confirmar exclusão deste perfil? Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setMode('view')}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteProfile.mutate(profile.id)}
              loading={deleteProfile.isPending}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-semibold text-ink">{profile.name}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-light text-green border border-green/20 uppercase tracking-[0.4px]">
            {SUBNICHE_LABELS[profile.subniche]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setMode('edit')}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setMode('confirm-delete')}>
            Excluir
          </Button>
        </div>
      </CardHeader>
      <div className="flex gap-8">
        <div>
          <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-[0.6px] mb-1">
            Cidade
          </p>
          <p className="text-[13px] text-ink-mid">{profile.city}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-[0.6px] mb-1">
            Tom
          </p>
          <p className="text-[13px] text-ink-mid">{TONE_LABELS[profile.preferred_tone]}</p>
        </div>
      </div>
    </Card>
  )
}

// ── Page content (needs Suspense for useSearchParams) ─────────────

function ProfilesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromGenerate = searchParams.get('from') === 'generate'

  const { data: profiles, isLoading } = useProfiles()
  const createProfile = useCreateProfile()

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM })

  const setCreate = (k: string, v: string) => setCreateForm(f => ({ ...f, [k]: v }))

  const handleCreate = async () => {
    if (!createForm.name.trim()) { toast.error('Informe o nome do dentista.'); return }
    if (!createForm.city.trim()) { toast.error('Informe a cidade.'); return }
    await createProfile.mutateAsync({
      name: createForm.name,
      subniche: createForm.subniche,
      city: createForm.city,
      preferred_tone: createForm.preferred_tone,
    })
    setCreateForm({ ...EMPTY_FORM })
    setShowCreate(false)
    if (fromGenerate) router.push('/app/generate')
  }

  const isEmpty = !isLoading && (!profiles || profiles.length === 0)

  return (
    <div>
      <Topbar title="Perfis" />
      <div className="p-8">
        <div className="max-w-2xl flex flex-col gap-5">

          {/* Back link when coming from generate */}
          {fromGenerate && (
            <button
              onClick={() => router.push('/app/generate')}
              className="flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors w-fit"
            >
              ← Voltar para Gerar Conteúdo
            </button>
          )}

          {/* Header row */}
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-ink-muted">
              {isLoading
                ? 'Carregando...'
                : isEmpty
                ? 'Nenhum perfil cadastrado'
                : `${profiles!.length} perfil${profiles!.length !== 1 ? 's' : ''} cadastrado${profiles!.length !== 1 ? 's' : ''}`}
            </p>
            <Button
              variant={showCreate ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setShowCreate(v => !v)}
            >
              {showCreate ? 'Cancelar' : '+ Novo Perfil'}
            </Button>
          </div>

          {/* Create form */}
          {showCreate && (
            <Card>
              <CardHeader>
                <CardTitle>Novo Perfil</CardTitle>
              </CardHeader>
              <ProfileFormFields
                value={createForm}
                onChange={setCreate}
                onSubmit={handleCreate}
                onCancel={() => { setCreateForm({ ...EMPTY_FORM }); setShowCreate(false) }}
                loading={createProfile.isPending}
                submitLabel={fromGenerate ? 'Criar e voltar para gerar' : 'Criar Perfil'}
              />
            </Card>
          )}

          {/* Empty state */}
          {isEmpty && !showCreate && (
            <Card>
              <div className="py-10 text-center">
                <p className="font-playfair italic text-ink-muted text-lg mb-2">
                  Nenhum perfil ainda.
                </p>
                <p className="text-[13px] text-ink-faint mb-5">
                  Crie um perfil para personalizar o conteúdo gerado para o seu consultório.
                </p>
                <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
                  Criar primeiro perfil
                </Button>
              </div>
            </Card>
          )}

          {/* Profile list */}
          {profiles?.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}

        </div>
      </div>
    </div>
  )
}

// ── Page export (Suspense boundary required for useSearchParams) ───

export default function ProfilesPage() {
  return (
    <Suspense>
      <ProfilesPageContent />
    </Suspense>
  )
}
