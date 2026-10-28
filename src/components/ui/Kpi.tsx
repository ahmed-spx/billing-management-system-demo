import { cn } from './cn'

interface KpiProps {
  label: string
  value: string
  /** Tint the number for positive/negative money. */
  tone?: 'default' | 'accent' | 'danger'
  className?: string
}

/** Metric box for the PageHeader: big mono number + uppercase label. */
export function Kpi({ label, value, tone = 'default', className }: KpiProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface px-4 py-3 min-w-[9rem]',
        className,
      )}
    >
      <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div
        className={cn(
          'mt-1 font-mono text-2xl font-medium tabular-nums',
          tone === 'accent' && 'text-accent',
          tone === 'danger' && 'text-danger',
          tone === 'default' && 'text-text',
        )}
      >
        {value}
      </div>
    </div>
  )
}
