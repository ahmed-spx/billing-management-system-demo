import { useState } from 'react'
import { Button, Pill, TextField } from '../ui'
import { usePatchPropertyBilling } from '../../api/queries'
import type { Property } from '../../api/types'

/**
 * One editable row for the Reviewer to set a property's missing accounting IDs
 *. Extracted from the Consulting Review page.
 */
export function CompletePropertyRow({ property }: { property: Property }) {
  const patch = usePatchPropertyBilling()
  const [sage, setSage] = useState(property.sageCustomerId ?? '')
  const [stripeCus, setStripeCus] = useState(property.stripeCustomerId ?? '')

  async function save() {
    await patch.mutateAsync({
      propertyId: property.id,
      patch: {
        sageCustomerId: sage.trim() || null,
        ...(property.exportToStripe
          ? { stripeCustomerId: stripeCus.trim() || null }
          : {}),
      },
    })
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-medium text-text">{property.name}</span>
        {property.exportToStripe ? <Pill tone="stripe">Stripe</Pill> : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TextField
          label="Sage Customer ID"
          mono
          value={sage}
          onChange={(e) => setSage(e.target.value)}
        />
        {property.exportToStripe ? (
          <TextField
            label="Stripe Customer (cus_)"
            mono
            value={stripeCus}
            onChange={(e) => setStripeCus(e.target.value)}
          />
        ) : null}
        <div className="flex items-end">
          <Button variant="accent" disabled={patch.isPending} onClick={save}>
            {patch.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
