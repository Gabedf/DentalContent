'use client'
import { useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { toast.error('Informe seu e-mail.'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      // Sempre mostra sucesso para não revelar se o e-mail existe
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-8">
      <div className="w-full max-w-[380px] animate-slide-up">

        <div className="mb-8">
          <Link href="/login" className="text-[13px] text-ink-muted hover:text-ink transition-colors">
            ← Voltar ao login
          </Link>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-light border border-green/20 flex items-center justify-center text-2xl mx-auto mb-5">
              ✉️
            </div>
            <h2 className="font-playfair font-bold text-[24px] text-ink tracking-tight mb-3">
              Verifique seu e-mail
            </h2>
            <p className="text-ink-muted text-[14px] leading-relaxed mb-6">
              Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em breve.
            </p>
            <p className="text-[12px] text-ink-faint">
              Não recebeu? Verifique a caixa de spam ou{' '}
              <button onClick={() => setSent(false)} className="text-green hover:underline underline-offset-2">
                tente novamente.
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-playfair font-bold text-[28px] text-ink tracking-tight leading-tight mb-2">
                Esqueceu sua senha?
              </h2>
              <p className="text-ink-muted text-sm leading-relaxed">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                Enviar link de redefinição
              </Button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
