import { useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import {
  Banner,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHead,
  DataTable,
  Kpi,
  ListRow,
  QueryState,
  TextField,
  TextAreaField,
  type Column,
} from '../components/ui'
import { AddPropertyForm, NewClientForm } from '../components/consulting/ClientForms'
import {
  useClients,
  useCurrentPeriod,
  useProperties,
  useSubmitConsultingEntries,
} from '../api/queries'
import type { ConsultingEntry as Entry } from '../api/types'
import { hours as fmtHours, todayIso } from '../lib/format'

const DEFAULT_RATE = 300
const DEFAULT_TAX_TYPE = 1

interface DraftLine {
  id: string
  date: string
  hours: number
  description: string
  rate: number
  taxType: number
}

/**
 * Consulting data entry. Client roster → properties → fast entry → editable
 * draft table → Submit. The drill-down state is all in-page; rate auto-fills to
 * $300 but is editable. Amounts (hours × rate) are shown after submit.
 */
export function ConsultingEntry() {
  const period = useCurrentPeriod('consulting')
  const clients = useClients('consulting')

  const [clientId, setClientId] = useState<string | null>(null)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const properties = useProperties(clientId ?? undefined)
  const submit = useSubmitConsultingEntries()

  const [drafts, setDrafts] = useState<DraftLine[]>([])
  const [form, setForm] = useState<DraftLine>(() => blankLine())

  const selectedClient = clients.data?.find((c) => c.id === clientId)
  const selectedProperty = properties.data?.find((p) => p.id === propertyId)
  const locked = period.data?.locked ?? false

  function blankLine(): DraftLine {
    return {
      id: crypto.randomUUID(),
      date: todayIso(),
      hours: 1,
      description: '',
      rate: DEFAULT_RATE,
      taxType: DEFAULT_TAX_TYPE,
    }
  }

  function addDraft() {
    if (!form.description.trim()) return
    setDrafts((d) => [...d, form])
    setForm(blankLine())
  }

  function patchDraft(id: string, patch: Partial<DraftLine>) {
    setDrafts((d) => d.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  function removeDraft(id: string) {
    setDrafts((d) => d.filter((l) => l.id !== id))
  }

  async function onSubmit() {
    if (!period.data || !clientId || !propertyId || drafts.length === 0) return
    const entries: Entry[] = drafts.map((l) => ({
      id: l.id,
      periodId: period.data!.id,
      clientId,
      propertyId,
      date: l.date,
      hours: l.hours,
      description: l.description,
      rate: l.rate,
      taxType: l.taxType,
      status: 'ready_for_review',
      amount: 0, // server computes hours × rate
    }))
    await submit.mutateAsync(entries)
    setDrafts([])
    setPropertyId(null)
  }

  const crumbs = useMemo(() => {
    const items = [
      {
        label: 'Clients',
        onClick: () => {
          setClientId(null)
          setPropertyId(null)
        },
      },
    ]
    if (selectedClient) {
      items.push({
        label: selectedClient.name,
        onClick: () => setPropertyId(null),
      })
    }
    if (selectedProperty) {
      items.push({ label: selectedProperty.name, onClick: () => {} })
    }
    return items
  }, [selectedClient, selectedProperty])

  const draftColumns: Column<DraftLine>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (l) => (
        <input
          type="date"
          value={l.date}
          onChange={(e) => patchDraft(l.id, { date: e.target.value })}
          className="rounded border border-border bg-surface px-2 py-1 font-mono text-xs"
        />
      ),
    },
    {
      key: 'hours',
      header: 'Hours',
      numeric: true,
      render: (l) => (
        <input
          type="number"
          step="0.25"
          min="0"
          value={l.hours}
          onChange={(e) =>
            patchDraft(l.id, { hours: Number(e.target.value) })
          }
          className="w-20 rounded border border-border bg-surface px-2 py-1 text-right font-mono text-xs tabular-nums"
        />
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (l) => (
        <input
          value={l.description}
          onChange={(e) => patchDraft(l.id, { description: e.target.value })}
          className="w-full min-w-48 rounded border border-border bg-surface px-2 py-1 text-xs"
        />
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      numeric: true,
      render: (l) => (
        <input
          type="number"
          step="25"
          min="0"
          value={l.rate}
          onChange={(e) => patchDraft(l.id, { rate: Number(e.target.value) })}
          className="w-20 rounded border border-border bg-surface px-2 py-1 text-right font-mono text-xs tabular-nums"
        />
      ),
    },
    {
      key: 'taxType',
      header: 'Tax',
      numeric: true,
      render: (l) => (
        <input
          type="number"
          step="1"
          min="0"
          value={l.taxType}
          onChange={(e) => patchDraft(l.id, { taxType: Number(e.target.value) })}
          className="w-16 rounded border border-border bg-surface px-2 py-1 text-right font-mono text-xs tabular-nums"
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Consulting · Data Entry"
        subtitle="Log consulting hours by property. Drafts stay in-page until you submit them for review."
        kpis={
          <>
            <Kpi label="Period" value={period.data?.label ?? '—'} />
            <Kpi label="Draft lines" value={String(drafts.length)} />
          </>
        }
      />

      {period.data ? (
        locked ? (
          <Banner tone="locked" trailing={period.data.label}>
            This period is exported and locked — new entries are disabled.
          </Banner>
        ) : (
          <Banner tone="open" trailing={period.data.label}>
            Period open for entry.
          </Banner>
        )
      ) : null}

      <Breadcrumbs items={crumbs} />

      {/* Step 1 — client roster */}
      {!clientId ? (
        <>
          <NewClientForm />
          <Card>
            <CardHead title="Clients" />
            <QueryState
              isLoading={clients.isLoading}
              isError={clients.isError}
              error={clients.error}
              onRetry={() => clients.refetch()}
            >
              <div>
                {clients.data?.map((c) => (
                  <ListRow
                    key={c.id}
                    name={c.name}
                    sub={
                      c.colorCode === 'new'
                        ? `${c.propertyCount} properties · new customer`
                        : `${c.propertyCount} properties`
                    }
                    onClick={() => setClientId(c.id)}
                  />
                ))}
              </div>
            </QueryState>
          </Card>
        </>
      ) : null}

      {/* Step 2 — property roster */}
      {clientId && !propertyId ? (
        <Card>
          <CardHead title={`${selectedClient?.name ?? 'Client'} · Properties`} />
          <QueryState
            isLoading={properties.isLoading}
            isError={properties.isError}
            error={properties.error}
            onRetry={() => properties.refetch()}
          >
            <div>
              {properties.data?.map((p) => (
                <ListRow
                  key={p.id}
                  name={p.name}
                  sub={`${fmtHours(p.openHours ?? 0)} open`}
                  onClick={() => setPropertyId(p.id)}
                />
              ))}
              <AddPropertyForm clientId={clientId} />
            </div>
          </QueryState>
        </Card>
      ) : null}

      {/* Step 3 — fast entry + draft review */}
      {clientId && propertyId ? (
        <>
          <Card>
            <CardHead title="Fast entry" />
            <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              <TextField
                label="Date"
                type="date"
                mono
                value={form.date}
                disabled={locked}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <TextField
                label="Hours"
                type="number"
                step="0.25"
                min="0"
                mono
                value={form.hours}
                disabled={locked}
                onChange={(e) =>
                  setForm({ ...form, hours: Number(e.target.value) })
                }
              />
              <TextField
                label="Rate"
                type="number"
                step="25"
                min="0"
                mono
                value={form.rate}
                disabled={locked}
                onChange={(e) =>
                  setForm({ ...form, rate: Number(e.target.value) })
                }
              />
              <TextAreaField
                label="Description"
                wrapClassName="sm:col-span-2"
                value={form.description}
                disabled={locked}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <div className="sm:col-span-5">
                <Button
                  variant="primary"
                  onClick={addDraft}
                  disabled={locked || !form.description.trim()}
                >
                  Add line
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHead
              title="Draft review"
              actions={
                <Button
                  variant="accent"
                  onClick={onSubmit}
                  disabled={locked || drafts.length === 0 || submit.isPending}
                >
                  {submit.isPending ? 'Submitting…' : 'Submit for review'}
                </Button>
              }
            />
            <DataTable
              columns={draftColumns}
              rows={drafts}
              rowKey={(l) => l.id}
              rowActions={
                locked
                  ? undefined
                  : (l) => (
                      <Button
                        sm
                        variant="danger"
                        onClick={() => removeDraft(l.id)}
                      >
                        Delete
                      </Button>
                    )
              }
              empty="No draft lines yet — add one above."
            />
          </Card>
        </>
      ) : null}
    </>
  )
}
