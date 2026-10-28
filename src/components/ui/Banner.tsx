import type { ReactNode } from 'react'
import { cn } from './cn'

type BannerTone = 'open' | 'review' | 'locked' | 'warn'

const TONES: Record<BannerTone, string> = {
  open: 'bg-accent-soft text-accent border-accent/30',
  review: 'bg-primary-soft text-primary border-primary/30',
  locked: 'bg-locked-soft text-locked border-locked/30',
  warn: 'bg-danger-soft text-danger border-danger/30',
}

interface BannerProps {
  tone: BannerTone
  children: ReactNode
  /** Optional right-aligned content (e.g. a period label). */
  trailing?: ReactNode
  className?: string
}

/** Full-width status notice. */
export function Banner({ tone, children, trailing, className }: BannerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium',
        TONES[tone],
        className,
      )}
      role="status"
    >
      <span>{children}</span>
      {trailing ? <span className="font-mono text-xs">{trailing}</span> : null}
    </div>
  )
}
