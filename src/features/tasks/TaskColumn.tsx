import { TaskCard } from '@/features/tasks/TaskCard'
import { cn } from '@/lib/cn'
import { useTasksByStatus } from '@/store/useTaskStore'
import type { Task, TaskStatus } from '@/types/task'

type TaskColumnProps = {
  status: TaskStatus
  title: string
  description: string
  nowTs: number
  onEditTask: (task: Task) => void
}

export function TaskColumn({
  status,
  title,
  description,
  nowTs,
  onEditTask,
}: TaskColumnProps) {
  const tasks = useTasksByStatus(status)

  return (
    <section
      aria-label={title}
      className={cn(
        'flex min-h-[18rem] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
      )}
    >
      <header className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {tasks.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </header>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              nowTs={nowTs}
              onEditTask={onEditTask}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No tasks in this column yet.
          </div>
        )}
      </div>
    </section>
  )
}
