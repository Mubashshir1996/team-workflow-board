import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ring-offset-white disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        secondary:
          'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-400',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)
