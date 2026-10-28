import { useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import {
  Banner,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHead,
  Kpi,
  ListRow,
  QueryState,
  SelectField,
  TextField,
} from '../components/ui'
import {
  useAddProperty,
  useBuildCombinedPdf,
  useClients,
  useCreatePropertyClient,
  useDeleteReceipt,
  useImportReceipt,
  useProperties,
  useReceipts,
} from '../api/queries'
import { RECEIPT_TYPE_LABELS, type Receipt, type ReceiptType } from '../api/types'
import { NameOnlyCreate, UploadZone } from '../components/property/ReceiptControls'
import { usePermissions } from '../auth/usePermissions'
import { money, shortDate, todayIso } from '../lib/format'

/** The four receipt types, in display order. */
const RECEIPT_TYPES: ReceiptType[] = ['expense', 'labor', 'lodging', 'materials']

/**
 * Property · Receipts & Merge. The property side is
 * a receipt-PDF tool, not a billing pipeline: (1) import receipt PDFs filed under
 * a client → property with vendor/date/amount metadata, and (2) select receipts
 * to merge into one combined PDF per property (cover sheet + the selected PDFs).
 * No expense lines, markup, or export here.
 */
export function PropertyReceipts() {
  const perms = usePermissions()
  const clients = useClients('property')
  const [clientId, setClientId] = useState<string | null>(null)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const properties = useProperties(clientId ?? undefined, 'property')
  const receipts = useReceipts(propertyId ?? undefined)

  const importReceipt = useImportReceipt()
  const buildPdf = useBuildCombinedPdf()
  const deleteReceipt = useDeleteReceipt()
  const createClient = useCreatePropertyClient()
  const addProperty = useAddProperty()

  const selectedClient = clients.data?.find((c) => c.id === clientId)
  const selectedProperty = properties.data?.find((p) => p.id === propertyId)

  // Import form state.
  const [file, setFile] = useState<File | null>(null)
  const [filename, setFilename] = useState('')
  const [type, setType] = useState<ReceiptType>('expense')
  const [vendor, setVendor] = useState('')
  const [date, setDate] = useState(todayIso())
  const [amount, setAmount] = useState('')

  // Receipt selection for the merge.
  const [selected, setSelected] = useState<string[]>([])

  // Surfaced error from a failed merge.
  const [buildError, setBuildError] = useState<string | null>(null)

  // Live per-property totals + per-type grouping: all of this property's
  // receipts, regardless of selection. Derived from the query so it updates on
  // import/re-type/delete.
  const dashboard = useMemo(() => {
    const totals: Record<ReceiptType, number> = { expense: 0, labor: 0, lodging: 0, materials: 0 }
    const groups: Record<ReceiptType, Receipt[]> = { expense: [], labor: [], lodging: [], materials: [] }
    for (const r of receipts.data ?? []) {
      totals[r.type] += r.amount
      groups[r.type].push(r)
    }
    const grand = RECEIPT_TYPES.reduce((sum, t) => sum + totals[t], 0)
    return { totals, groups, grand }
  }, [receipts.data])

  // Import is valid only with a file, a type, and an amount > 0.
  const amountNum = Number(amount)
  const canImport =
    !!file && !!filename.trim() && Number.isFinite(amountNum) && amountNum > 0

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
    if (selectedClient)
      items.push({ label: selectedClient.name, onClick: () => setPropertyId(null) })
    if (selectedProperty) items.push({ label: selectedProperty.name, onClick: () => {} })
    return items
  }, [selectedClient, selectedProperty])

  function resetImport() {
    setFile(null)
    setFilename('')
    setType('expense')
    setVendor('')
    setDate(todayIso())
    setAmount('')
  }

  async function doImport() {
    if (!clientId || !propertyId || !canImport) return
    await importReceipt.mutateAsync({
      clientId,
      propertyId,
      filename: filename.trim(),
      type,
      vendor: vendor.trim() || null,
      date: date || null,
      amount: amountNum,
      file,
    })
    resetImport()
  }

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function removeReceipt(r: Receipt) {
    if (!propertyId) return
    if (!window.confirm(`Remove "${r.filename}"? This permanently deletes the uploaded PDF.`)) return
    setBuildError(null)
    try {
      await deleteReceipt.mutateAsync({ propertyId, receiptId: r.id })
      setSelected((s) => s.filter((x) => x !== r.id))
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : 'Could not remove the receipt.')
    }
  }

  async function buildCombined() {
    if (!propertyId || selected.length === 0) return
    setBuildError(null)
    try {
      await buildPdf.mutateAsync({ propertyId, receiptIds: selected })
      setSelected([])
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : 'Could not build the combined PDF.')
    }
  }

  return (
    <>
      <PageHeader
        title="Property · Receipts & Merge"
        subtitle="Import receipt PDFs under a client → property, then merge selected receipts into one combined PDF."
        kpis={
          <>
            <Kpi label="Property" value={selectedProperty?.name ?? '—'} />
            <Kpi label="Receipts" value={String(receipts.data?.length ?? 0)} />
          </>
        }
      />

      <Breadcrumbs items={crumbs} />

      {/* Step 1 — client roster */}
      {!clientId ? (
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
                  sub={`${c.propertyCount} properties`}
                  onClick={() => setClientId(c.id)}
                />
              ))}
              {perms.canPropEntry ? (
                <NameOnlyCreate
                  label="+ New client"
                  placeholder="Client name"
                  pending={createClient.isPending}
                  onCreate={(name) => createClient.mutate(name)}
                />
              ) : null}
            </div>
          </QueryState>
        </Card>
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
                  sub={`${p.unfiledReceipts ?? 0} receipts`}
                  onClick={() => setPropertyId(p.id)}
                />
              ))}
              {perms.canPropEntry && clientId ? (
                <NameOnlyCreate
                  label="+ Add property"
                  placeholder="Property name"
                  pending={addProperty.isPending}
                  onCreate={(name) =>
                    addProperty.mutate({
                      clientId,
                      input: {
                        name,
                        exportToStripe: false,
                        contactName: '',
                        billingAddress: '',
                        phone: '',
                        billingEmail: '',
                      },
                    })
                  }
                />
              ) : null}
            </div>
          </QueryState>
        </Card>
      ) : null}

      {/* Step 3 — import (Entry) + merge (Reviewer) */}
      {clientId && propertyId ? (
        <>
          {perms.canPropEntry ? (
          <Card>
            <CardHead title="Import receipt" />
            <CardBody className="space-y-3">
              <UploadZone
                onFile={(f) => {
                  setFile(f)
                  setFilename(f.name)
                }}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <TextField
                  label="Filename"
                  wrapClassName="sm:col-span-2"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                />
                <SelectField
                  label="Type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ReceiptType)}
                >
                  {RECEIPT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {RECEIPT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </SelectField>
                <TextField
                  label="Vendor"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
                <TextField
                  label="Date"
                  type="date"
                  mono
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <TextField
                  label="Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  mono
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="flex items-end">
                  <Button
                    variant="accent"
                    disabled={!canImport || importReceipt.isPending}
                    onClick={doImport}
                  >
                    {importReceipt.isPending ? 'Importing…' : 'Import'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted">
                Type and amount feed the cover-page totals and the property dashboard.
              </p>
            </CardBody>
          </Card>
          ) : null}

          {/* Live per-property totals by type — all filed receipts, not just the selection. */}
          <Card>
            <CardHead title="Receipt totals · this property" />
            <QueryState
              isLoading={receipts.isLoading}
              isError={receipts.isError}
              error={receipts.error}
              onRetry={() => receipts.refetch()}
            >
              <CardBody className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {RECEIPT_TYPES.map((t) => (
                  <Kpi
                    key={t}
                    label={RECEIPT_TYPE_LABELS[t]}
                    value={money(dashboard.totals[t])}
                  />
                ))}
                <Kpi label="Grand total" value={money(dashboard.grand)} />
              </CardBody>
            </QueryState>
          </Card>

          <Card>
            <CardHead
              title="Filed receipts"
              actions={
                <Button
                  variant="primary"
                  disabled={
                    selected.length === 0 || buildPdf.isPending || !perms.canPropReview
                  }
                  onClick={buildCombined}
                  title={
                    perms.canPropReview
                      ? undefined
                      : 'Merging is a Property Reviewer action'
                  }
                >
                  {buildPdf.isPending
                    ? 'Building…'
                    : `Build combined PDF (${selected.length})`}
                </Button>
              }
            />
            <QueryState
              isLoading={receipts.isLoading}
              isError={receipts.isError}
              error={receipts.error}
              onRetry={() => receipts.refetch()}
              skeletonRows={3}
            >
              {buildError ? (
                <CardBody>
                  <Banner tone="warn">{buildError}</Banner>
                </CardBody>
              ) : buildPdf.isSuccess ? (
                <CardBody>
                  <Banner tone="open">
                    Combined PDF downloaded — invoice-style cover sheet + category
                    totals, then the selected receipts.
                  </Banner>
                </CardBody>
              ) : null}
              <div>
                {(receipts.data ?? []).length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted">
                    No receipts filed under this property yet.
                  </div>
                ) : (
                  // Grouped by category, each with its own subtotal. All four
                  // sections always shown so the breakdown reads consistently.
                  RECEIPT_TYPES.map((t) => {
                    const items = dashboard.groups[t]
                    return (
                      <div key={t}>
                        <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          <span>{RECEIPT_TYPE_LABELS[t]}</span>
                          <span className="tabular-nums">{money(dashboard.totals[t])}</span>
                        </div>
                        {items.length === 0 ? (
                          <div className="border-b border-border px-4 py-3 text-sm text-muted">
                            No {RECEIPT_TYPE_LABELS[t].toLowerCase()} receipts.
                          </div>
                        ) : (
                          items.map((r) => (
                            <label
                              key={r.id}
                              className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3 text-sm hover:bg-surface-2"
                            >
                              <input
                                type="checkbox"
                                checked={selected.includes(r.id)}
                                onChange={() => toggle(r.id)}
                              />
                              <span className="flex-1">
                                <span className="font-mono text-text">{r.filename}</span>
                                <span className="ml-2 text-muted">
                                  {r.vendor ?? 'Unknown vendor'}
                                  {r.date ? ` · ${shortDate(r.date)}` : ''}
                                </span>
                              </span>
                              <span className="tabular-nums text-muted">{money(r.amount)}</span>
                              {perms.canPropEntry ? (
                                <Button
                                  sm
                                  variant="danger"
                                  disabled={deleteReceipt.isPending}
                                  title="Remove receipt"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    void removeReceipt(r)
                                  }}
                                >
                                  Remove
                                </Button>
                              ) : null}
                            </label>
                          ))
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </QueryState>
          </Card>
        </>
      ) : null}
    </>
  )
}
