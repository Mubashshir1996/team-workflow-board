import * as React from 'react'
import { cn } from '@/lib/cn'

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string | undefined
  helperText?: string | undefined
  errorText?: string | undefined
  containerClassName?: string | undefined
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      helperText,
      errorText,
      className,
      containerClassName,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? `input-${generatedId}`
    const helperId = helperText ? `${inputId}-helper` : undefined
    const errorId = errorText ? `${inputId}-error` : undefined
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined

    return (
      <div className={cn('w-full', containerClassName)}>
        {label ? (
          <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-slate-800">
            {label}
            {required ? <span className="ml-1 text-rose-600">*</span> : null}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(errorText)}
          aria-describedby={describedBy}
          className={cn(
            'block h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
            errorText && 'border-rose-500 focus-visible:ring-rose-400',
            className,
          )}
          {...props}
        />
        {helperText ? <p id={helperId} className="mt-2 text-xs text-slate-600">{helperText}</p> : null}
        {errorText ? <p id={errorId} className="mt-2 text-xs text-rose-700">{errorText}</p> : null}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
