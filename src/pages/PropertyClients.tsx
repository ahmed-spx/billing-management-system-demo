import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import {
  Banner,
  Button,
  Card,
  CardBody,
  CardHead,
  ListRow,
  QueryState,
  TextField,
} from '../components/ui'
import {
  useAddProperty,
  useClients,
  useCreatePropertyClient,
  useProperties,
} from '../api/queries'
import { usePermissions } from '../auth/usePermissions'

/**
 * Property · Clients. The property side is receipt folders only — a
 * client groups properties, properties hold receipts. No billing identity, so
 * creation is name-only. Property Entry builds the folder structure here.
 */
export function PropertyClients() {
  const perms = usePermissions()
  const clients = useClients('property')
  const [clientId, setClientId] = useState<string | null>(null)
  const properties = useProperties(clientId ?? undefined, 'property')
  const createClient = useCreatePropertyClient()
  const addProperty = useAddProperty()

  const [newClient, setNewClient] = useState('')
  const [newProperty, setNewProperty] = useState('')

  const client = clients.data?.find((c) => c.id === clientId)
  const canEdit = perms.canPropEntry

  return (
    <>
      <PageHeader
        title="Property · Clients"
        subtitle="Receipt folders: clients group properties. No billing — name only."
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
                  sub={`${c.propertyCount} properties`}
                  onClick={() => setClientId(c.id)}
                />
              ))}
            </div>
          </QueryState>
          {canEdit ? (
            <CardBody className="flex items-end gap-2">
              <TextField
                label="New client"
                wrapClassName="flex-1"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
              />
              <Button
                variant="accent"
                disabled={!newClient.trim() || createClient.isPending}
                onClick={() => {
                  createClient.mutate(newClient.trim())
                  setNewClient('')
                }}
              >
                {createClient.isPending ? 'Adding…' : 'Add'}
              </Button>
            </CardBody>
          ) : null}
        </Card>

        {client ? (
          <Card>
            <CardHead title={`${client.name} · Properties`} />
            <QueryState
              isLoading={properties.isLoading}
              isError={properties.isError}
              error={properties.error}
              onRetry={() => properties.refetch()}
            >
              <div>
                {properties.data?.map((p) => (
                  <ListRow key={p.id} name={p.name} sub={`${p.unfiledReceipts ?? 0} receipts`} />
                ))}
                {properties.data?.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted">No properties yet.</p>
                ) : null}
              </div>
            </QueryState>
            {canEdit ? (
              <CardBody className="flex items-end gap-2">
                <TextField
                  label="New property"
                  wrapClassName="flex-1"
                  value={newProperty}
                  onChange={(e) => setNewProperty(e.target.value)}
                />
                <Button
                  variant="accent"
                  disabled={!newProperty.trim() || addProperty.isPending}
                  onClick={() => {
                    addProperty.mutate({
                      clientId: client.id,
                      input: {
                        name: newProperty.trim(),
                        exportToStripe: false,
                        contactName: '',
                        billingAddress: '',
                        phone: '',
                        billingEmail: '',
                      },
                    })
                    setNewProperty('')
                  }}
                >
                  {addProperty.isPending ? 'Adding…' : 'Add'}
                </Button>
              </CardBody>
            ) : null}
          </Card>
        ) : (
          <Card>
            <CardBody>
              <Banner tone="review">Select a client to see its properties.</Banner>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  )
}
