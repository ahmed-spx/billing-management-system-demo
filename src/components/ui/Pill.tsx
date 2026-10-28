import type { ReactNode } from 'react'
import { cn } from './cn'

type Tone = 'primary' | 'accent' | 'locked' | 'danger' | 'stripe' | 'muted'

const TONES: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-accent',
  locked: 'bg-locked-soft text-locked',
  danger: 'bg-danger-soft text-danger',
  stripe: 'bg-stripe-soft text-stripe',
  muted: 'bg-surface-2 text-muted',
}

interface PillProps {
  children: ReactNode
  tone?: Tone
  className?: string
}

/** Small colored label — property tag, Stripe tag, etc.. */
export function Pill({ children, tone = 'primary', className }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
