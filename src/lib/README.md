# frontend/src/lib

Small, pure helper functions with no React or API dependencies.

| File | Purpose |
|---|---|
| `format.ts` | Display formatting: `money` (currency), `hours`/`fmtHours`, `shortDate` (ISO → readable), and `todayIso` (today as `yyyy-mm-dd`). |

Keep this for genuinely reusable, side-effect-free utilities. Anything that formats the
same value two different ways across screens belongs here so it stays consistent.
