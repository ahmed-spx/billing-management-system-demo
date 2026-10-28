import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardBody, CardHead } from '../components/ui'
import { ConfigEditor } from '../components/billing'
import { usePermissions } from '../auth/usePermissions'

/**
 * Property · Reference. The property side does no billing, so there are no
 * account codes or tax type here — just a short glossary for the receipt
 * import + merge workflow.
 */
const PROPERTY_GLOSSARY = [
  {
    term: 'Receipt',
    definition: 'A vendor PDF filed under a property. Its amount is metadata only — nothing is billed on the property side.',
  },
  {
    term: 'Combined PDF',
    definition: 'One PDF per property: an invoice-style cover sheet followed by the selected receipts, merged in order. Export = download it.',
  },
  {
    term: 'Entry vs Reviewer',
    definition: 'Property Entry uploads and organizes receipts; Property Reviewer selects receipts for a property and merges them.',
  },
]

export function PropertyReference() {
  const perms = usePermissions()
  const canEdit = perms.canPropEntry || perms.canPropReview

  return (
    <>
      <PageHeader
        title="Property · Reference"
        subtitle="Glossary for the receipt import + merge workflow, plus the shared billing codes."
      />
      <div className="space-y-5">
        <ConfigEditor canEdit={canEdit} />

        <Card>
          <CardHead title="Glossary" />
          <CardBody className="space-y-3">
            {PROPERTY_GLOSSARY.map((g) => (
              <div key={g.term}>
                <dt className="font-medium text-text">{g.term}</dt>
                <dd className="text-sm text-muted">{g.definition}</dd>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  )
}
