import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardBody, CardHead, QueryState } from '../components/ui'
import { ConfigEditor } from '../components/billing'
import { useConfig } from '../api/queries'
import { usePermissions } from '../auth/usePermissions'

/**
 * Consulting · Reference. The editable account codes + tax type (via
 * ConfigEditor — entry/review roles may edit) plus a read-only glossary.
 */
export function IndexReference() {
  const perms = usePermissions()
  const config = useConfig()
  const canEdit = perms.canConsEntry || perms.canConsReview

  return (
    <>
      <PageHeader
        title="Consulting · Reference"
        subtitle="Account codes and tax type used in consulting billing, plus a glossary."
      />

      <div className="space-y-5">
        <ConfigEditor canEdit={canEdit} />

        <Card>
          <CardHead title="Glossary" />
          <QueryState
            isLoading={config.isLoading}
            isError={config.isError}
            error={config.error}
            onRetry={() => config.refetch()}
          >
            <CardBody className="space-y-3">
              {config.data?.glossary.map((g) => (
                <div key={g.term}>
                  <dt className="font-medium text-text">{g.term}</dt>
                  <dd className="text-sm text-muted">{g.definition}</dd>
                </div>
              ))}
            </CardBody>
          </QueryState>
        </Card>
      </div>
    </>
  )
}
