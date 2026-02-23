import { cn } from '@/lib/utils'
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

const inputBase =
  'w-full bg-surface border border-border rounded-lg px-3.5 py-2.5 text-ink text-sm font-instrument placeholder-ink-faint transition-all duration-150 outline-none focus:border-border-strong focus:shadow-[0_0_0_3px_rgba(45,106,79,0.08)]'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ className, label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px]">{label}</label>}
      <input ref={ref} className={cn(inputBase, error && 'border-rose', className)} {...props} />
      {error && <span className="text-[12px] text-rose">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  ({ className, label, children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px]">{label}</label>}
      <select ref={ref} className={cn(inputBase, 'appearance-none cursor-pointer', className)} {...props}>
        {children}
      </select>
    </div>
  )
)
Select.displayName = 'Select'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ className, label, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.6px]">{label}</label>}
      <textarea ref={ref} className={cn(inputBase, 'resize-y min-h-[80px] leading-relaxed', className)} {...props} />
    </div>
  )
)
Textarea.displayName = 'Textarea'
