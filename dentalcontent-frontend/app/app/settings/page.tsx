'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Input, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, PlanBadge } from '@/components/ui/Badge'
import { useAuthStore } from '@/lib/authStore'
import { useProfiles, useCreateProfile, useUpdateProfile } from '@/hooks/useProfiles'
import { useUsage } from '@/hooks/useContents'
import { useAuth } from '@/hooks/useAuth'
import { useCheckout } from '@/hooks/useStripe'
import { Subniche, Tone, Profile } from '@/types'
import { getPlanLabel, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const { data: profiles } = useProfiles()
  const { data: usage } = useUsage()
  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()
  const checkoutMutation = useCheckout()

  const [profile, setProfile] = useState<Partial<Profile>>({
    name: '', subniche: 'estetico', city: '', preferred_tone: 'acessivel',
  })

  const existing = profiles?.[0]
  useEffect(() => { if (existing) setProfile(existing) }, [existing])

  const setP = (k: string, v: string) => setProfile((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    // Validação com feedback visível
    if (!profile.name?.trim()) { toast.error('Informe o nome do dentista.'); return }
    if (!profile.city?.trim()) { toast.error('Informe a cidade.'); return }

    if (existing) {
      await updateProfile.mutateAsync({ id: existing.id, ...profile })
    } else {
      await createProfile.mutateAsync({
        name: profile.name!,
        subniche: profile.subniche as Subniche,
        city: profile.city!,
        preferred_tone: profile.preferred_tone as Tone,
      })
    }
  }

  const usedPct = usage
    ? usage.limit === 'unlimited' ? 0 : Math.round((usage.used / (usage.limit as number)) * 100)
    : 0

  return (
    <div>
      <Topbar title="Configurações" />
      <div className="p-8">
        <div className="max-w-[540px] flex flex-col gap-6">

          {/* Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil Odontológico</CardTitle>
              <PlanBadge plan={getPlanLabel(user?.plan || '')} />
            </CardHeader>
            <div className="flex flex-col gap-4">
              <Input
                label="Nome do dentista"
                placeholder="Dr. João Silva"
                value={profile.name || ''}
                onChange={(e) => setP('name', e.target.value)}
              />
              <Select
                label="Subnicho"
                value={profile.subniche || 'estetico'}
                onChange={(e) => setP('subniche', e.target.value)}
              >
                <option value="estetico">Dentista Estético</option>
                <option value="implante">Implantodontista</option>
              </Select>
              <Input
                label="Cidade"
                placeholder="São Paulo, SP"
                value={profile.city || ''}
                onChange={(e) => setP('city', e.target.value)}
              />
              <Select
                label="Tom preferido"
                value={profile.preferred_tone || 'acessivel'}
                onChange={(e) => setP('preferred_tone', e.target.value)}
              >
                <option value="acessivel">Acessível</option>
                <option value="formal">Formal</option>
                <option value="tecnico">Técnico</option>
                <option value="humanizado">Humanizado</option>
              </Select>
              <Button
                variant="primary"
                size="sm"
                className="w-fit"
                onClick={handleSave}
                loading={createProfile.isPending || updateProfile.isPending}
              >
                {existing ? 'Salvar alterações' : 'Criar perfil'}
              </Button>
            </div>
          </Card>

          {/* Plano */}
          <Card>
            <CardHeader><CardTitle>Plano atual</CardTitle></CardHeader>
            <div className="flex items-center gap-5 mb-5">
              <div>
                <p className="font-playfair font-bold text-2xl text-green">{getPlanLabel(user?.plan || '')}</p>
                <p className="text-[13px] text-ink-muted mt-0.5">
                  {usage?.limit === 'unlimited' ? 'Gerações ilimitadas' : `${usage?.limit || '—'} gerações/mês`}
                </p>
              </div>
              {usage && usage.limit !== 'unlimited' && (
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] mb-2">
                    <span className="text-ink-muted">Uso este mês</span>
                    <span className="font-semibold text-ink">{usage.used}/{usage.limit}</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', usedPct > 80 ? 'bg-gold' : 'bg-green')}
                      style={{ width: `${Math.min(usedPct, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {user?.plan !== 'clinica' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => checkoutMutation.mutate(user?.plan === 'essencial' ? 'pro' : 'clinica')}
                loading={checkoutMutation.isPending}
              >
                Fazer upgrade para {user?.plan === 'essencial' ? 'Pro — R$79/mês' : 'Clínica — R$129/mês'}
              </Button>
            )}
          </Card>

          {/* Conta */}
          <Card>
            <CardHeader><CardTitle>Conta</CardTitle></CardHeader>
            <div className="flex flex-col gap-4">
              <Input
                label="E-mail"
                type="email"
                value={user?.email || ''}
                readOnly
                className="opacity-60 cursor-not-allowed"
              />
              <Input label="Nova senha" type="password" placeholder="••••••••" />
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">Alterar senha</Button>
                <Button variant="danger" size="sm" onClick={logout}>Sair da conta</Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
