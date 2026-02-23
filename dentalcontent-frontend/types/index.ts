// ── Auth ──────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  plan: 'essencial' | 'pro' | 'clinica'
}

export interface AuthResponse {
  user: User
  token: string
}

// ── Profile ───────────────────────────────────────
export type Subniche = 'estetico' | 'implante'
export type Tone = 'formal' | 'acessivel' | 'tecnico' | 'humanizado'

export interface Profile {
  id: string
  user_id: string
  name: string
  subniche: Subniche
  city: string
  preferred_tone: Tone
  created_at: string
}

// ── Content ───────────────────────────────────────
export type ContentType =
  | 'educativo'
  | 'autoridade'
  | 'quebra_objecao'
  | 'bastidores'
  | 'depoimento'
  | 'procedimento'

export type Objective = 'atrair_pacientes' | 'educar' | 'construir_autoridade'

export type ContentStatus =
  | 'idea'
  | 'generated'
  | 'approved'
  | 'scheduled'
  | 'published'

export interface CarouselSlide {
  slide: number
  title: string
  content: string
  visual_suggestion: string
}

export interface Content {
  id: string
  user_id: string
  profile_id: string
  profile_name?: string
  subniche?: Subniche
  content_type: ContentType
  theme: string
  objective: Objective
  tone: Tone
  headlines: string[]
  caption: string
  short_version: string
  hashtags: string[]
  carousel: CarouselSlide[]
  status: ContentStatus
  scheduled_date: string | null
  created_at: string
}

// ── Generate ──────────────────────────────────────
export interface GeneratePayload {
  profile_id: string
  content_type: ContentType
  theme: string
  objective: Objective
  tone: Tone
}

// ── Usage ─────────────────────────────────────────
export interface UsageStats {
  used: number
  limit: number | 'unlimited'
  plan: string
}

// ── Plan ──────────────────────────────────────────
export const PLAN_LIMITS: Record<string, number | 'unlimited'> = {
  essencial: 20,
  pro: 60,
  clinica: 'unlimited',
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  educativo: 'Educativo',
  autoridade: 'Autoridade',
  quebra_objecao: 'Quebra de Objeção',
  bastidores: 'Bastidores',
  depoimento: 'Depoimento',
  procedimento: 'Procedimento',
}

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Ideia',
  generated: 'Gerado',
  approved: 'Aprovado',
  scheduled: 'Agendado',
  published: 'Publicado',
}

export const STATUS_COLORS: Record<ContentStatus, string> = {
  idea: '#6B7E96',
  generated: '#F0B429',
  approved: '#00C8A0',
  scheduled: '#A78BFA',
  published: '#34D399',
}
