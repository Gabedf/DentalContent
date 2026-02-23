'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, getInitials, getPlanLabel } from '@/lib/utils'
import { useAuthStore } from '@/lib/authStore'
import { useAuth } from '@/hooks/useAuth'
import { useUsage } from '@/hooks/useContents'

const NAV = [
  { href: '/app/dashboard', label: 'Dashboard', section: 'Principal' },
  { href: '/app/generate', label: 'Gerar Conteúdo', section: 'Principal' },
  { href: '/app/kanban', label: 'Kanban', section: 'Organização' },
  { href: '/app/calendar', label: 'Calendário', section: 'Organização' },
  { href: '/app/settings', label: 'Configurações', section: 'Conta' },
]

const SECTIONS = ['Principal', 'Organização', 'Conta']

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const { data: usage } = useUsage()

  const usedPct = usage
    ? usage.limit === 'unlimited' ? 0 : Math.round((usage.used / (usage.limit as number)) * 100)
    : 0

  return (
    <aside className="w-[240px] min-h-screen bg-surface border-r border-border flex flex-col py-8 fixed left-0 top-0 bottom-0 z-50">
      {/* Logo */}
      <div className="px-7 pb-7 border-b border-border mb-6">
        <div className="flex items-baseline gap-2">
          <span className="font-playfair font-bold text-[20px] text-ink tracking-tight leading-none">
            DentalContent
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[9px] font-semibold text-green border border-green/30 bg-green-light px-1.5 py-0.5 rounded uppercase tracking-[1px]">
            Pro
          </span>
          <span className="text-[11px] text-ink-muted">Sistema editorial</span>
        </div>
      </div>

      {/* Nav */}
      {SECTIONS.map((section) => {
        const items = NAV.filter((n) => n.section === section)
        return (
          <div key={section} className="px-4 mb-5">
            <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-[1.2px] px-3 mb-1.5">
              {section}
            </p>
            {items.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-[14px] transition-all duration-150 mb-0.5 border-l-2',
                    active
                      ? 'text-ink font-medium bg-green-light border-l-green'
                      : 'text-ink-mid border-l-transparent hover:bg-surface2 hover:text-ink'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        )
      })}

      {/* Usage */}
      {usage && (
        <div className="mx-4 mt-auto mb-4 p-4 bg-surface2 rounded-xl border border-border">
          <div className="flex justify-between text-[11px] mb-2">
            <span className="text-ink-muted font-medium">Gerações este mês</span>
            <span className="font-semibold text-ink">
              {usage.used}/{usage.limit === 'unlimited' ? '∞' : usage.limit}
            </span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', usedPct > 80 ? 'bg-gold' : 'bg-green')}
              style={{ width: `${Math.min(usedPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* User */}
      <div className="px-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-surface2 transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-ink truncate">{user?.name}</p>
            <p className="text-[11px] text-green font-medium">{getPlanLabel(user?.plan || '')}</p>
          </div>
          <button
            onClick={logout}
            className="text-ink-muted hover:text-rose transition-colors text-sm"
            title="Sair"
          >
            ⎋
          </button>
        </div>
      </div>
    </aside>
  )
}
