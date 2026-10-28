import {
  ALL_ROLES,
  ROLE_LABELS,
  usePermissionsContext,
  type Role,
} from '../../auth/usePermissions'
import { Pill } from '../ui'
import { cn } from '../ui/cn'

/**
 * Below the AppBar. A "View as" switcher that chooses which roles are active so
 * you can preview the app from each role's point of view. It filters the local
 * UI only.
 */
export function RoleBand() {
  const { permissions, setRoles, source } = usePermissionsContext()

  const signedInName = 'Demo session'

  const isDevSwitcher = setRoles !== null

  function toggleRole(role: Role) {
    if (!setRoles) return
    const next = permissions.roles.includes(role)
      ? permissions.roles.filter((r) => r !== role)
      : [...permissions.roles, role]
    setRoles(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-surface-2 px-4 py-2 text-sm">
      {isDevSwitcher ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
            View as
          </span>
          {ALL_ROLES.map((role) => {
            const on = permissions.roles.includes(role)
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={cn(
                  'rounded-full border px-2 py-0.5 text-xs font-medium transition',
                  on
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border bg-surface text-muted hover:text-text',
                )}
                title={ROLE_LABELS[role]}
              >
                {role}
              </button>
            )
          })}
          <span className="text-xs text-muted">preview filter — switch roles to explore</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
            Active permissions
          </span>
          {permissions.roles.length === 0 ? (
            <span className="text-xs text-muted">none assigned</span>
          ) : (
            permissions.roles.map((r) => (
              <Pill key={r} tone="primary">
                {ROLE_LABELS[r]}
              </Pill>
            ))
          )}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 text-muted">
        <span className="text-xs">Signed in:</span>
        <span className="text-sm font-medium text-text">{signedInName}</span>
        {source === 'dev' ? (
          <Pill tone="locked" className="ml-1">
            viewing as
          </Pill>
        ) : null}
      </div>
    </div>
  )
}
