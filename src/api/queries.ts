import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  Client,
  ConfigPatch,
  ConsultingEntry,
  ExportPreview,
  ExportTarget,
  NavCounts,
  NewClientInput,
  NewReceiptInput,
  Period,
  PeriodType,
  Property,
  PropertyBillingPatch,
  Receipt,
  ValidationReport,
} from './types'
import type { Role } from '../auth/usePermissions'
import {
  mockClients,
  mockConfig,
  mockConsultingEntries,
  mockNavCounts,
  mockPeriods,
  mockProperties,
  mockReceipts,
  mockUsers,
} from './mock'

/**
 * Data hooks for the demo. Every read goes through TanStack Query so
 * loading/error/caching are handled centrally; mutations invalidate the
 * relevant key so the UI refetches fresh state.
 *
 * All data is the in-memory demo store in `mock.ts`, resolved with a small
 * simulated latency. Edits mutate that store for the session and reset on
 * reload.
 */

const LATENCY = 180

function resolve<T>(value: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(structuredClone(value)), LATENCY))
}

/** Trigger a browser download for a generated blob (e.g. the combined PDF). */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Derived "incomplete" flag for a property's billing identity. */
function deriveIncomplete(p: Property): boolean {
  if (!p.sageCustomerId) return true
  if (p.exportToStripe && (!p.stripeCustomerId || !p.billingEmail)) return true
  return false
}

export type ServiceSide = 'consulting' | 'property'

export const queryKeys = {
  period: (type: PeriodType) => ['period', type] as const,
  clients: (service?: ServiceSide) => ['clients', service ?? 'all'] as const,
  properties: (clientId?: string, service?: ServiceSide) =>
    ['properties', clientId ?? 'all', service ?? 'all'] as const,
  consultingEntries: (periodId: string) => ['consulting-entries', periodId] as const,
  receipts: (propertyId?: string) => ['receipts', propertyId ?? 'all'] as const,
  users: () => ['users'] as const,
  config: () => ['config'] as const,
  navCounts: () => ['nav-counts'] as const,
  validation: (periodId: string) => ['validation', periodId] as const,
  exportPreview: (scope: string, target: ExportTarget, propertyIds?: string[]) =>
    ['export-preview', scope, target, (propertyIds ?? []).join(',')] as const,
}

/* ----------------------------- reads ----------------------------- */

export function useCurrentPeriod(type: PeriodType) {
  return useQuery({
    queryKey: queryKeys.period(type),
    queryFn: () =>
      resolve(
        mockPeriods.find((p) => p.type === type && p.state !== 'locked') ??
          mockPeriods.find((p) => p.type === type)!,
      ),
  })
}

export function useClients(_service?: ServiceSide) {
  return useQuery({
    queryKey: queryKeys.clients(_service),
    queryFn: () => resolve(mockClients),
  })
}

export function useProperties(clientId?: string, service?: ServiceSide) {
  return useQuery({
    queryKey: queryKeys.properties(clientId, service),
    queryFn: () =>
      resolve(
        clientId
          ? mockProperties.filter((p) => p.clientId === clientId)
          : mockProperties,
      ),
  })
}

export function useConsultingEntries(periodId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.consultingEntries(periodId ?? ''),
    enabled: Boolean(periodId),
    queryFn: () =>
      resolve(mockConsultingEntries.filter((e) => e.periodId === periodId)),
  })
}

export function useReceipts(propertyId?: string) {
  return useQuery({
    queryKey: queryKeys.receipts(propertyId),
    queryFn: () =>
      resolve(
        propertyId
          ? mockReceipts.filter((r) => r.propertyId === propertyId)
          : mockReceipts,
      ),
  })
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: () => resolve(mockUsers),
  })
}

export function useConfig() {
  return useQuery({
    queryKey: queryKeys.config(),
    queryFn: () => resolve(mockConfig),
  })
}

/** Edit the reference config (account codes, tax type). Allowed for entry/review roles. */
export function usePatchConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: ConfigPatch) => {
      Object.assign(mockConfig, patch)
      // Keep the labelled display list in step with the raw codes.
      mockConfig.accountCodes = [
        { code: mockConfig.consultingGl, label: 'Consulting revenue' },
        { code: mockConfig.consultingAr, label: 'Consulting AR' },
        { code: mockConfig.propertyAr, label: 'Property AR' },
      ]
      return resolve(mockConfig)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.config() })
    },
  })
}

export function useNavCounts() {
  return useQuery({
    queryKey: queryKeys.navCounts(),
    queryFn: () => resolve(mockNavCounts),
  })
}

/**
 * Pre-export validation report — a field-completeness check shown before
 * export. Derived from the period's properties + submitted entries.
 */
