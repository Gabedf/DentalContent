'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#1A1A18',
              border: '1px solid #E8E6E0',
              borderRadius: '10px',
              fontFamily: 'Instrument Sans, sans-serif',
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#2D6A4F', secondary: '#FFFFFF' } },
            error: { iconTheme: { primary: '#C0392B', secondary: '#FFFFFF' } },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  )
}