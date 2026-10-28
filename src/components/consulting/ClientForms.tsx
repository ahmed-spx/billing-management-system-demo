import { useState } from 'react'
import { Button, Card, CardBody, CardHead, Pill, TextField } from '../ui'
import { useAddProperty, useCreateClient } from '../../api/queries'
import type { NewClientInput } from '../../api/types'

/**
 * The two Data-Entry creation forms, extracted from the
 * Consulting Data Entry page so that page stays focused on entry flow. Both forms
 * collect the same required contact fields; accounting IDs (Sage/Stripe) are NOT
 * shown here — the Reviewer completes them later, so the record stays a draft.
 */

const EMPTY: NewClientInput = {
  name: '',
  exportToStripe: false,
  contactName: '',
  billingAddress: '',
  phone: '',
  billingEmail: '',
}

/** All contact fields are required before the form can submit. */
function isComplete(f: NewClientInput): boolean {
  return Boolean(
    f.name.trim() &&
      f.contactName.trim() &&
      f.billingAddress.trim() &&
      f.phone.trim() &&
      f.billingEmail.trim(),
  )
}

/** Trim the free-text fields on submit (keeps `exportToStripe` as-is). */
function trimmed(f: NewClientInput): NewClientInput {
  return {
    ...f,
    name: f.name.trim(),
    contactName: f.contactName.trim(),
    billingAddress: f.billingAddress.trim(),
    phone: f.phone.trim(),
    billingEmail: f.billingEmail.trim(),
  }
}

/** The shared field grid both forms render. */
function PropertyFields({
  form,
  onChange,
  nameLabel,
}: {
  form: NewClientInput
  onChange: (patch: Partial<NewClientInput>) => void
  nameLabel: string
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <TextField
        label={nameLabel}
        value={form.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <TextField
        label="Bill-to contact"
        value={form.contactName}
        onChange={(e) => onChange({ contactName: e.target.value })}
      />
      <TextField
        label="Billing address"
        value={form.billingAddress}
        onChange={(e) => onChange({ billingAddress: e.target.value })}
      />
      <TextField
        label="Phone"
        value={form.phone}
        onChange={(e) => onChange({ phone: e.target.value })}
      />
      <TextField
        label="Billing email"
        type="email"
        value={form.billingEmail}
        onChange={(e) => onChange({ billingEmail: e.target.value })}
      />
      <label className="flex items-end gap-2 pb-2 text-sm">
        <input
          type="checkbox"
          checked={form.exportToStripe}
          onChange={(e) => onChange({ exportToStripe: e.target.checked })}
        />
        <span className="font-medium">Bill through Stripe</span>
        {form.exportToStripe ? <Pill tone="stripe">Stripe</Pill> : null}
      </label>
    </div>
  )
}

/**
 * New Client form: Data Entry creates a Client + its first Property in one step.
 */
export function NewClientForm() {
  const create = useCreateClient()
  const [form, setForm] = useState<NewClientInput>(EMPTY)
  const [open, setOpen] = useState(false)
  const set = (patch: Partial<NewClientInput>) => setForm((f) => ({ ...f, ...patch }))

  async function submit() {
    if (!isComplete(form)) return
    await create.mutateAsync(trimmed(form))
    setForm(EMPTY)
    setOpen(false)
  }

  if (!open) {
    return (
      <Button sm variant="primary" onClick={() => setOpen(true)}>
        + New client
      </Button>
    )
  }

  return (
    <Card>
      <CardHead
        title="New client"
        actions={
          <Button sm variant="default" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        }
      />
      <CardBody className="space-y-3">
        <PropertyFields form={form} onChange={set} nameLabel="Name (client / property)" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            All fields required. Sage/Stripe IDs are completed later by the Reviewer.
          </span>
          <Button variant="accent" disabled={!isComplete(form) || create.isPending} onClick={submit}>
            {create.isPending ? 'Creating…' : 'Create draft client'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * Add another Property under an existing client. Same field set as the
 * new-client form; accounting IDs are left for the Reviewer.
 */
export function AddPropertyForm({ clientId }: { clientId: string }) {
  const add = useAddProperty()
  const [form, setForm] = useState<NewClientInput>(EMPTY)
  const [open, setOpen] = useState(false)
  const set = (patch: Partial<NewClientInput>) => setForm((f) => ({ ...f, ...patch }))

  async function submit() {
    if (!isComplete(form)) return
    await add.mutateAsync({ clientId, input: trimmed(form) })
    setForm(EMPTY)
    setOpen(false)
  }

  if (!open) {
    return (
      <div className="px-4 py-3">
        <Button sm variant="primary" onClick={() => setOpen(true)}>
          + Add property
        </Button>
      </div>
    )
  }

  return (
    <div className="border-b border-border px-4 py-3">
      <PropertyFields form={form} onChange={set} nameLabel="Property name" />
      <div className="mt-2 flex items-center justify-end gap-2">
        <Button sm variant="default" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button sm variant="accent" disabled={!isComplete(form) || add.isPending} onClick={submit}>
          {add.isPending ? 'Adding…' : 'Add property'}
        </Button>
      </div>
    </div>
  )
}
