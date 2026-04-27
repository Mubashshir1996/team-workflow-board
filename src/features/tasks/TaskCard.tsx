import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatRelativeUpdatedTime } from '@/features/tasks/formatRelativeUpdatedTime'
import { cn } from '@/lib/cn'
import type { Task, TaskPriority } from '@/types/task'

type TaskCardProps = {
  task: Task
  nowTs: number
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  medium: 'border-amber-200 bg-amber-50 text-amber-800',
  high: 'border-rose-200 bg-rose-50 text-rose-800',
}

function formatPriority(priority: TaskPriority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

export function TaskCard({ task, nowTs }: TaskCardProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug">{task.title}</CardTitle>
          <Badge className={cn('border', PRIORITY_STYLES[task.priority])}>
            {formatPriority(task.priority)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Assignee
          </p>
          <p className="mt-1 text-sm text-slate-800">
            {task.assignee || 'Unassigned'}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tags
          </p>
          {task.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge key={`${task.id}-${tag}`} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-500">No tags</p>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Updated {formatRelativeUpdatedTime(task.updatedAt, nowTs)}
        </p>
      </CardContent>
    </Card>
  )
}
