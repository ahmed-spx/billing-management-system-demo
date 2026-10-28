# src/auth

The role → permission model and the "View as" switcher. These checks only hide
or show UI in the demo.

| File | Purpose |
|---|---|
| `usePermissions.ts` | The role model: `Role` union, `toPermissions()` (roles → booleans like `canPropEntry`/`canConsReview` + visible `areas`), `ROLE_LABELS`, and the `usePermissions()` / `usePermissionsContext()` hooks. |
| `PermissionsProvider.tsx` | Holds the active roles for the "View as" switcher, defaulting to all roles. |
| `devRoles.ts` | Persists the "View as" selection to `localStorage` so it survives a page reload. |
