import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  /** Optional lead text under the H1. */
  subtitle?: ReactNode
  /** KPI boxes shown on the right. */
  kpis?: ReactNode
  /** Right-aligned actions. */
  actions?: ReactNode
}

/** Fraunces H1 + optional KPI boxes. */
export function PageHeader({ title, subtitle, kpis, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-prose text-sm text-muted">{subtitle}</p>
        ) : null}
        {actions ? <div className="mt-3 flex gap-2">{actions}</div> : null}
      </div>
      {kpis ? <div className="flex flex-wrap gap-3">{kpis}</div> : null}
    </div>
  )
}
