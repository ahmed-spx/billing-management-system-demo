import type { ReactNode } from 'react'
import { cn } from './cn'

interface CardProps {
  children: ReactNode
  className?: string
}

/** White surface, 12px radius, soft shadow. */
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface shadow-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface CardHeadProps {
  title: ReactNode
  /** Right-aligned actions (buttons, filters). */
  actions?: ReactNode
  className?: string
}

/** Card header: Fraunces title + optional actions. */
export function CardHead({ title, actions, className }: CardHeadProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-border px-4 py-3',
        className,
      )}
    >
      <h3 className="font-display text-base font-semibold text-text">{title}</h3>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-4', className)}>{children}</div>
}
