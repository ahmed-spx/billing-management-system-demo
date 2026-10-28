import type { Role } from '../auth/usePermissions'

/**
 * TypeScript shapes for the app's data model. All money/hours are precomputed
 * numbers; the frontend never does billing math.
 *
 * The billable unit is the PROPERTY. A Client is a lightweight grouping; all
 * billing identity (Sage/Stripe IDs, email, contact) lives on the Property.
 */

/** Record/period workflow state machine: draft → review → approved → exported. */
export type WorkflowStatus =
  | 'draft'
  | 'ready_for_review'
  | 'approved'
  | 'exported'

export type PeriodType = 'consulting' | 'property'

export type PeriodState = 'open' | 'review' | 'locked'

export interface Period {
  id: string
  type: PeriodType
  /** Human label, e.g. "October 2026". */
  label: string
  state: PeriodState
  /** When true the period is closed to edits; the UI renders rows read-only. */
  locked: boolean
}

/**
 * A Client grouping. Billing identity is NOT here — it lives on each Property.
 * `colorCode` drives the UI "new customer" flag.
 */
export interface Client {
  id: string
  name: string
  propertyCount: number
  /** Dollars billed this period (precomputed). */
  billedThisPeriod: number
  /** UI marker; "new" flags a freshly created draft client. */
  colorCode: string | null
}

/**
 * A Property — the billable unit. Carries all billing identity. `incomplete`
 * is derived (missing Sage ID, or a Stripe property missing its cus_/email).
 */
export interface Property {
  id: string
  clientId: string
  name: string
  sageCustomerId: string | null
  exportToStripe: boolean
  /** Stripe customer id (`cus_...`); required when `exportToStripe`. */
  stripeCustomerId: string | null
  /** Collected at entry (required); feeds the Stripe CSV Customer_Email. */
  billingEmail: string | null
  contactName: string | null
  billingAddress: string | null
  phone: string | null
  /** Derived: still needs accounting IDs before it can be exported. */
  incomplete: boolean
  /** Optional sub-metrics for roster `ListRow`s. */
  openHours?: number
  unfiledReceipts?: number
}

export interface ConsultingEntry {
  id: string
  periodId: string
  clientId: string
  propertyId: string
  /** ISO date (yyyy-mm-dd). */
  date: string
  hours: number
  description: string
  /** Auto-fills to 300, editable. */
  rate: number
  /** Sage tax type code (integer, default 1). Editable before approval. */
  taxType: number
  status: WorkflowStatus
  /** hours × rate, precomputed, display only. */
  amount: number
}

/** Property receipt category. */
export type ReceiptType = 'expense' | 'labor' | 'lodging' | 'materials'

/** Display labels for each receipt type (the user only ever sees the word). */
export const RECEIPT_TYPE_LABELS: Record<ReceiptType, string> = {
  expense: 'Expense',
  labor: 'Labor',
  lodging: 'Lodging',
  materials: 'Materials',
}

/**
 * A receipt PDF filed under a property. The property
 * side is a receipt importer + merger only — no expense line-items, markup, or
 * workflow. `type` and `amount` feed the cover-page totals and the dashboard;
 * the internal GL account behind `type` is never sent to the client.
 */
export interface Receipt {
  id: string
  clientId: string
  propertyId: string
  filename: string
  type: ReceiptType
  vendor: string | null
  /** ISO date (yyyy-mm-dd) or null. */
  date: string | null
  amount: number
  /** ISO datetime. */
  uploadedAt: string
}

export interface AppUser {
  id: string
  name: string
  email: string
  roles: Role[]
}

/** Reference/config registry (account codes, tax type, glossary). */
export interface ConfigRegistry {
  accountCodes: { code: string; label: string }[]
  taxType: string
  /** Raw editable account codes (the labelled `accountCodes` is the display view). */
  consultingAr: string
  consultingGl: string
  propertyAr: string
  glossary: { term: string; definition: string }[]
}

/** Editable config fields. */
export interface ConfigPatch {
  taxType?: string
  consultingAr?: string
  consultingGl?: string
  propertyAr?: string
}

/** Count badges for the sidebar nav. */
export interface NavCounts {
  consReview: number
  propReceipts: number
  propReview: number
}

/** CSV export preview rendered in the mono table. */
export type ExportTarget = 'sage' | 'stripe'

export interface ExportPreview {
  target: ExportTarget
  columns: string[]
  rows: string[][]
  /** Column indexes holding signed money, so the table can color them. */
  amountColumns: number[]
}

/* ---- request/input shapes ---- */

/** Data-Entry "New Client" form — all fields required. */
export interface NewClientInput {
  name: string
  exportToStripe: boolean
  contactName: string
  billingAddress: string
  phone: string
  billingEmail: string
}

/** Reviewer completion of a Property's billing identity. */
export interface PropertyBillingPatch {
  name?: string
  sageCustomerId?: string | null
  exportToStripe?: boolean
  stripeCustomerId?: string | null
  billingEmail?: string | null
  contactName?: string | null
  billingAddress?: string | null
  phone?: string | null
}

/** Receipt import metadata + the PDF file. Type and amount required. */
export interface NewReceiptInput {
  clientId: string
  propertyId: string
  filename: string
  type: ReceiptType
  vendor: string | null
  date: string | null
  amount: number
  /** The PDF file; null in the demo. */
  file: File | null
}

/* ---- validation report (field-completeness check shown before export) ---- */

export interface ValidationIssue {
  propertyId: string
  propertyName: string
  messages: string[]
}

export interface ValidationReport {
  passed: boolean
  issues: ValidationIssue[]
}
