'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hydrateAuth, useAuthStore } from '@/lib/authStore'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    hydrateAuth()
    if (!isLoggedIn()) {
      router.push('/login')
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />
      <main className="ml-[220px] flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  )
}
