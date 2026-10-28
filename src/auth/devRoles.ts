/**
 * localStorage persistence for the "View as" role switcher, so the selected
 * roles survive a page reload. `PermissionsProvider` reads it on load and writes
 * it when the selection changes.
 */
const KEY = 'nhc.devRoles'

export function readDevRoles(): string[] | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : null
  } catch {
    return null
  }
}

export function writeDevRoles(roles: string[] | null): void {
  try {
    if (roles === null) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(roles))
  } catch {
    /* localStorage unavailable (private mode, blocked) — ignore. */
  }
}
