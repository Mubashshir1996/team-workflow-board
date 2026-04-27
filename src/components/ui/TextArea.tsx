import * as React from 'react'
import { cn } from '@/lib/cn'

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string | undefined
  helperText?: string | undefined
  errorText?: string | undefined
  containerClassName?: string | undefined
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id,
      label,
      helperText,
      errorText,
      className,
      containerClassName,
      required,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId()
    const textAreaId = id ?? `textarea-${generatedId}`
    const helperId = helperText ? `${textAreaId}-helper` : undefined
    const errorId = errorText ? `${textAreaId}-error` : undefined
    const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined

    return (
      <div className={cn('w-full', containerClassName)}>
        {label ? (
          <label htmlFor={textAreaId} className="mb-2 block text-sm font-medium text-slate-800">
            {label}
            {required ? <span className="ml-1 text-rose-600">*</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textAreaId}
          rows={rows}
          required={required}
          aria-invalid={Boolean(errorText)}
          aria-describedby={describedBy}
          className={cn(
            'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
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

TextArea.displayName = 'TextArea'

export { TextArea }
export type { TextAreaProps }
