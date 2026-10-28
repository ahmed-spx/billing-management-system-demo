import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import {
  Banner,
  Button,
  Card,
  CardBody,
  CardHead,
  ListRow,
  Pill,
  QueryState,
  TextField,
} from '../components/ui'
import { useClients, useProperties, usePatchPropertyBilling } from '../api/queries'
import type { Property } from '../api/types'
import { money } from '../lib/format'

/**
 * Manage clients. A Client is just a grouping; billing identity lives on each
 * Property, so the Reviewer edits Sage/Stripe IDs, email, and contact per
 * property here.
 */
export function ManageClients() {
  const clients = useClients('consulting')
  const [clientId, setClientId] = useState<string | null>(null)
  const properties = useProperties(clientId ?? undefined, 'consulting')

  const client = clients.data?.find((c) => c.id === clientId)

  return (
    <>
      <PageHeader
        title="Consulting · Clients"
        subtitle="Consulting clients group properties; each property carries its own billing identity."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[18rem_1fr]">
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
                      ? `${c.propertyCount} properties · new`
                      : `${c.propertyCount} properties`
                  }
                  value={money(c.billedThisPeriod)}
                  onClick={() => setClientId(c.id)}
                />
              ))}
            </div>
          </QueryState>
        </Card>

        {client ? (
          <div className="space-y-5">
            <Card>
              <CardHead title={`${client.name} · Properties`} />
              <QueryState
                isLoading={properties.isLoading}
                isError={properties.isError}
                error={properties.error}
                onRetry={() => properties.refetch()}
              >
                <CardBody className="space-y-4">
                  {properties.data?.map((p) => (
                    <PropertyBillingCard key={p.id} property={p} />
                  ))}
                  {properties.data?.length === 0 ? (
                    <p className="text-sm text-muted">No properties for this client.</p>
                  ) : null}
                </CardBody>
              </QueryState>
            </Card>
          </div>
        ) : (
          <Card>
            <CardBody>
              <Banner tone="review">Select a client to edit its properties.</Banner>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  )
}

/** Editable billing identity for one property. */
function PropertyBillingCard({ property }: { property: Property }) {
  const patch = usePatchPropertyBilling()
  const [form, setForm] = useState({
    name: property.name,
    sageCustomerId: property.sageCustomerId ?? '',
    exportToStripe: property.exportToStripe,
    stripeCustomerId: property.stripeCustomerId ?? '',
    billingEmail: property.billingEmail ?? '',
    contactName: property.contactName ?? '',
    billingAddress: property.billingAddress ?? '',
    phone: property.phone ?? '',
  })

  function save() {
    patch.mutate({
      propertyId: property.id,
      patch: {
        name: form.name.trim(),
        sageCustomerId: form.sageCustomerId.trim() || null,
        exportToStripe: form.exportToStripe,
        stripeCustomerId: form.stripeCustomerId.trim() || null,
        billingEmail: form.billingEmail.trim() || null,
        contactName: form.contactName.trim() || null,
        billingAddress: form.billingAddress.trim() || null,
        phone: form.phone.trim() || null,
      },
    })
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-medium text-text">{property.name}</span>
        {property.exportToStripe ? <Pill tone="stripe">Stripe</Pill> : null}
        {property.incomplete ? <Pill tone="danger">incomplete</Pill> : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TextField
          label="Sage Customer ID"
          mono
          value={form.sageCustomerId}
          onChange={(e) => setForm({ ...form, sageCustomerId: e.target.value })}
        />
        <TextField
          label="Billing email"
          mono
          value={form.billingEmail}
          onChange={(e) => setForm({ ...form, billingEmail: e.target.value })}
        />
        <TextField
          label="Contact"
          value={form.contactName}
          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
        />
        <TextField
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <TextField
          label="Billing address"
          wrapClassName="sm:col-span-2"
          value={form.billingAddress}
          onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
        />
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.exportToStripe}
          onChange={(e) => setForm({ ...form, exportToStripe: e.target.checked })}
        />
        <span className="font-medium">Bill through Stripe</span>
      </label>

      {form.exportToStripe ? (
        <div className="mt-3">
          <TextField
            label="Stripe Customer (cus_)"
            mono
            value={form.stripeCustomerId}
            onChange={(e) => setForm({ ...form, stripeCustomerId: e.target.value })}
          />
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-end gap-3">
        {patch.isSuccess ? <span className="text-sm text-accent">Saved.</span> : null}
        <Button variant="primary" disabled={patch.isPending} onClick={save}>
          {patch.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
