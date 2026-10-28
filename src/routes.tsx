import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { usePermissions, type Role } from './auth/usePermissions'
import { Home } from './pages/Home'
import { ConsultingEntry } from './pages/ConsultingEntry'
import { ConsultingReview } from './pages/ConsultingReview'
import { PropertyReceipts } from './pages/PropertyReceipts'
import { ManageClients } from './pages/ManageClients'
import { PropertyClients } from './pages/PropertyClients'
import { Admin } from './pages/Admin'
import { IndexReference } from './pages/IndexReference'
import { PropertyReference } from './pages/PropertyReference'

/**
 * Route guard: redirect away from a screen the active role may not use. This
 * tailors what each role sees in the demo.
 */
function Guard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const perms = usePermissions()
  if (roles.length > 0 && !perms.has(...roles)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route
          path="consulting"
          element={
            <Guard roles={['cons_entry']}>
              <ConsultingEntry />
            </Guard>
          }
        />
        <Route
          path="consulting/review"
          element={
            <Guard roles={['cons_review']}>
              <ConsultingReview />
            </Guard>
          }
        />
        <Route
          path="property/receipts"
          element={
            <Guard roles={['prop_entry', 'prop_review']}>
              <PropertyReceipts />
            </Guard>
          }
        />
        <Route
          path="clients"
          element={
            <Guard roles={['cons_review']}>
              <ManageClients />
            </Guard>
          }
        />
        <Route
          path="property/clients"
          element={
            <Guard roles={['prop_entry', 'prop_review']}>
              <PropertyClients />
            </Guard>
          }
        />
        <Route
          path="admin"
          element={
            <Guard roles={['admin']}>
              <Admin />
            </Guard>
          }
        />
        <Route
          path="reference"
          element={
            <Guard roles={['cons_entry', 'cons_review']}>
              <IndexReference />
            </Guard>
          }
        />
        <Route
          path="property/reference"
          element={
            <Guard roles={['prop_entry', 'prop_review']}>
              <PropertyReference />
            </Guard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
