import { createContext, useContext } from 'react'

/**
 * Permission roles used to tailor which screens and actions are shown.
 */
export const ALL_ROLES = [
  'cons_entry',
  'cons_review',
  'prop_entry',
  'prop_review',
  'admin',
] as const

export type Role = (typeof ALL_ROLES)[number]

export type Area = 'consulting' | 'property'

export interface Permissions {
  /** Active roles (from the "View as" selection). */
  roles: Role[]
  canConsEntry: boolean
  canConsReview: boolean
  canPropEntry: boolean
  canPropReview: boolean
  isAdmin: boolean
  /** Business areas the active roles can see. */
  areas: Area[]
  /** True if the user holds ANY of the given roles (admin satisfies all). */
  has: (...required: Role[]) => boolean
}

export const ROLE_LABELS: Record<Role, string> = {
  cons_entry: 'Consulting · Data Entry',
  cons_review: 'Consulting · Review',
  prop_entry: 'Property · Entry',
  prop_review: 'Property · Review',
  admin: 'Administrator',
}

/** Map a list of roles into the UI permission booleans. */
export function toPermissions(rawRoles: readonly string[]): Permissions {
  const roles = rawRoles.filter((r): r is Role =>
    (ALL_ROLES as readonly string[]).includes(r),
  )
  const isAdmin = roles.includes('admin')
  const canConsEntry = isAdmin || roles.includes('cons_entry')
  const canConsReview = isAdmin || roles.includes('cons_review')
  const canPropEntry = isAdmin || roles.includes('prop_entry')
  const canPropReview = isAdmin || roles.includes('prop_review')

  const areas: Area[] = []
  if (canConsEntry || canConsReview) areas.push('consulting')
  if (canPropEntry || canPropReview) areas.push('property')

  return {
    roles,
    canConsEntry,
    canConsReview,
    canPropEntry,
    canPropReview,
    isAdmin,
    areas,
    has: (...required: Role[]) =>
      isAdmin || required.some((r) => roles.includes(r)),
  }
}

/**
 * The resolved permissions plus a setter for the "View as" switcher.
 */
export interface PermissionsContextValue {
  permissions: Permissions
  /** Change the active roles to preview the UI from another role. */
  setRoles: ((roles: Role[]) => void) | null
  /** Where the active roles came from. */
  source: 'token' | 'dev'
}

export const PermissionsContext = createContext<PermissionsContextValue | null>(
  null,
)

export function usePermissions(): Permissions {
  const ctx = useContext(PermissionsContext)
  if (!ctx) {
    throw new Error('usePermissions must be used within <PermissionsProvider>')
  }
  return ctx.permissions
}

/** Access the raw context (RoleBand uses this for the dev "View as" switcher). */
export function usePermissionsContext(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext)
  if (!ctx) {
    throw new Error(
      'usePermissionsContext must be used within <PermissionsProvider>',
    )
  }
  return ctx
}
