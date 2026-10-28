import { Navigate } from 'react-router-dom'
import { usePermissions } from '../auth/usePermissions'

/**
 * Landing route — redirects to the first screen the active role allows.
 * Everyone can reach /reference as a fallback.
 */
export function Home() {
  const perms = usePermissions()

  const target = perms.canConsEntry
    ? '/consulting'
    : perms.canConsReview
      ? '/consulting/review'
      : perms.canPropEntry
        ? '/property/receipts'
        : perms.canPropReview
          ? '/property/review'
          : perms.isAdmin
            ? '/admin'
            : '/reference'

  return <Navigate to={target} replace />
}
