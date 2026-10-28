# src/pages

One file per screen. Pages own their layout + local UI state and pull data
through the `api/queries` hooks.

| Page | Screen |
|---|---|
| `Home.tsx` | Landing / role-aware entry point. |
| `ConsultingEntry.tsx` | **Consulting · Data Entry.** Client → property drill-down, fast draft-line entry, then Submit. Hosts the "New client" form and the "+ Add property" form (both Data-Entry creates). |
| `ConsultingReview.tsx` | **Consulting · Review.** Validation report, reviewer completion of missing Sage/Stripe IDs, a single period-level **Approve submitted**, and the Sage/Stripe export preview + Stripe property selection. |
| `ManageClients.tsx` | **Consulting · Clients.** Per-property billing-identity editor (Sage/Stripe IDs, contact). |
| `PropertyReceipts.tsx` | **Property · Receipts & Merge.** Drill client → property; import receipt PDFs with a required **type** (Expense/Labor/Lodging/Materials) + amount and **remove** them (Entry); a live **per-type totals dashboard** plus **filed receipts grouped by type** with subtotals; select receipts and build the combined PDF — invoice-style cover of category totals (Reviewer). Name-only create of property clients/properties. |
| `PropertyClients.tsx` | **Property · Clients.** Name-only folder management for the property side. |
| `IndexReference.tsx` | **Consulting · Reference.** Account codes + tax type + glossary. |
| `PropertyReference.tsx` | **Property · Reference.** Glossary for the receipt/merge workflow (no billing config). |
| `Admin.tsx` | **Admin.** User + role management grid. |

The consulting and property sides are fully separated — pages request only their
side's clients/properties via `useClients(service)` / `useProperties(clientId, service)`.
