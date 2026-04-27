import * as React from 'react'
import { createPortal } from 'react-dom'
import { ToastContext } from '@/components/ui/toast.context'
import type {
  ToastContextValue,
  ToastOptions,
  ToastRecord,
  ToastVariant,
} from '@/components/ui/toast.types'
import { toastVariants } from '@/components/ui/toast.variants'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type ToastProviderProps = {
  children: React.ReactNode
}

const DEFAULT_DURATION_MS = 4000

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([])
  const timeoutRef = React.useRef<Map<string, number>>(new Map())

  const dismiss = React.useCallback((id: string) => {
    const timeoutId = timeoutRef.current.get(id)
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = React.useCallback(
    (variant: ToastVariant, message: string, options?: ToastOptions) => {
      const id = crypto.randomUUID()
      const nextToast: ToastRecord = {
        id,
        message,
        variant,
        ...(options?.title ? { title: options.title } : {}),
      }
      setToasts((prev) => [...prev, nextToast])
      const timeoutId = window.setTimeout(
        () => dismiss(id),
        options?.duration ?? DEFAULT_DURATION_MS,
      )
      timeoutRef.current.set(id, timeoutId)
      return id
    },
    [dismiss],
  )

  React.useEffect(() => {
    const timeouts = timeoutRef.current
    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeouts.clear()
    }
  }, [])

  const value = React.useMemo<ToastContextValue>(
    () => ({
      success: (message, options) => showToast('success', message, options),
      error: (message, options) => showToast('error', message, options),
      info: (message, options) => showToast('info', message, options),
      dismiss,
    }),
    [dismiss, showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

type ToastViewportProps = {
  toasts: ToastRecord[]
  dismiss: (id: string) => void
}

function ToastViewport({ toasts, dismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3"
    >
      {toasts.map((toast) => (
        <div key={toast.id} role="status" className={cn(toastVariants({ variant: toast.variant }))}>
          <div className="flex items-start justify-between gap-3">
            <div>
              {toast.title ? <p className="m-0 text-sm font-semibold">{toast.title}</p> : null}
              <p className="m-0 text-sm">{toast.message}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => dismiss(toast.id)}
              className="h-7 px-2 py-1 text-xs"
              aria-label="Dismiss notification"
            >
              Close
            </Button>
          </div>
        </div>
      ))}
    </div>,
    document.body,
  )
}
