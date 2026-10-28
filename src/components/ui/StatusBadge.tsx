import { cn } from './cn'
import type { WorkflowStatus } from '../../api/types'

/** Workflow status → label + badge tone. */
const STATUS: Record<WorkflowStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-surface-2 text-muted' },
  ready_for_review: {
    label: 'Ready for Review',
    className: 'bg-primary-soft text-primary',
  },
  approved: { label: 'Approved', className: 'bg-accent-soft text-accent' },
  exported: { label: 'Exported · LOCKED', className: 'bg-locked-soft text-locked' },
}

export function StatusBadge({ status }: { status: WorkflowStatus }) {
  const s = STATUS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        s.className,
      )}
    >
      {s.label}
    </span>
  )
}
