import { PageHeader } from '../components/layout/PageHeader'
import { Banner, Card, CardHead, QueryState } from '../components/ui'
import { useToggleUserRole, useUsers } from '../api/queries'
import { ALL_ROLES, ROLE_LABELS } from '../auth/usePermissions'

/**
 * Admin. A users × permission-sets toggle grid for managing who holds which
 * role.
 */
export function Admin() {
  const users = useUsers()
  const toggle = useToggleUserRole()

  return (
    <>
      <PageHeader
        title="Admin"
        subtitle="Assign permission sets to users."
      />

      <Banner tone="review">
        Toggling a permission here reflects an API change — the browser never
        gates access on its own.
      </Banner>

      <Card>
        <CardHead title="Users × permissions" />
        <QueryState
          isLoading={users.isLoading}
          isError={users.isError}
          error={users.error}
          onRetry={() => users.refetch()}
          skeletonRows={4}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface-2">
                  <th className="px-3 py-2 text-left text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                    User
                  </th>
                  {ALL_ROLES.map((role) => (
                    <th
                      key={role}
                      className="px-3 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-muted"
                      title={ROLE_LABELS[role]}
                    >
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.data?.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      <div className="font-medium text-text">{u.name}</div>
                      <div className="font-mono text-xs text-muted">
                        {u.email}
                      </div>
                    </td>
                    {ALL_ROLES.map((role) => (
                      <td key={role} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={u.roles.includes(role)}
                          disabled={toggle.isPending}
                          onChange={() =>
                            toggle.mutate({ userId: u.id, role })
                          }
                          aria-label={`${u.name} — ${ROLE_LABELS[role]}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </QueryState>
      </Card>
    </>
  )
}
