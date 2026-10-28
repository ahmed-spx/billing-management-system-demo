import { useTheme } from '../../lib/useTheme'
import { Button } from '../ui'

/**
 * Sticky top bar: brand mark (navy rounded square with a Fraunces initial),
 * product name, and the theme toggle. The prototype's "PROTOTYPE"
 * flag is dropped in production.
 */
export function AppBar() {
  const { mode, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-semibold text-white">
          N
        </div>
        <div className="leading-tight">
          <div className="font-display text-base font-semibold text-text">
            National Housing Compliance
          </div>
          <div className="text-xs text-muted">Billing</div>
        </div>
      </div>
      <Button
        sm
        variant="default"
        onClick={toggle}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {mode === 'dark' ? '☀︎ Light' : '☾ Dark'}
      </Button>
    </header>
  )
}
