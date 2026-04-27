import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/features/tasks/TaskCard'
import { cn } from '@/lib/cn'
import type { Task } from '@/types/task'

type TaskSortableCardProps = {
  task: Task
  nowTs: number
  onEditTask: (task: Task) => void
}

export const TaskSortableCard = memo(function TaskSortableCard({
  task,
  nowTs,
  onEditTask,
}: TaskSortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: {
        type: 'task',
        taskId: task.id,
        status: task.status,
      },
    })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && 'z-10 opacity-60')}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} nowTs={nowTs} onEditTask={onEditTask} />
    </div>
  )
})
