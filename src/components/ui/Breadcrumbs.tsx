import { Fragment } from 'react'
import { cn } from './cn'

export interface Crumb {
  label: string
  /** Click to jump back to this level; omit for the current (last) crumb. */
  onClick?: () => void
}

/** Drill-down trail, e.g. Clients / Krusty Krab Holdings / 124 Conch Street. */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[]
  className?: string
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex flex-wrap items-center gap-1 text-sm', className)}
    >
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <Fragment key={`${item.label}-${i}`}>
            {item.onClick && !last ? (
              <button
                type="button"
                onClick={item.onClick}
                className="text-muted hover:text-primary hover:underline"
              >
                {item.label}
              </button>
            ) : (
              <span className={last ? 'font-medium text-text' : 'text-muted'}>
                {item.label}
              </span>
            )}
            {!last ? <span className="text-muted">/</span> : null}
          </Fragment>
        )
      })}
    </nav>
  )
}
