'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { loginMutation, registerMutation } = useAuth()
  const { loginWithGoogle } = useGoogleAuth()

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') loginMutation.mutate({ email: form.email, password: form.password })
    else registerMutation.mutate({ name: form.name, email: form.email, password: form.password })
  }

  const loading = loginMutation.isPending || registerMutation.isPending

  return (
    <div className="min-h-screen bg-bg flex">

      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 bg-ink flex-col justify-between p-12">
        <div>
          <span className="font-playfair font-bold text-[20px] text-white tracking-tight">DentalContent</span>
          <span className="ml-2 text-[9px] font-semibold text-green border border-green/30 bg-green/10 px-1.5 py-0.5 rounded uppercase tracking-[1px]">Pro</span>
        </div>
        <div>
          <p className="font-playfair font-bold text-[38px] text-white leading-tight tracking-tight mb-4">
            Conteúdo estratégico para o Instagram do seu consultório.
          </p>
          <p className="text-white/40 text-[14px] leading-relaxed">
            Gerado por IA, com compliance CRO automático. Sem agência, sem bloqueio criativo.
          </p>
        </div>
        <p className="text-white/20 text-[12px]">© 2025 DentalContent Pro</p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px] animate-slide-up">

          <div className="mb-8">
            <h2 className="font-playfair font-bold text-[28px] text-ink tracking-tight leading-tight mb-1">
              {mode === 'login' ? 'Bem-vindo de volta.' : 'Crie sua conta.'}
            </h2>
            <p className="text-ink-muted text-sm">
              {mode === 'login' ? 'Entre para acessar seu sistema editorial.' : 'Comece a gerar conteúdo em minutos.'}
            </p>
          </div>

          {/* Botão Google */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-surface border border-border rounded-xl py-3 px-4 text-[14px] font-medium text-ink hover:bg-surface2 hover:border-border-strong transition-all shadow-card mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-ink-muted uppercase tracking-[1px]">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Formulário email/senha */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <Input label="Nome completo" placeholder="Dr. João Silva" value={form.name} onChange={e => set('name', e.target.value)} required />
            )}
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            <div>
              <Input label="Senha" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
              {mode === 'login' && (
                <div className="flex justify-end mt-1.5">
                  <Link href="/forgot-password" className="text-[12px] text-ink-muted hover:text-green transition-colors">
                    Esqueci minha senha
                  </Link>
                </div>
              )}
            </div>
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-1">
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-center text-[13px] text-ink-muted mt-5">
            {mode === 'login' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-ink font-medium hover:text-green transition-colors">
              {mode === 'login' ? 'Criar conta grátis' : 'Entrar'}
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}