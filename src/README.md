# src

The React single-page app. It **displays and collects** — all data is the
in-memory demo store, and the role model only tailors which screens are shown.

| Path / file | Purpose |
|---|---|
| `App.tsx` | Composition root — wires the permissions provider, TanStack Query, and the router together. |
| `routes.tsx` | URL → screen map, with a per-route `Guard` (role-based redirect). |
| `theme.css` | Tailwind v4 config + design tokens (colors, fonts, light/dark). |
| `api/` | The demo data hooks (TanStack Query) and the in-memory data. |
| `auth/` | Role model + the "View as" switcher state. |
| `components/` | `layout/` (app frame), `ui/` (reusable kit), `consulting/`, `property/`, `billing/`. |
| `pages/` | One file per screen. |
| `lib/` | Small formatting + theme helpers. |
