import * as React from 'react'
import { cn } from '@/lib/cn'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  helperText?: string
  errorText?: string
  containerClassName?: string
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      helperText,
      errorText,
      className,
      containerClassName,
      required,
      children,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const selectId = id ?? `select-${generatedId}`
    const helperId = helperText ? `${selectId}-helper` : undefined
    const errorId = errorText ? `${selectId}-error` : undefined
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined

    return (
      <div className={cn('w-full', containerClassName)}>
        {label ? (
          <label htmlFor={selectId} className="mb-2 block text-sm font-medium text-slate-800">
            {label}
            {required ? <span className="ml-1 text-rose-600">*</span> : null}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(errorText)}
          aria-describedby={describedBy}
          className={cn(
            'block h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
            errorText && 'border-rose-500 focus-visible:ring-rose-400',
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>
        {helperText ? <p id={helperId} className="mt-2 text-xs text-slate-600">{helperText}</p> : null}
        {errorText ? <p id={errorId} className="mt-2 text-xs text-rose-700">{errorText}</p> : null}
      </div>
    )
  },
)

Select.displayName = 'Select'

export { Select }
export type { SelectProps }
