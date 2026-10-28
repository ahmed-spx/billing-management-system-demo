import type { ReactNode } from 'react'
import { cn } from './cn'

interface ListRowProps {
  name: ReactNode
  /** Mono sub-metric under the name (e.g. "3 properties"). */
  sub?: ReactNode
  /** Right-aligned value, usually money/hours in mono. */
  value?: ReactNode
  onClick?: () => void
  className?: string
}

/** Clickable roster row; hover tints to primary-soft. */
export function ListRow({ name, sub, value, onClick, className }: ListRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left transition last:border-b-0',
        'hover:bg-primary-soft focus:outline-none focus-visible:bg-primary-soft',
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block truncate font-medium text-text">{name}</span>
        {sub ? (
          <span className="block truncate font-mono text-xs tabular-nums text-muted">
            {sub}
          </span>
        ) : null}
      </span>
      {value ? (
        <span className="shrink-0 font-mono text-sm tabular-nums text-text">
          {value}
        </span>
      ) : null}
    </button>
  )
}
