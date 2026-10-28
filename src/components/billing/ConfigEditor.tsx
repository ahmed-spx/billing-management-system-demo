import { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHead, QueryState, TextField } from '../ui'
import { useConfig, usePatchConfig } from '../../api/queries'

/**
 * Editable reference config (account codes + tax type). Shown on both the
 * Consulting and Property reference pages; `canEdit` (an entry/review role for
 * that side) turns the fields into inputs with a Save.
 */
export function ConfigEditor({ canEdit }: { canEdit: boolean }) {
  const config = useConfig()
  const patch = usePatchConfig()

  const [form, setForm] = useState({
    taxType: '',
    consultingGl: '',
    consultingAr: '',
    propertyAr: '',
  })

  // Seed the form once the config loads (and after a successful save refetch).
  useEffect(() => {
    if (config.data) {
      setForm({
        taxType: config.data.taxType,
        consultingGl: config.data.consultingGl,
        consultingAr: config.data.consultingAr,
        propertyAr: config.data.propertyAr,
      })
    }
  }, [config.data])

  const rows: { key: keyof typeof form; label: string }[] = [
    { key: 'taxType', label: 'Tax type' },
    { key: 'consultingGl', label: 'Consulting revenue (GL)' },
    { key: 'consultingAr', label: 'Consulting AR' },
    { key: 'propertyAr', label: 'Property AR' },
  ]

  return (
    <Card>
      <CardHead
        title="Account codes & tax type"
        actions={
          canEdit ? (
            <Button
              sm
              variant="primary"
              disabled={patch.isPending}
              onClick={() => patch.mutate(form)}
            >
              {patch.isPending ? 'Saving…' : patch.isSuccess ? 'Saved' : 'Save'}
            </Button>
          ) : undefined
        }
      />
      <QueryState
        isLoading={config.isLoading}
        isError={config.isError}
        error={config.error}
        onRetry={() => config.refetch()}
      >
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((r) =>
            canEdit ? (
              <TextField
                key={r.key}
                label={r.label}
                mono
                value={form[r.key]}
                onChange={(e) => setForm({ ...form, [r.key]: e.target.value })}
              />
            ) : (
              <div key={r.key}>
                <div className="text-xs text-muted">{r.label}</div>
                <div className="font-mono text-text">{form[r.key] || '—'}</div>
              </div>
            ),
          )}
        </CardBody>
      </QueryState>
    </Card>
  )
}