export function useValidationReport(periodId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.validation(periodId ?? ''),
    enabled: Boolean(periodId),
    queryFn: async (): Promise<ValidationReport> => {
      const properties = mockProperties
      const entries = mockConsultingEntries.filter((e) => e.periodId === periodId)

      const propsWithEntries = new Set(
        entries.filter((e) => e.status !== 'draft').map((e) => e.propertyId),
      )
      const issues = properties
        .filter((p) => propsWithEntries.has(p.id))
        .map((p) => {
          const messages: string[] = []
          if (!p.sageCustomerId) messages.push('Missing Sage Customer ID.')
          if (p.exportToStripe && !p.stripeCustomerId)
            messages.push('Stripe property missing Stripe Customer ID.')
          if (p.exportToStripe && !p.billingEmail)
            messages.push('Stripe property missing Customer Email.')
          return { propertyId: p.id, propertyName: p.name, messages }
        })
        .filter((i) => i.messages.length > 0)

      return resolve({ passed: issues.length === 0, issues })
    },
  })
}

/**
 * The CSV export preview. `scope` is the period id; for Stripe, `propertyIds`
 * narrows the selection.
 */
export function useExportPreview(
  scope: string,
  target: ExportTarget,
  enabled = true,
  propertyIds?: string[],
) {
  return useQuery({
    queryKey: queryKeys.exportPreview(scope, target, propertyIds),
    enabled,
    queryFn: (): Promise<ExportPreview> => mockExportPreview(target),
  })
}

function mockExportPreview(target: ExportTarget): Promise<ExportPreview> {
  if (target === 'sage') {
    return resolve({
      target,
      columns: [
        'Customer ID', 'Invoice number', 'Credit Memo', 'Quantity', 'Unit Price',
        'Amount', 'Date', 'Due Date', 'Description', 'AR Account', 'GL Account',
        'Tax Type', 'Number of Distributions',
      ],
      amountColumns: [4, 5],
      rows: [
        ['KRAB0001', '00000261', 'FALSE', '0.25', '300', '-75', '10/31/2026', '11/30/2026', '10/01/2026 - 0.25 Hours - 124 Conch Street - received fully executed docs', '1105-000-10', '4060-140-10', '1', '2'],
        ['KRAB0001', '00000261', 'FALSE', '1.5', '300', '-450', '10/31/2026', '11/30/2026', '10/04/2026 - 1.5 Hours - Goo Lagoon Shores - finalized the UAB', '1105-000-10', '4060-140-10', '1', '2'],
      ],
    })
  }
  return resolve({
    target,
    columns: [
      'Stripe_Customer_ID', 'Amount_Due', 'quantity', 'Currency', 'description',
      'status', 'due_date', 'auto_advance', 'collection_method', 'tax_behavior',
      'metadata', 'custom_fields', 'footer', 'payment_method', 'subscription',
      'automatic_tax', 'Customer_Email', 'Memo',
    ],
    amountColumns: [1],
    rows: [
      ['cus_Evergreen742', '150, 375', '1, 1', 'USD', '10/07/26 - 0.5 hour - Updated budget with salary information. Sent for review and approval. , 10/17/26 - 1.25 hours - Prepared all of the documents for the budget and sent them to be signed. ', 'open', '30/11/2026', 'TRUE', 'send_invoice', 'unspecified', '', '', '', '', '', '', 'billing@springfieldrentals.example', 'October 2026 - NHC Consulting Services Billing - Sandy Cheeks - 742 Evergreen Terrace'],
    ],
  })
}

/* --------------------------- mutations --------------------------- */

/** Submit the entered draft lines for review. */
export function useSubmitConsultingEntries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (entries: ConsultingEntry[]) => {
      for (const e of entries) {
        const idx = mockConsultingEntries.findIndex((x) => x.id === e.id)
        const submitted = { ...e, status: 'ready_for_review' as const }
        if (idx >= 0) mockConsultingEntries[idx] = submitted
        else mockConsultingEntries.push(submitted)
      }
      return resolve({ ok: true, count: entries.length })
    },
    onSuccess: (_d, entries) => {
      const periodId = entries[0]?.periodId
      if (periodId) qc.invalidateQueries({ queryKey: queryKeys.consultingEntries(periodId) })
      qc.invalidateQueries({ queryKey: queryKeys.navCounts() })
    },
  })
}

/** Approve all submitted entries in a consulting period (the reviewer approves the batch). */
export function useApproveConsultingPeriod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (periodId: string) => {
      for (const e of mockConsultingEntries) {
        if (e.periodId === periodId && e.status === 'ready_for_review')
          e.status = 'approved'
      }
      return resolve({ ok: true })
    },
    onSuccess: (_d, periodId) => {
      qc.invalidateQueries({ queryKey: queryKeys.consultingEntries(periodId) })
      qc.invalidateQueries({ queryKey: queryKeys.navCounts() })
    },
  })
}

/**
 * Data-entry draft create: a client grouping + its first property, accounting
 * IDs left null (so the property stays incomplete until a reviewer completes it).
 */
