'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Topbar from '@/components/layout/Topbar'
import Button from '@/components/ui/Button'
import { TypeBadge, StatusBadge } from '@/components/ui/Badge'
import { useContents } from '@/hooks/useContents'
import { Content, STATUS_COLORS, CONTENT_TYPE_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const Calendar = dynamic(() => import('react-big-calendar').then((m) => m.Calendar), { ssr: false })

const localizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'pt-BR': ptBR },
})

const messages = {
  today: 'Hoje', previous: '←', next: '→',
  month: 'Mês', week: 'Semana', day: 'Dia',
  noEventsInRange: 'Nenhum conteúdo agendado neste período.',
}

// Calendar event colors adapted for light theme
const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '#2D6A4F': { bg: '#E8F4EE', text: '#2D6A4F', border: '#A8D5B8' },
  '#6D28D9': { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD' },
  '#555550': { bg: '#F5F4F0', text: '#555550', border: '#D0CEC8' },
  '#9A6700': { bg: '#FFF8E6', text: '#9A6700', border: '#F5D97A' },
}

export default function CalendarPage() {
  const { data: contents } = useContents(undefined, { refetchInterval: 5000 })
  const [selected, setSelected] = useState<Content | null>(null)

  const events = useMemo(() => {
    return (contents || [])
      .filter((c) => c.scheduled_date)
      .map((c) => {
        const rawDate = c.scheduled_date!
        const dateOnly = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate
        return {
          id: c.id,
          title: `${CONTENT_TYPE_LABELS[c.content_type]} · ${c.theme}`,
          start: new Date(dateOnly + 'T08:00:00'),
          end: new Date(dateOnly + 'T09:00:00'),
          resource: c,
          statusColor: STATUS_COLORS[c.status],
        }
      })
  }, [contents])

  return (
    <div>
      <Topbar title="Calendário Editorial" />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-surface border border-border rounded-lg p-1 gap-0.5 shadow-card">
            <Link href="/app/kanban">
              <button className="px-3 py-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors">Kanban</button>
            </Link>
            <span className="px-3 py-1.5 rounded-md bg-surface2 border border-border text-[13px] font-medium text-ink">Calendário</span>
          </div>
          <Link href="/app/generate">
            <Button variant="outline" size="sm">Novo conteúdo</Button>
          </Link>
        </div>

        {/* Legend */}
        <div className="flex gap-5 mb-5 flex-wrap">
          {[
            { label: 'Aprovado', color: '#2D6A4F' },
            { label: 'Agendado', color: '#6D28D9' },
            { label: 'Publicado', color: '#555550' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[12px] text-ink-muted">
              <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor={(event: any) => event.start}
            endAccessor={(event: any) => event.end}
            style={{ height: 620 }}
            culture="pt-BR"
            messages={messages}
            onSelectEvent={(event: any) => setSelected(event.resource)}
            eventPropGetter={(event: any) => {
              const colors = EVENT_COLORS[event.statusColor] || { bg: '#F5F4F0', text: '#555550', border: '#D0CEC8' }
              return {
                style: {
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                },
              }
            }}
            views={['month', 'week']}
          />
        </div>

        {selected && (
          <div className="mt-6 bg-surface border border-border rounded-xl p-6 shadow-card animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col gap-2">
                <TypeBadge type={selected.content_type} />
                <h3 className="font-playfair font-bold text-lg text-ink">{selected.theme}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-ink-muted hover:text-ink transition-colors">✕</button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={selected.status} />
              <span className="text-[12px] text-ink-muted">📅 {formatDate(selected.scheduled_date)}</span>
            </div>
            {selected.caption && (
              <pre className="text-[13px] leading-relaxed text-ink-mid whitespace-pre-wrap bg-surface2 rounded-lg p-4 border border-border font-instrument max-h-40 overflow-y-auto">
                {selected.caption}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}