'use client'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import Button from '@/components/ui/Button'
import { TypeBadge, StatusBadge } from '@/components/ui/Badge'
import { useContents, useUsage } from '@/hooks/useContents'
import { useAuthStore } from '@/lib/authStore'
import { formatDate, getPlanLabel } from '@/lib/utils'
import { Content } from '@/types'

function StatCard({ label, value, sub, progress }: { label: string; value: string | number; sub: string; progress?: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
      <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[1px] mb-3">{label}</p>
      <p className="font-playfair font-bold text-[38px] leading-none tracking-tight text-green mb-1.5">{value}</p>
      <p className="text-[13px] text-ink-muted">{sub}</p>
      {progress !== undefined && (
        <div className="h-px bg-border mt-4 overflow-hidden">
          <div className={`h-full transition-all ${progress > 80 ? 'bg-gold' : 'bg-green'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: contents, isLoading } = useContents()
  const { data: usage } = useUsage()

  const approved = contents?.filter((c) => c.status === 'approved').length || 0
  const scheduled = contents?.filter((c) => c.status === 'scheduled').length || 0
  const nextPost = contents?.find((c) => c.status === 'scheduled' && c.scheduled_date)
  const usedPct = usage
    ? usage.limit === 'unlimited' ? 0 : Math.round((usage.used / (usage.limit as number)) * 100)
    : 0

  return (
    <div>
      <Topbar title="Dashboard" action={{ label: 'Gerar conteúdo', href: '/app/generate' }} />
      <div className="p-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="font-playfair font-bold text-2xl tracking-tight text-ink mb-1">
            Olá, {user?.name?.split(' ')[0]}.
          </h2>
          <p className="text-ink-muted text-sm">
            Plano <span className="text-green font-semibold">{getPlanLabel(user?.plan || '')}</span> · Resumo do mês
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-5 mb-10">
          <StatCard label="Gerações este mês" value={usage?.used || 0} sub={`de ${usage?.limit === 'unlimited' ? '∞' : usage?.limit || '—'} disponíveis`} progress={usedPct} />
          <StatCard label="Conteúdos gerados" value={contents?.length || 0} sub={`${approved} aprovados · ${scheduled} agendados`} />
          <StatCard label="Próxima publicação" value={nextPost ? formatDate(nextPost.scheduled_date) : '—'} sub={nextPost?.theme?.slice(0, 38) + (nextPost && nextPost.theme.length > 38 ? '...' : '') || 'Nenhum agendado'} />
        </div>

        {/* Divider */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-playfair font-semibold text-[17px] text-ink tracking-tight">Conteúdos recentes</h3>
          <Link href="/app/kanban">
            <Button variant="ghost" size="sm">Ver no Kanban →</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-border border-t-green rounded-full animate-spin" />
          </div>
        ) : !contents?.length ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card">
            <p className="font-playfair italic text-ink-muted text-lg mb-3">Nenhum conteúdo ainda.</p>
            <p className="text-sm text-ink-muted mb-5">Gere seu primeiro conteúdo para o Instagram.</p>
            <Link href="/app/generate">
              <Button variant="outline" size="sm">Gerar agora</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            {contents.slice(0, 8).map((c: Content, i: number) => (
              <div
                key={c.id}
                className={`flex items-center gap-4 px-6 py-4 transition-all hover:bg-surface2 cursor-pointer ${i !== 0 ? 'border-t border-border' : ''}`}
              >
                <TypeBadge type={c.content_type} />
                <p className="flex-1 text-[14px] text-ink-mid">{c.theme}</p>
                <StatusBadge status={c.status} />
                <span className="text-[12px] text-ink-muted w-16 text-right flex-shrink-0">{formatDate(c.scheduled_date || c.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
