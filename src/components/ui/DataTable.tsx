import type { ReactNode } from 'react'
import { cn } from './cn'

export interface Column<T> {
  key: string
  header: ReactNode
  /** Right-align + mono for numeric columns. */
  numeric?: boolean
  align?: 'left' | 'right' | 'center'
  className?: string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Hover-revealed row actions (edit/delete) — hidden when read-only. */
  rowActions?: (row: T) => ReactNode
  empty?: ReactNode
  className?: string
}

/**
 * Uppercase muted column headers on `surface-2`; mono numeric cells; row hover
 * reveals the action buttons. Pass no `rowActions` for a locked /
 * read-only period.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowActions,
  empty,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-2">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wide text-muted',
                  c.numeric || c.align === 'right'
                    ? 'text-right'
                    : c.align === 'center'
                      ? 'text-center'
                      : 'text-left',
                )}
              >
                {c.header}
              </th>
            ))}
            {rowActions ? <th className="w-0 px-3" /> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="px-3 py-8 text-center text-sm text-muted"
              >
                {empty ?? 'Nothing here yet.'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="group border-t border-border hover:bg-surface-2/60"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'px-3 py-2 align-middle',
                      c.numeric && 'text-right font-mono tabular-nums',
                      !c.numeric && c.align === 'right' && 'text-right',
                      c.align === 'center' && 'text-center',
                      c.className,
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
                {rowActions ? (
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                      {rowActions(row)}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
