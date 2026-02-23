import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        instrument: ['Instrument Sans', 'sans-serif'],
      },
      colors: {
        bg: '#FAFAF8',
        surface: '#FFFFFF',
        surface2: '#F5F4F0',
        border: '#E8E6E0',
        'border-strong': '#D0CEC8',
        ink: '#1A1A18',
        'ink-mid': '#555550',
        'ink-muted': '#999990',
        'ink-faint': '#C8C6C0',
        green: {
          DEFAULT: '#2D6A4F',
          light: '#E8F4EE',
          mid: '#D1EBD9',
          dark: '#1B4332',
        },
        gold: {
          DEFAULT: '#9A6700',
          light: '#FFF8E6',
        },
        rose: {
          DEFAULT: '#C0392B',
          light: '#FEF0F0',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.35s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
export default config
