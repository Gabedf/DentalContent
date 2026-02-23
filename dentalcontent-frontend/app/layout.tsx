import type { Metadata } from 'next'
import { Playfair_Display, Instrument_Sans } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
})

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'DentalContent Pro',
  description: 'Sistema de autoridade digital para dentistas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${instrument.variable}`}>
      <body className="font-instrument bg-bg text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}