import type { ButtonHTMLAttributes } from 'react'
import { cn } from './cn'

type Variant = 'default' | 'primary' | 'accent' | 'stripe' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** Compact size (`sm` in the prototype). */
  sm?: boolean
}

const VARIANTS: Record<Variant, string> = {
  default:
    'bg-surface text-text border border-border hover:bg-surface-2',
  primary:
    'bg-primary text-white border border-primary hover:opacity-90',
  accent:
    'bg-accent text-white border border-accent hover:opacity-90',
  stripe:
    'bg-stripe text-white border border-stripe hover:opacity-90',
  danger:
    'bg-danger text-white border border-danger hover:opacity-90',
}

export function Button({
  variant = 'default',
  sm = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sm ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
