import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-instrument rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none'

    const variants = {
      primary: 'bg-ink text-white hover:bg-ink-mid shadow-sm',
      secondary: 'bg-surface text-ink-mid border border-border hover:border-border-strong hover:text-ink shadow-sm',
      ghost: 'bg-transparent text-ink-muted hover:text-ink',
      outline: 'bg-transparent border border-green text-green hover:bg-green-light',
      danger: 'bg-transparent text-rose border border-rose/20 hover:bg-rose-light',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-[13px] font-medium',
      md: 'px-4 py-2 text-sm font-medium',
      lg: 'px-6 py-2.5 text-[15px] font-semibold',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
