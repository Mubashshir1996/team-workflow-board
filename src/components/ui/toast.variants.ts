import { cva } from 'class-variance-authority'

export const toastVariants = cva(
  'pointer-events-auto w-full rounded-lg border p-4 shadow-lg transition',
  {
    variants: {
      variant: {
        success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        error: 'border-rose-300 bg-rose-50 text-rose-900',
        info: 'border-sky-300 bg-sky-50 text-sky-900',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
)
