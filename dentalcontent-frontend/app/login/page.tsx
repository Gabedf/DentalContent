'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const { loginMutation, registerMutation } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') loginMutation.mutate({ email: form.email, password: form.password })
    else registerMutation.mutate({ name: form.name, email: form.email, password: form.password })
  }

  const isLoading = loginMutation.isPending || registerMutation.isPending

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left — branding */}
      <div className="hidden lg:flex w-[45%] bg-ink flex-col justify-between p-14">
        <div>
          <p className="font-playfair font-bold text-2xl text-white tracking-tight">DentalContent</p>
          <p className="text-[11px] text-white/40 uppercase tracking-[2px] mt-1">Sistema Editorial Pro</p>
        </div>
        <div>
          <blockquote className="font-playfair italic text-white/80 text-2xl leading-relaxed mb-6">
            "Do consultório à autoridade digital — sem perder tempo com redes sociais."
          </blockquote>
          <div className="flex flex-col gap-3">
            {[
              'Conteúdo estratégico gerado por IA',
              'Normas do CRO aplicadas automaticamente',
              'Kanban e Calendário editorial integrados',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/60 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-xs">© 2025 DentalContent Pro</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px] animate-slide-up">
          <div className="mb-8">
            <h2 className="font-playfair font-bold text-[28px] text-ink tracking-tight leading-tight mb-2">
              {mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}
            </h2>
            <p className="text-ink-muted text-sm leading-relaxed">
              {mode === 'login'
                ? 'Entre para acessar seu sistema editorial.'
                : 'Comece a gerar conteúdo estratégico hoje.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <Input label="Nome completo" placeholder="Dr. João Silva" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            )}
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            <Input label="Senha" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} required />
            {mode === 'login' && (
              <div className="flex justify-end -mt-1">
                <Link href="/forgot-password" className="text-[12px] text-ink-muted hover:text-green transition-colors">
                  Esqueci minha senha
                </Link>
              </div>
            )}
            <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-2">
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-center text-[13px] text-ink-muted mt-6">
            {mode === 'login' ? (
              <>Ainda não tem conta?{' '}
                <button onClick={() => setMode('register')} className="text-ink font-semibold hover:underline underline-offset-2">Criar conta grátis</button>
              </>
            ) : (
              <>Já tem conta?{' '}
                <button onClick={() => setMode('login')} className="text-ink font-semibold hover:underline underline-offset-2">Fazer login</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}