export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewClientInput) => {
      const clientId = `cl-${crypto.randomUUID().slice(0, 8)}`
      const client: Client = {
        id: clientId,
        name: input.name,
        propertyCount: 1,
        billedThisPeriod: 0,
        colorCode: 'new',
      }
      const property: Property = {
        id: `pr-${crypto.randomUUID().slice(0, 8)}`,
        clientId,
        name: input.name,
        sageCustomerId: null,
        exportToStripe: input.exportToStripe,
        stripeCustomerId: null,
        billingEmail: input.billingEmail,
        contactName: input.contactName,
        billingAddress: input.billingAddress,
        phone: input.phone,
        incomplete: true,
        openHours: 0,
        unfiledReceipts: 0,
      }
      mockClients.push(client)
      mockProperties.push(property)
      return resolve({ client, property })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

/** Create a property-side client: a receipt folder — name only, no billing identity. */
export function useCreatePropertyClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const client: Client = {
        id: `cl-${crypto.randomUUID().slice(0, 8)}`,
        name,
        propertyCount: 1,
        billedThisPeriod: 0,
        colorCode: null,
      }
      mockClients.push(client)
      return resolve(client)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

/** Add another draft property under an existing client. */
export function useAddProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { clientId: string; input: NewClientInput }) => {
      const property: Property = {
        id: `pr-${crypto.randomUUID().slice(0, 8)}`,
        clientId: vars.clientId,
        name: vars.input.name,
        sageCustomerId: null,
        exportToStripe: vars.input.exportToStripe,
        stripeCustomerId: null,
        billingEmail: vars.input.billingEmail,
        contactName: vars.input.contactName,
        billingAddress: vars.input.billingAddress,
        phone: vars.input.phone,
        incomplete: true,
        openHours: 0,
        unfiledReceipts: 0,
      }
      mockProperties.push(property)
      return resolve(property)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

/** Reviewer completion / edit of a property's billing identity. */
export function usePatchPropertyBilling() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { propertyId: string; patch: PropertyBillingPatch }) => {
      const p = mockProperties.find((x) => x.id === vars.propertyId)
      if (p) {
        Object.assign(p, vars.patch)
        p.incomplete = deriveIncomplete(p)
      }
      return resolve({ ok: true })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['properties'] })
      qc.invalidateQueries({ queryKey: ['validation'] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

/** File a receipt under a property. */
export function useImportReceipt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewReceiptInput) => {
      const receipt: Receipt = {
        id: `rc-${crypto.randomUUID().slice(0, 8)}`,
        clientId: input.clientId,
        propertyId: input.propertyId,
        filename: input.filename,
        type: input.type,
        vendor: input.vendor,
        date: input.date,
        amount: input.amount,
        uploadedAt: new Date().toISOString(),
      }
      mockReceipts.push(receipt)
      return resolve(receipt)
    },
    onSuccess: (_d, input) => {
      qc.invalidateQueries({ queryKey: queryKeys.receipts(input.propertyId) })
      qc.invalidateQueries({ queryKey: ['receipts'] })
      qc.invalidateQueries({ queryKey: queryKeys.navCounts() })
    },
  })
}

/** Remove a filed receipt. */
export function useDeleteReceipt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { propertyId: string; receiptId: string }) => {
      const idx = mockReceipts.findIndex((r) => r.id === vars.receiptId)
      if (idx >= 0) mockReceipts.splice(idx, 1)
      return resolve({ ok: true })
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.receipts(vars.propertyId) })
      qc.invalidateQueries({ queryKey: ['receipts'] })
      qc.invalidateQueries({ queryKey: queryKeys.navCounts() })
    },
  })
}

/**
 * Build + download the combined property PDF (invoice-style cover + selected
 * receipts). The demo generates a small placeholder file so the flow is testable.
 */
export function useBuildCombinedPdf() {
  return useMutation({
    mutationFn: async (vars: { propertyId: string; receiptIds: string[] }) => {
      const blob = new Blob(
        [`Mock combined PDF — ${vars.receiptIds.length} receipt(s) selected.`],
        { type: 'application/pdf' },
      )
      downloadBlob(blob, `combined-${vars.propertyId}.pdf`)
      return resolve({ ok: true, count: vars.receiptIds.length })
    },
  })
}

/** Admin grid: toggle one role for one user. */
export function useToggleUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { userId: string; role: Role }) => {
      const u = mockUsers.find((x) => x.id === vars.userId)
      if (u) {
        u.roles = u.roles.includes(vars.role)
          ? u.roles.filter((r) => r !== vars.role)
          : [...u.roles, vars.role]
      }
      return resolve({ ok: true })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users() })
    },
  })
}

// Re-export for convenience at call sites.
export type { Client, Period, Property, Receipt, NavCounts }
