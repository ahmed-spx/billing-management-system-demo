# src/components/consulting

Consulting-side form pieces, extracted from the Consulting pages so those pages stay
focused on their flow. Presentational and self-contained: they call the `api/queries`
mutation hooks directly and hold no business logic.

| File | What's inside |
|---|---|
| `ClientForms.tsx` | The Data-Entry **New Client** and **+ Add Property** forms (a shared field grid + validation helpers). Used by the Consulting Data Entry page. Accounting IDs are **not** collected here — the Reviewer completes them, so the record stays a draft. |
| `CompletePropertyRow.tsx` | The Reviewer's editable row for setting a property's missing Sage / Stripe IDs. Used by the Consulting Review page. |
