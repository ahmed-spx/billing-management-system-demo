import { NavLink } from 'react-router-dom'
import { usePermissions, type Role } from '../../auth/usePermissions'
import { useNavCounts } from '../../api/queries'
import { cn } from '../ui/cn'

interface NavItem {
  label: string
  to: string
  /** Visible if the user holds ANY of these (empty = everyone). */
  roles: Role[]
  /** Which nav-count field, if any, drives the badge. */
  badge?: 'consReview' | 'propReceipts' | 'propReview'
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const GROUPS: NavGroup[] = [
  {
    label: 'Consulting',
    items: [
      { label: 'Data Entry', to: '/consulting', roles: ['cons_entry'] },
      {
        label: 'Review',
        to: '/consulting/review',
        roles: ['cons_review'],
        badge: 'consReview',
      },
      { label: 'Clients', to: '/clients', roles: ['cons_review'] },
      { label: 'Reference', to: '/reference', roles: ['cons_entry', 'cons_review'] },
    ],
  },
  {
    label: 'Property',
    items: [
      {
        label: 'Receipts & Merge',
        to: '/property/receipts',
        roles: ['prop_entry', 'prop_review'],
        badge: 'propReceipts',
      },
      { label: 'Clients', to: '/property/clients', roles: ['prop_entry', 'prop_review'] },
      { label: 'Reference', to: '/property/reference', roles: ['prop_entry', 'prop_review'] },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Admin', to: '/admin', roles: ['admin'] }],
  },
]

/**
 * Grouped nav. Only the groups/items the active role allows are shown. Badges
 * carry counts (e.g. unfiled receipts).
 */
export function Sidebar() {
  const perms = usePermissions()
  const { data: counts } = useNavCounts()

  const visibleGroups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter(
      (i) => i.roles.length === 0 || perms.has(...i.roles),
    ),
  })).filter((g) => g.items.length > 0)

  return (
    <nav className="flex w-[234px] shrink-0 flex-col gap-5 border-r border-border bg-surface px-3 py-4">
      {visibleGroups.map((group) => (
        <div key={group.label}>
          <div className="px-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
            {group.label}
          </div>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const count = item.badge ? counts?.[item.badge] : undefined
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/consulting'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition',
                        isActive
                          ? 'bg-primary-soft font-medium text-primary'
                          : 'text-text hover:bg-surface-2',
                      )
                    }
                  >
                    <span>{item.label}</span>
                    {count ? (
                      <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-white">
                        {count}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
