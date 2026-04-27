import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        primary: 'border-slate-900 bg-slate-900 text-white',
        secondary: 'border-slate-300 bg-slate-100 text-slate-900',
        destructive: 'border-rose-600 bg-rose-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)
