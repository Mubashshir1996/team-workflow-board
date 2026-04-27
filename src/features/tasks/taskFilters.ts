import type { Task, TaskPriority, TaskStatus } from '@/types/task'

export type TaskSortBy = 'createdAt' | 'updatedAt' | 'priority'
export type TaskPriorityFilter = TaskPriority | 'all'

export type TaskFiltersState = {
  statuses: TaskStatus[]
  priority: TaskPriorityFilter
  query: string
  sortBy: TaskSortBy
}

const VALID_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']
const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']
const VALID_SORT_BY: TaskSortBy[] = ['createdAt', 'updatedAt', 'priority']

export const DEFAULT_TASK_FILTERS: TaskFiltersState = {
  statuses: [...VALID_STATUSES],
  priority: 'all',
  query: '',
  sortBy: 'updatedAt',
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

function isTaskStatus(value: string): value is TaskStatus {
  return VALID_STATUSES.includes(value as TaskStatus)
}

function isTaskPriority(value: string): value is TaskPriority {
  return VALID_PRIORITIES.includes(value as TaskPriority)
}

function isSortBy(value: string): value is TaskSortBy {
  return VALID_SORT_BY.includes(value as TaskSortBy)
}

export function parseTaskFiltersFromSearchParams(
  searchParams: URLSearchParams,
): TaskFiltersState {
  const statusParam = searchParams.get('status')
  const parsedStatuses = statusParam
    ? statusParam
        .split(',')
        .map((value) => value.trim())
        .filter(isTaskStatus)
    : []
  const statuses = parsedStatuses.length > 0 ? parsedStatuses : DEFAULT_TASK_FILTERS.statuses

  const priorityParam = searchParams.get('priority')
  const priority =
    priorityParam === 'all' || (priorityParam && isTaskPriority(priorityParam))
      ? priorityParam
      : DEFAULT_TASK_FILTERS.priority

  const query = (searchParams.get('q') ?? '').trim()

  const sortParam = searchParams.get('sort')
  const sortBy = sortParam && isSortBy(sortParam) ? sortParam : DEFAULT_TASK_FILTERS.sortBy

  return {
    statuses,
    priority,
    query,
    sortBy,
  }
}

export function buildSearchParamsFromTaskFilters(
  filters: TaskFiltersState,
): URLSearchParams {
  const params = new URLSearchParams()

  const isDefaultStatuses =
    filters.statuses.length === DEFAULT_TASK_FILTERS.statuses.length &&
    DEFAULT_TASK_FILTERS.statuses.every((status) => filters.statuses.includes(status))
  if (!isDefaultStatuses) {
    params.set('status', filters.statuses.join(','))
  }

  if (filters.priority !== DEFAULT_TASK_FILTERS.priority) {
    params.set('priority', filters.priority)
  }

  if (filters.query) {
    params.set('q', filters.query)
  }

  if (filters.sortBy !== DEFAULT_TASK_FILTERS.sortBy) {
    params.set('sort', filters.sortBy)
  }

  return params
}

export function applyTaskFiltersAndSort(
  tasks: Task[],
  filters: TaskFiltersState,
): Task[] {
  const queryNeedle = filters.query.toLowerCase()

  const filtered = tasks.filter((task) => {
    if (!filters.statuses.includes(task.status)) return false
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (!queryNeedle) return true

    const searchHaystack = [
      task.title,
      task.description,
      task.assignee,
      ...task.tags,
    ]
      .join(' ')
      .toLowerCase()

    return searchHaystack.includes(queryNeedle)
  })

  return [...filtered].sort((a, b) => {
    if (filters.sortBy === 'priority') {
      const byPriority = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
      if (byPriority !== 0) return byPriority
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }

    if (filters.sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}
