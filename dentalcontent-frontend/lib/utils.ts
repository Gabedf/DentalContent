import { clsx, type ClassValue } from 'clsx'
import { ContentType, ContentStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const normalized = dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00'
  const d = new Date(normalized)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function getStatusColor(status: ContentStatus): string {
  const map: Record<ContentStatus, string> = {
    idea: 'bg-surface2 text-ink-muted',
    generated: 'bg-gold-light text-gold',
    approved: 'bg-green-light text-green',
    scheduled: 'bg-purple-50 text-purple-700',
    published: 'bg-surface2 text-ink-mid',
  }
  return map[status] || ''
}

export function getTypeColor(type: ContentType): string {
  const map: Record<ContentType, string> = {
    educativo: 'bg-green-light text-green',
    autoridade: 'bg-gold-light text-gold',
    quebra_objecao: 'bg-rose-light text-rose',
    bastidores: 'bg-surface2 text-ink-mid',
    depoimento: 'bg-purple-50 text-purple-700',
    procedimento: 'bg-blue-50 text-blue-700',
  }
  return map[type] || ''
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export function getPlanLabel(plan: string): string {
  const map: Record<string, string> = { essencial: 'Essencial', pro: 'Pro', clinica: 'Clínica' }
  return map[plan] || plan
}
