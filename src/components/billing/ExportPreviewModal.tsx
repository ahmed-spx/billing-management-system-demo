import { useState } from 'react'
import type { ExportTarget } from '../../api/types'
import { useExportPreview } from '../../api/queries'
import { Button, Modal, QueryState } from '../ui'
import { cn } from '../ui/cn'

interface ExportPreviewModalProps {
  open: boolean
  onClose: () => void
  /** Identifies what is being exported (e.g. a period id) for the cache key. */
  scope: string
  title?: string
  /** Enable the download button once the record is approved. */
  canDownload?: boolean
  /** Tab to open on (default 'sage'). */
  initialTarget?: ExportTarget
  /** For Stripe: the selected property ids to include. */
  propertyIds?: string[]
}

const TABS: { target: ExportTarget; label: string }[] = [
  { target: 'sage', label: 'Sage' },
  { target: 'stripe', label: 'Stripe' },
]

/**
 * Modal with a Sage / Stripe tab switcher and a monospace CSV preview table
 * (negative amounts red for Sage, positive green for Stripe), plus a download
 * button that triggers a browser download of the export file.
 */
export function ExportPreviewModal({
  open,
  onClose,
  scope,
  title = 'Export preview',
  canDownload = false,
  initialTarget = 'sage',
  propertyIds,
}: ExportPreviewModalProps) {
  const [target, setTarget] = useState<ExportTarget>(initialTarget)
  const query = useExportPreview(
    scope,
    target,
    open,
    target === 'stripe' ? propertyIds : undefined,
  )

  // RFC-4180 quoting: wrap a cell in quotes if it contains a comma, quote, or
  // newline (doubling any inner quotes). Required so Stripe's comma-separated
  // list cells, e.g. "150, 375", parse as one field instead of splitting.
  function csvCell(s: string): string {
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  function download() {
    const preview = query.data
    if (!preview) return
    const line = (cells: string[]) => cells.map(csvCell).join(',')
    const csv = [line(preview.columns), ...preview.rows.map(line)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${scope}-${target}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabSwitcher = (
    <div className="flex rounded-lg border border-border p-0.5">
      {TABS.map((t) => (
        <button
          key={t.target}
          type="button"
          onClick={() => setTarget(t.target)}
          className={cn(
            'rounded-md px-3 py-1 text-sm font-medium transition',
            target === t.target
              ? t.target === 'stripe'
                ? 'bg-stripe-soft text-stripe'
                : 'bg-primary-soft text-primary'
              : 'text-muted hover:text-text',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      headerExtra={tabSwitcher}
      className="max-w-3xl"
      footer={
        <>
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={target === 'stripe' ? 'stripe' : 'primary'}
            disabled={!canDownload || !query.data}
            onClick={download}
            title={
              canDownload
                ? undefined
                : 'Approve the record to unlock export'
            }
          >
            Download {target === 'stripe' ? 'Stripe' : 'Sage'} CSV
          </Button>
        </>
      }
    >
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        skeletonRows={5}
      >
        {query.data ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-surface-2 text-left text-muted">
                  {query.data.columns.map((c) => (
                    <th key={c} className="px-3 py-2 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {query.data.rows.map((row, ri) => (
                  <tr key={ri} className="border-t border-border">
                    {row.map((cell, ci) => {
                      const isAmount = query.data!.amountColumns.includes(ci)
                      const negative = cell.trim().startsWith('-')
                      return (
                        <td
                          key={ci}
                          className={cn(
                            'px-3 py-1.5 tabular-nums',
                            isAmount && negative && 'text-danger',
                            isAmount &&
                              !negative &&
                              cell.trim() !== '' &&
                              target === 'stripe' &&
                              'text-accent',
                          )}
                        >
                          {cell}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </QueryState>
      {!canDownload ? (
        <p className="mt-3 text-xs text-muted">
          This is a preview. Export unlocks after the record is approved.
        </p>
      ) : null}
    </Modal>
  )
}
