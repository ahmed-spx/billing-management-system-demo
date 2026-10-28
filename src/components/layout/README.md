# src/components/layout

The application frame that wraps every page.

| Component | Purpose |
|---|---|
| `AppShell.tsx` | The outer layout (top bar + role band + sidebar + routed content), rendered as the router's layout route. |
| `Sidebar.tsx` | Grouped nav (Consulting / Property / System). Each item declares the `roles` that may see it and an optional `badge` (from `useNavCounts`). Only items the active role allows are shown. |
| `PageHeader.tsx` | Standard page title + subtitle + optional KPI tiles. |
| `RoleBand` / top bar | The **"View as"** role switcher and the light/dark toggle. |
