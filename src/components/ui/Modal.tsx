import { useEffect, type ReactNode } from 'react'
import { cn } from './cn'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  /** Footer actions (right-aligned). */
  footer?: ReactNode
  /** Header controls (e.g. the Sage/Stripe tab switcher). */
  headerExtra?: ReactNode
  className?: string
}

/** Centered overlay with blur; header / body / footer. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  headerExtra,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn(
          'my-auto w-full max-w-2xl rounded-card border border-border bg-surface shadow-card',
          className,
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h3 className="font-display text-lg font-semibold text-text">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            {headerExtra}
            <Button sm variant="default" onClick={onClose} aria-label="Close">
              ✕
            </Button>
          </div>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
