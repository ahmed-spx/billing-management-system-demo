# src/api

The data layer. Screens never touch the data directly — they use the hooks here.

| File | Purpose |
|---|---|
| `types.ts` | TypeScript shapes for the app's data model. |
| `mock.ts` | The in-memory demo data (fictional clients, properties, receipts, …). |
| `queries.ts` | **All TanStack Query hooks** (reads + mutations). Each resolves from the demo store with a small simulated latency; mutations update the store for the session. |

## queries.ts — notes on the non-trivial hooks
- `useClients(service)` / `useProperties(clientId, service)` — `service` separates the consulting vs. property sides.
- `useSubmitConsultingEntries` — marks the entered draft lines ready for review.
- `useApproveConsultingPeriod` — approves the whole period at once.
- `useImportReceipt` — records a filed receipt (the chosen PDF is not uploaded anywhere).
- `useDeleteReceipt` — removes a filed receipt; invalidates the receipts list + nav counts so totals update live.
- `useBuildCombinedPdf` — generates a small placeholder PDF and triggers a browser download.
- `useValidationReport` — derives the per-property field-completeness report shown before export.
- `useExportPreview` — the Sage/Stripe CSV preview; `ExportPreviewModal` builds the download (with RFC-4180 quoting) from these rows.
