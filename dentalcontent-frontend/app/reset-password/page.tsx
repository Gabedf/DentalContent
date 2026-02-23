'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Link inválido.')
      router.push('/login')
    }
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { toast.error('A senha deve ter mínimo 6 caracteres.'); return }
    if (password !== confirm) { toast.error('As senhas não coincidem.'); return }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Link inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-8">
      <div className="w-full max-w-[380px] animate-slide-up">

        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-light border border-green/20 flex items-center justify-center text-2xl mx-auto mb-5">
              ✓
            </div>
            <h2 className="font-playfair font-bold text-[24px] text-ink tracking-tight mb-3">
              Senha redefinida!
            </h2>
            <p className="text-ink-muted text-[14px] leading-relaxed mb-6">
              Sua senha foi atualizada com sucesso. Agora você pode fazer login com a nova senha.
            </p>
            <Link href="/login">
              <Button variant="primary" size="md" className="w-full">
                Ir para o login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Link href="/login" className="text-[13px] text-ink-muted hover:text-ink transition-colors">
                ← Voltar ao login
              </Link>
              <h2 className="font-playfair font-bold text-[28px] text-ink tracking-tight leading-tight mt-6 mb-2">
                Criar nova senha
              </h2>
              <p className="text-ink-muted text-sm">
                Escolha uma senha com mínimo 6 caracteres.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Nova senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirmar senha"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                Redefinir senha
              </Button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
