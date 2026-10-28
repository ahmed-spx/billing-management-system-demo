import type { ReactNode } from 'react'
import { cn } from './cn'

/** Simple spinner used while a query loads. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

/** Shimmer placeholder rows for tables/cards. */
export function Skeleton({
  rows = 3,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-8 animate-pulse rounded-md bg-surface-2"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  )
}

/** A readable error — never a raw stack. */
export function ErrorNote({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
      <p className="font-medium">Couldn’t load this.</p>
      <p className="mt-0.5 text-danger/90">
        {message ?? 'Please try again in a moment.'}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md border border-danger/40 px-2 py-1 text-xs font-medium hover:bg-danger/10"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}

interface QueryStateProps {
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry?: () => void
  /** Rows for the loading skeleton. */
  skeletonRows?: number
  children: ReactNode
}

/**
 * Renders a skeleton while loading, a readable error on failure, otherwise the
 * children. Keeps every page's loading/error handling consistent.
 */
export function QueryState({
  isLoading,
  isError,
  error,
  onRetry,
  skeletonRows,
  children,
}: QueryStateProps) {
  if (isLoading) return <Skeleton rows={skeletonRows} />
  if (isError) {
    const message =
      error instanceof Error ? error.message : undefined
    return <ErrorNote message={message} onRetry={onRetry} />
  }
  return <>{children}</>
}
