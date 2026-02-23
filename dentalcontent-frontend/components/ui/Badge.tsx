import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'
import { ContentType, ContentStatus, CONTENT_TYPE_LABELS, STATUS_LABELS } from '@/types'
import { getTypeColor, getStatusColor } from '@/lib/utils'

export function TypeBadge({ type }: { type: ContentType }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-[0.4px]', getTypeColor(type))}>
      {CONTENT_TYPE_LABELS[type]}
    </span>
  )
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-[0.4px]', getStatusColor(status))}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.5px] bg-green-light text-green border border-green/20">
      {plan}
    </span>
  )
}

export function Card({ className, hover, ...props }: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-xl p-6 shadow-card',
        hover && 'transition-all duration-200 hover:shadow-card-hover hover:border-border-strong',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between mb-4', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-[11px] font-semibold text-ink-muted uppercase tracking-[0.8px]', className)} {...props} />
}
