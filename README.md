# NHC Billing — demo

A self-contained, mock-data demo of the NHC Billing web app, published to GitHub
Pages so anyone with the link can explore the UI.

**Live:** https://ahmed-spx.github.io/billing-management-system-demo/

## What this is

- A React + Vite single-page app that runs entirely on **fictional in-memory
  data** (a cartoon cast of example clients) — no sign-in, nothing to install.
- Edits (creating clients, filing receipts, approving periods, etc.) work for
  the session and reset on page reload.
- A **"View as"** switcher lets you explore the app from each role's point of
  view (consulting entry/review, property entry/review, admin).

## Tech stack

| Tool | Why it's here |
|---|---|
| **React 19** + **TypeScript** | Component UI with static types. |
| **Vite 8** | Dev server + optimized production build. |
| **Tailwind CSS v4** | Styling via utility classes; tokens live in `src/theme.css`. |
| **TanStack Query** | Loading/caching/refetch for the demo's data hooks. |
| **React Router** | URL → screen mapping with per-route role guards. |

## Project structure

```
src/
├─ api/           Data hooks (TanStack Query) + the in-memory demo data
├─ auth/          Role model + the "View as" switcher state
├─ components/
│  ├─ layout/     App frame — top bar, role band, sidebar, page header
│  ├─ ui/         Reusable kit — Card, Table, Button, Modal, Badge, Banner, …
│  ├─ consulting/ Consulting-side forms
│  ├─ property/   Property-side controls
│  └─ billing/    Export preview (Sage/Stripe CSV)
├─ pages/         One file per screen
├─ lib/           Small formatting/theme helpers
├─ routes.tsx     URL → screen map, with per-route role guards
├─ theme.css      Tailwind + design tokens (colors, fonts, light/dark mode)
└─ App.tsx        Wires data caching and routing together
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run preview    # preview the production build
```

## Deploy

Pushing to `main` builds and publishes to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). One-time setup:
**Settings → Pages → Source → GitHub Actions**.
