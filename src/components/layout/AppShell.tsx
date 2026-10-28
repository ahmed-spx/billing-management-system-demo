import { Outlet } from 'react-router-dom'
import { AppBar } from './AppBar'
import { RoleBand } from './RoleBand'
import { Sidebar } from './Sidebar'

/**
 * Three stacked regions above the content: AppBar, RoleBand, then the
 * Sidebar + scrolling Content column. Pages render into <Outlet />.
 */
export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppBar />
      <RoleBand />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-6xl space-y-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
