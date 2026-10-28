import { useMemo, useState, type ReactNode } from 'react'
import {
  ALL_ROLES,
  PermissionsContext,
  toPermissions,
  type PermissionsContextValue,
  type Role,
} from './usePermissions'
import { readDevRoles, writeDevRoles } from './devRoles'

function filterRoles(raw: readonly string[]): Role[] {
  return raw.filter((r): r is Role =>
    (ALL_ROLES as readonly string[]).includes(r),
  )
}

/**
 * Resolves the active permissions for the demo.
 *
 * There is no sign-in: the "View as" switcher (RoleBand) picks which roles are
 * active so every screen is reachable. The selection is remembered in
 * localStorage; with nothing saved it defaults to every role.
 */
export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [roles, setRolesState] = useState<Role[]>(() => {
    const saved = readDevRoles()
    const filtered = saved ? filterRoles(saved) : null
    return filtered && filtered.length ? filtered : [...ALL_ROLES]
  })

  const value = useMemo<PermissionsContextValue>(
    () => ({
      permissions: toPermissions(roles),
      setRoles: (next: Role[]) => {
        setRolesState(next)
        writeDevRoles(next)
      },
      source: 'dev',
    }),
    [roles],
  )

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}
