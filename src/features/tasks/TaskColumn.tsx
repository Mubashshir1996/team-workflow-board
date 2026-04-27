import { memo, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TaskSortableCard } from '@/features/tasks/TaskSortableCard'
import { cn } from '@/lib/cn'
import { useTaskStore } from '@/store/useTaskStore'
import type { Task, TaskStatus } from '@/types/task'
import { useShallow } from 'zustand/react/shallow'

type TaskColumnProps = {
  status: TaskStatus
  title: string
  description: string
  nowTs: number
  tasksSelector: (state: { tasks: Task[] }) => Task[]
  onEditTask: (task: Task) => void
}

export const TaskColumn = memo(function TaskColumn({
  status,
  title,
  description,
  nowTs,
  tasksSelector,
  onEditTask,
}: TaskColumnProps) {
  const tasks = useTaskStore(useShallow(tasksSelector))
  const { isOver, setNodeRef } = useDroppable({
    id: `column:${status}`,
    data: {
      type: 'column',
      status,
    },
  })
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks])

  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      className={cn(
        'flex min-h-[18rem] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition',
        isOver && 'border-slate-400 ring-2 ring-slate-200',
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
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskSortableCard
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
        </SortableContext>
      </div>
    </section>
  )
})
