# frontend/src/components/ui

The design-system kit: small, presentational, domain-agnostic building blocks used
across every page. Exported through `index.ts`.

Typical pieces: `Card`/`CardHead`/`CardBody`, `DataTable` + `Column<T>`, `Button`,
`Modal`, `Badge`/`Pill`, `StatusBadge` (workflow status → label + tone), `Banner`,
`TextField`/`TextAreaField`, `Kpi`, `ListRow`, `Breadcrumbs`, and `QueryState` (renders
loading / error / retry around a TanStack Query result).

`cn.ts` is the className-merge helper. These components hold no business logic and
fetch no data — they take props and raise callbacks.
