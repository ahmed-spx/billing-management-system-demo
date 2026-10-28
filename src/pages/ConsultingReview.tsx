import { useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import {
  Banner,
  Button,
  Card,
  CardBody,
  CardHead,
  DataTable,
  Kpi,
  Pill,
  QueryState,
  StatusBadge,
  type Column,
} from '../components/ui'
import { ExportPreviewModal } from '../components/billing'
import { CompletePropertyRow } from '../components/consulting/CompletePropertyRow'
import {
  useApproveConsultingPeriod,
  useClients,
  useConsultingEntries,
  useCurrentPeriod,
  useProperties,
  useValidationReport,
} from '../api/queries'
import type { ConsultingEntry } from '../api/types'
import { money, shortDate } from '../lib/format'

/**
 * Consulting review. Submitted entries move through
 * the workflow; the validation report lists every incomplete property; the
 * Reviewer completes the missing Sage/Stripe IDs here; Export Sage unlocks only
 * once validation passes; and Stripe export runs for the selected properties.
 * The API is the real gate for every action.
 */
export function ConsultingReview() {
  const period = useCurrentPeriod('consulting')
  const entries = useConsultingEntries(period.data?.id)
  const clients = useClients('consulting')
  const properties = useProperties(undefined, 'consulting')
  const approve = useApproveConsultingPeriod()
  const validation = useValidationReport(period.data?.id)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<'sage' | 'stripe'>('sage')
  // null = default (all Stripe properties in play); otherwise the user's picks.
  const [stripeOverride, setStripeOverride] = useState<string[] | null>(null)

  const clientName = (id: string) =>
    clients.data?.find((c) => c.id === id)?.name ?? id
  const propertyName = (id: string) =>
    properties.data?.find((p) => p.id === id)?.name ?? id

  const submitted = (entries.data ?? []).filter((e) => e.status !== 'draft')
  const anyApproved = submitted.some(
    (e) => e.status === 'approved' || e.status === 'exported',
  )
  const anyReady = submitted.some((e) => e.status === 'ready_for_review')
  const locked = period.data?.locked ?? false
  const validationPassed = validation.data?.passed ?? false

  // Properties that have submitted entries in this period.
  const propsInPlay = useMemo(() => {
    const ids = new Set(submitted.map((e) => e.propertyId))
    return (properties.data ?? []).filter((p) => ids.has(p.id))
  }, [submitted, properties.data])

  const incompleteProps = propsInPlay.filter((p) => p.incomplete)
  const stripeProps = propsInPlay.filter((p) => p.exportToStripe)

  // Default selection = all Stripe properties in play, until the user picks.
  const stripeSelection = stripeOverride ?? stripeProps.map((p) => p.id)

  const columns: Column<ConsultingEntry>[] = [
    { key: 'date', header: 'Date', render: (e) => shortDate(e.date) },
    { key: 'client', header: 'Client', render: (e) => clientName(e.clientId) },
    { key: 'property', header: 'Property', render: (e) => propertyName(e.propertyId) },
    { key: 'description', header: 'Description', render: (e) => e.description },
    { key: 'hours', header: 'Hours', numeric: true, render: (e) => e.hours },
    { key: 'tax', header: 'Tax', numeric: true, render: (e) => e.taxType },
    { key: 'rate', header: 'Rate', numeric: true, render: (e) => money(e.rate) },
    {
      key: 'amount',
      header: 'Amount',
      numeric: true,
      render: (e) => <span className="text-accent">{money(e.amount)}</span>,
    },
    { key: 'status', header: 'Status', render: (e) => <StatusBadge status={e.status} /> },
  ]

  function openPreview(target: 'sage' | 'stripe') {
    setPreviewTarget(target)
    setPreviewOpen(true)
  }

  function toggleStripe(id: string) {
    const base = stripeOverride ?? stripeProps.map((p) => p.id)
    setStripeOverride(
      base.includes(id) ? base.filter((x) => x !== id) : [...base, id],
    )
  }

  const selectedComplete = stripeSelection.filter(
    (id) => !stripeProps.find((p) => p.id === id)?.incomplete,
  )

  return (
    <>
      <PageHeader
        title="Consulting · Review"
        subtitle="Review submitted entries, complete missing IDs, validate, then export."
        kpis={
          <>
            <Kpi label="Submitted" value={String(submitted.length)} />
            <Kpi
              label="Incomplete properties"
              value={String(incompleteProps.length)}
              tone={incompleteProps.length ? 'danger' : undefined}
            />
          </>
        }
      />

      {locked ? (
        <Banner tone="locked" trailing={period.data?.label}>
          Period exported and locked — records are read-only.
        </Banner>
      ) : (
        <Banner tone="review" trailing={period.data?.label}>
          Entries awaiting review.
        </Banner>
      )}

      {/* Validation report */}
      <Card>
        <CardHead
          title="Validation"
          actions={
            <Button
              sm
              variant="default"
              onClick={() => validation.refetch()}
              disabled={validation.isFetching}
            >
              {validation.isFetching ? 'Checking…' : 'Re-validate'}
            </Button>
          }
        />
        <CardBody>
          <QueryState
            isLoading={validation.isLoading}
            isError={validation.isError}
            error={validation.error}
            onRetry={() => validation.refetch()}
          >
            {validationPassed ? (
              <Banner tone="open">
                All properties pass — export is unlocked.
              </Banner>
            ) : (
              <div className="space-y-2">
                <Banner tone="locked">
                  Export is blocked until every property is complete.
                </Banner>
                <ul className="space-y-1 text-sm">
                  {validation.data?.issues.map((i) => (
                    <li key={i.propertyId} className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-text">{i.propertyName}</span>
                      {i.messages.map((m) => (
                        <Pill key={m} tone="danger">
                          {m}
                        </Pill>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </QueryState>
        </CardBody>
      </Card>

      {/* Reviewer completion — set the missing accounting IDs */}
      {!locked && incompleteProps.length > 0 ? (
        <Card>
          <CardHead title="Complete property billing identity" />
          <CardBody className="space-y-3">
            {incompleteProps.map((p) => (
              <CompletePropertyRow key={p.id} property={p} />
            ))}
          </CardBody>
        </Card>
      ) : null}

      {/* Submitted entries */}
      <Card>
        <CardHead
          title="Submitted entries"
          actions={
            <>
              <Button
                variant="accent"
                disabled={locked || !anyReady || approve.isPending}
                onClick={() => period.data && approve.mutate(period.data.id)}
                title="Approve all submitted entries in this period"
              >
                {approve.isPending ? 'Approving…' : 'Approve submitted'}
              </Button>
              <Button variant="default" onClick={() => openPreview('sage')}>
                View export
              </Button>
              <Button
                variant="primary"
                disabled={!anyApproved || !validationPassed}
                onClick={() => openPreview('sage')}
                title={
                  validationPassed
                    ? undefined
                    : 'Validation must pass before export'
                }
              >
                Export Sage CSV
              </Button>
            </>
          }
        />
        <QueryState
          isLoading={entries.isLoading || clients.isLoading}
          isError={entries.isError}
          error={entries.error}
          onRetry={() => entries.refetch()}
          skeletonRows={4}
        >
          <DataTable
            columns={columns}
            rows={submitted}
            rowKey={(e) => e.id}
            empty="No submitted entries for this period."
          />
        </QueryState>
      </Card>

      {/* Stripe export selection */}
      {stripeProps.length > 0 ? (
        <Card>
          <CardHead
            title="Stripe export"
            actions={
              <Button
                variant="stripe"
                disabled={!anyApproved || selectedComplete.length === 0}
                onClick={() => openPreview('stripe')}
              >
                Export Stripe CSV ({selectedComplete.length})
              </Button>
            }
          />
          <CardBody className="space-y-1">
            <p className="mb-2 text-xs text-muted">
              Stripe-billed properties are selected by default. Blocked properties
              are excluded until completed above.
            </p>
            {stripeProps.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  checked={stripeSelection.includes(p.id)}
                  disabled={p.incomplete}
                  onChange={() => toggleStripe(p.id)}
                />
                <span className="font-medium text-text">{p.name}</span>
                <span className="font-mono text-xs text-muted">
                  {p.stripeCustomerId ?? '— no cus_'}
                </span>
                {p.incomplete ? <Pill tone="danger">blocked</Pill> : null}
              </label>
            ))}
          </CardBody>
        </Card>
      ) : null}

      <ExportPreviewModal
        key={previewTarget}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        scope={period.data?.id ?? 'consulting'}
        title="Consulting export preview"
        canDownload={anyApproved && (previewTarget === 'stripe' || validationPassed)}
        initialTarget={previewTarget}
        propertyIds={selectedComplete}
      />
    </>
  )
}
