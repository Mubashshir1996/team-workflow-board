export type ToastVariant = 'success' | 'error' | 'info'

export type ToastOptions = {
  title?: string
  duration?: number
}

export type ToastRecord = {
  id: string
  message: string
  variant: ToastVariant
  title?: string
}

export type ToastContextValue = {
  success: (message: string, options?: ToastOptions) => string
  error: (message: string, options?: ToastOptions) => string
  info: (message: string, options?: ToastOptions) => string
  dismiss: (id: string) => void
}
