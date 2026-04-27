import type { TaskStatus } from '@/types/task'

export type TaskBoardColumn = {
  key: TaskStatus
  title: string
  description: string
}

export const TASK_BOARD_COLUMNS: TaskBoardColumn[] = [
  {
    key: 'todo',
    title: 'Backlog',
    description: 'Planned tasks waiting to start',
  },
  {
    key: 'in_progress',
    title: 'In Progress',
    description: 'Work currently being executed',
  },
  {
    key: 'done',
    title: 'Done',
    description: 'Completed tasks ready for review',
  },
]
