import type {
  AppUser,
  Client,
  ConfigRegistry,
  ConsultingEntry,
  NavCounts,
  Period,
  Property,
  Receipt,
} from './types'

/**
 * Demo data for the app. Screens render entirely from these in-memory arrays;
 * the shapes match `types.ts`. Billing identity lives on the Property.
 *
 * IMPORTANT: this is demo/presentation data and must stay 100% fictional — a
 * cartoon cast, example-only domains, and reserved 555-01xx phone numbers. No
 * real client, person, email, or Stripe id may appear here. It's kept small
 * (three clients) but still exercises every behavior the UI demonstrates:
 * two properties sharing one Sage id (one invoice), a per-property Stripe
 * customer, and a freshly created draft client with an incomplete property.
 */

export const mockPeriods: Period[] = [
  {
    id: 'per-cons-2026-10',
    type: 'consulting',
    label: 'October 2026',
    state: 'open',
    locked: false,
  },
  {
    id: 'per-cons-2026-09',
    type: 'consulting',
    label: 'September 2026',
    state: 'locked',
    locked: true,
  },
]

export const mockClients: Client[] = [
  { id: 'cl-krab', name: 'Krusty Krab Holdings', propertyCount: 2, billedThisPeriod: 525, colorCode: null },
  { id: 'cl-springfield', name: 'Springfield Rentals', propertyCount: 1, billedThisPeriod: 525, colorCode: null },
  // A freshly created draft client (flagged "new" — accounting IDs still missing).
  { id: 'cl-acme', name: 'Acme Properties', propertyCount: 1, billedThisPeriod: 0, colorCode: 'new' },
]

export const mockProperties: Property[] = [
  // Krusty Krab Holdings — two properties sharing one Sage ID (one invoice). Not on Stripe.
  {
    id: 'pr-conch', clientId: 'cl-krab', name: '124 Conch Street',
    sageCustomerId: 'KRAB0001', exportToStripe: false, stripeCustomerId: null,
    billingEmail: 'ap@krustykrab.example', contactName: 'Eugene Krabs',
    billingAddress: '124 Conch Street, Bikini Bottom', phone: '555-0101',
    incomplete: false, openHours: 0.25, unfiledReceipts: 1,
  },
  {
    id: 'pr-goo', clientId: 'cl-krab', name: 'Goo Lagoon Shores',
    sageCustomerId: 'KRAB0001', exportToStripe: false, stripeCustomerId: null,
    billingEmail: 'ap@krustykrab.example', contactName: 'Eugene Krabs',
    billingAddress: 'Goo Lagoon, Bikini Bottom', phone: '555-0101',
    incomplete: false, openHours: 1.5, unfiledReceipts: 1,
  },
  // Springfield Rentals — one Stripe property (per-property cus_).
  {
    id: 'pr-evergreen', clientId: 'cl-springfield', name: '742 Evergreen Terrace',
    sageCustomerId: 'SPRG0001', exportToStripe: true, stripeCustomerId: 'cus_Evergreen742',
    billingEmail: 'billing@springfieldrentals.example', contactName: 'Homer Simpson',
    billingAddress: '742 Evergreen Terrace, Springfield', phone: '555-0102',
    incomplete: false, openHours: 1.75, unfiledReceipts: 0,
  },
  // Draft property under the newly created client — no Sage ID yet (incomplete).
  {
    id: 'pr-acmelot', clientId: 'cl-acme', name: 'Warner Lot 7',
    sageCustomerId: null, exportToStripe: false, stripeCustomerId: null,
    billingEmail: 'ap@acmeproperties.example', contactName: 'Bugs Bunny',
    billingAddress: '1 Warner Boulevard, Burbank', phone: '555-0103',
    incomplete: true, openHours: 1, unfiledReceipts: 0,
  },
]

export const mockConsultingEntries: ConsultingEntry[] = [
  { id: 'ce-1', periodId: 'per-cons-2026-10', clientId: 'cl-krab', propertyId: 'pr-conch', date: '2026-10-01', hours: 0.25, description: 'received fully executed docs from HUD and uploaded to the shared drive.', rate: 300, taxType: 1, status: 'ready_for_review', amount: 75 },
  { id: 'ce-2', periodId: 'per-cons-2026-10', clientId: 'cl-krab', propertyId: 'pr-goo', date: '2026-10-04', hours: 1.5, description: 'finalized the utility allowance workbook and completed the first pass at the budget.', rate: 300, taxType: 1, status: 'approved', amount: 450 },
  { id: 'ce-3', periodId: 'per-cons-2026-10', clientId: 'cl-springfield', propertyId: 'pr-evergreen', date: '2026-10-07', hours: 0.5, description: 'Updated budget with salary information. Sent for review and approval.', rate: 300, taxType: 1, status: 'approved', amount: 150 },
  { id: 'ce-4', periodId: 'per-cons-2026-10', clientId: 'cl-springfield', propertyId: 'pr-evergreen', date: '2026-10-17', hours: 1.25, description: 'Prepared all of the documents for the budget and sent them to be signed.', rate: 300, taxType: 1, status: 'approved', amount: 375 },
  { id: 'ce-5', periodId: 'per-cons-2026-10', clientId: 'cl-acme', propertyId: 'pr-acmelot', date: '2026-10-10', hours: 1, description: 'Kickoff call and initial compliance review.', rate: 300, taxType: 1, status: 'draft', amount: 300 },
]

export const mockReceipts: Receipt[] = [
  { id: 'rc-1', clientId: 'cl-krab', propertyId: 'pr-conch', filename: 'barnacle-plumbing-1042.pdf', type: 'materials', vendor: 'Barnacle Plumbing', date: '2026-10-01', amount: 420, uploadedAt: '2026-10-08T14:22:00Z' },
  { id: 'rc-2', clientId: 'cl-krab', propertyId: 'pr-goo', filename: 'kelp-grounds-oct.pdf', type: 'expense', vendor: 'Kelp Groundskeeping', date: '2026-10-03', amount: 260, uploadedAt: '2026-10-07T09:10:00Z' },
]

// No seeded employees — the Admin grid starts empty (real users are added there).
export const mockUsers: AppUser[] = []

export const mockConfig: ConfigRegistry = {
  accountCodes: [
    { code: '1105-000-10', label: 'Accounts receivable (consulting)' },
    { code: '4060-140-10', label: 'Consulting revenue' },
  ],
  taxType: '1',
  consultingAr: '1105-000-10',
  consultingGl: '4060-140-10',
  propertyAr: '1105-000-40',
  glossary: [
    { term: 'Period', definition: 'A monthly billing window that opens, goes to review, then locks on export.' },
    { term: 'Draft client', definition: 'A client/property created by Data Entry whose accounting IDs the Reviewer still needs to complete.' },
    { term: 'LOCKED', definition: 'An exported period; records are read-only and can no longer be edited.' },
  ],
}

export const mockNavCounts: NavCounts = {
  consReview: 1,
  propReceipts: 2,
  propReview: 0,
}
