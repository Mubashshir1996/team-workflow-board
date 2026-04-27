import { memo } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

type TaskBoardStateProps = {
  eyebrow: string
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'neutral' | 'warning'
  compact?: boolean
}

export const TaskBoardState = memo(function TaskBoardState({
  eyebrow,
  title,
  message,
  actionLabel,
  onAction,
  tone = 'neutral',
  compact = false,
}: TaskBoardStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-6 py-7 shadow-sm',
        tone === 'warning'
          ? 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50'
          : 'border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50',
        compact ? 'p-5' : '',
      )}
    >
      <div className="max-w-2xl">
        <p
          className={cn(
            'mb-2 text-xs font-semibold uppercase tracking-[0.18em]',
            tone === 'warning' ? 'text-amber-700' : 'text-sky-700',
          )}
        >
          {eyebrow}
        </p>
        <h2 className="m-0 text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        {actionLabel && onAction ? (
          <div className="mt-4">
            <Button type="button" variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
})
