# frontend/src/components

Reusable React components, grouped by role:

| Folder | What's inside |
|---|---|
| `layout/` | The app frame — top bar, the dev "View as" role band, the sidebar nav, and page headers. |
| `ui/` | The design-system kit — Card, Table/DataTable, Button, Modal, Badge/Pill, Banner, TextField, QueryState, etc. Presentational and domain-agnostic. |
| `billing/` | Domain pieces specific to billing (e.g. the export preview modal, config editor). |
| `consulting/` | Consulting-side forms extracted from the Consulting pages — the New Client / Add Property forms and the Reviewer's complete-property-identity row. |
| `property/` | Property-side receipt controls — the name-only folder create and the drag/drop PDF upload zone. |

Pages compose these; components never fetch data themselves except where noted (they
take data via props and raise events via callbacks).
