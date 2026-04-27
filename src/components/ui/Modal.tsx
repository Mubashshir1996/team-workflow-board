import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  closeOnEsc?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  closeOnEsc = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()

  React.useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const panel = panelRef.current
    if (!panel) return

    const focusableNodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    const target = focusableNodes[0] ?? panel
    target.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (nodes.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (!first || !last) {
        return
      }
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [closeOnEsc, onClose, open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose()
        }
      }}
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ring-offset-white',
          className,
        )}
      >
        {title ? (
          <h2 id={titleId} className="mb-4 text-lg font-semibold text-slate-900">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  )
}

export type { ModalProps }
