'use client'
import Topbar from '@/components/layout/Topbar'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, PlanBadge } from '@/components/ui/Badge'
import { useAuthStore } from '@/lib/authStore'
import { useUsage } from '@/hooks/useContents'
import { useAuth } from '@/hooks/useAuth'
import { useCheckout } from '@/hooks/useStripe'
import { getPlanLabel, cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const { data: usage } = useUsage()
  const checkoutMutation = useCheckout()

  const usedPct = usage
    ? usage.limit === 'unlimited' ? 0 : Math.round((usage.used / (usage.limit as number)) * 100)
    : 0

  return (
    <div>
      <Topbar title="Configurações" />
      <div className="p-8">
        <div className="max-w-[540px] flex flex-col gap-6">

          {/* Plano */}
          <Card>
            <CardHeader>
              <CardTitle>Plano atual</CardTitle>
              <PlanBadge plan={getPlanLabel(user?.plan || '')} />
            </CardHeader>
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
                onClick={() => checkoutMutation.mutate(user?.plan === 'gratis' || user?.plan === 'essencial' ? (user?.plan === 'gratis' ? 'essencial' : 'pro') : 'clinica')}
                loading={checkoutMutation.isPending}
              >
                Fazer upgrade para {user?.plan === 'gratis' ? 'Essencial — R$39/mês' : user?.plan === 'essencial' ? 'Pro — R$79/mês' : 'Clínica — R$220/mês'}
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
