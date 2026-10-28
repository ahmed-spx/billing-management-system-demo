# src/components/billing

Billing-specific domain components (exported via `index.ts`).

| Component | Purpose |
|---|---|
| `ExportPreviewModal.tsx` | Sage/Stripe tabbed preview of the export CSV, with a monospace table (negative Sage amounts red, positive Stripe green) and a **Download** button. The download builds the CSV from the preview rows using **RFC-4180 quoting** (`csvCell` wraps any cell containing a comma/quote/newline) — this is what makes Stripe's comma-list cells parse correctly. The button unlocks only once the record is approved. |
