import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useSearchParams } from 'react-router-dom'
import { Button, Input, Select, useToast } from '@/components/ui'
import { PageShell } from '@/components/ui/PageShell'
import { TaskColumn } from '@/features/tasks/TaskColumn'
import { TaskBoardState } from '@/features/tasks/TaskBoardState'
import { TaskFormModal, type SubmitTaskPayload } from '@/features/tasks/TaskFormModal'
import {
  DEFAULT_TASK_FILTERS,
  applyTaskFiltersAndSort,
  buildSearchParamsFromTaskFilters,
  parseTaskFiltersFromSearchParams,
  type TaskFiltersState,
} from '@/features/tasks/taskFilters'
import { TASK_BOARD_COLUMNS } from '@/features/tasks/taskBoard.constants'
import {
  selectIsLoaded,
  selectMigratedFromVersion,
  selectMigrationStatus,
  selectStorageStatus,
  useTaskActions,
  useTaskStore,
} from '@/store/useTaskStore'
import type { Task, TaskStatus } from '@/types/task'

const STATUS_FILTER_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export function TaskBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const isLoaded = useTaskStore(selectIsLoaded)
  const tasks = useTaskStore((state) => state.tasks)
  const migrationStatus = useTaskStore(selectMigrationStatus)
  const migratedFromVersion = useTaskStore(selectMigratedFromVersion)
  const storageStatus = useTaskStore(selectStorageStatus)
  const { addTask, loadInitialTasks, moveTask, updateTask } = useTaskActions()
  const [nowTs, setNowTs] = useState(() => Date.now())
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const filters = useMemo(
    () => parseTaskFiltersFromSearchParams(searchParams),
    [searchParams],
  )

  const editingTask = useMemo(
    () => tasks.find((task) => task.id === editingTaskId) ?? null,
    [editingTaskId, tasks],
  )

  const filteredAndSortedTasks = useMemo(
    () => applyTaskFiltersAndSort(tasks, filters),
    [filters, tasks],
  )

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    }
    filteredAndSortedTasks.forEach((task) => grouped[task.status].push(task))
    return grouped
  }, [filteredAndSortedTasks])

  const visibleColumns = useMemo(
    () =>
      TASK_BOARD_COLUMNS.filter((column) => filters.statuses.includes(column.key)),
    [filters.statuses],
  )

  useEffect(() => {
    if (!isLoaded) {
      const result = loadInitialTasks()
      if (result.migrationStatus === 'migrated') {
        toast.success('Your saved tasks were upgraded and are ready to use.', {
          title: `Migration complete from v${result.migratedFromVersion ?? 1}`,
        })
      }
    }
  }, [isLoaded, loadInitialTasks, toast])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowTs(Date.now()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const handleOpenCreate = () => {
    setFormMode('create')
    setEditingTaskId(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (task: Task) => {
    setFormMode('edit')
    setEditingTaskId(task.id)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
  }

  const handleSubmitTask = (payload: SubmitTaskPayload) => {
    if (formMode === 'edit' && editingTask) {
      updateTask(editingTask.id, {
        title: payload.title,
        description: payload.description,
        assignee: payload.assignee,
        status: payload.status,
        priority: payload.priority,
        tags: payload.tags,
      })
      return
    }

    addTask({
      title: payload.title,
      description: payload.description,
      assignee: payload.assignee,
      status: payload.status,
      priority: payload.priority,
      tags: payload.tags,
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeTaskId = String(active.id)
    const activeTask = tasks.find((task) => task.id === activeTaskId)
    if (!activeTask) return

    const overId = String(over.id)
    let nextStatus: TaskStatus | null = null

    if (overId.startsWith('column:')) {
      const overStatus = overId.replace('column:', '')
      if (overStatus === 'todo' || overStatus === 'in_progress' || overStatus === 'done') {
        nextStatus = overStatus
      }
    } else {
      const overTask = tasks.find((task) => task.id === overId)
      if (overTask) {
        nextStatus = overTask.status
      }
    }

    if (!nextStatus || nextStatus === activeTask.status) {
      return
    }

    moveTask(activeTask.id, nextStatus)
  }

  const updateFilters = (nextFilters: TaskFiltersState) => {
    const nextParams = buildSearchParamsFromTaskFilters(nextFilters)
    setSearchParams(nextParams, { replace: true })
  }

  const handleStatusToggle = (status: TaskStatus) => {
    const isActive = filters.statuses.includes(status)
    if (isActive && filters.statuses.length === 1) return

    const nextStatuses = isActive
      ? filters.statuses.filter((value) => value !== status)
      : [...filters.statuses, status]

    updateFilters({
      ...filters,
      statuses: nextStatuses,
    })
  }

  const handlePriorityChange = (value: string) => {
    if (value !== 'all' && value !== 'low' && value !== 'medium' && value !== 'high') {
      return
    }
    updateFilters({
      ...filters,
      priority: value,
    })
  }

  const handleSortChange = (value: string) => {
    if (value !== 'createdAt' && value !== 'updatedAt' && value !== 'priority') {
      return
    }
    updateFilters({
      ...filters,
      sortBy: value,
    })
  }

  const handleSearchChange = (value: string) => {
    updateFilters({
      ...filters,
      query: value.trimStart(),
    })
  }

  const handleResetFilters = () => {
    updateFilters(DEFAULT_TASK_FILTERS)
  }

  const hasTasks = tasks.length > 0
  const hasFilteredResults = filteredAndSortedTasks.length > 0

  return (
    <PageShell>
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-slate-900">
              Team Workflow Board
            </h1>
            <p className="mt-2 text-slate-600">
              Organize work by stage and keep updates visible across your team.
            </p>
          </div>
          <Button onClick={handleOpenCreate}>New Task</Button>
        </div>
      </section>

      {storageStatus === 'unavailable' ? (
        <section className="mb-6">
          <TaskBoardState
            compact
            tone="warning"
            eyebrow="Storage unavailable"
            title="Tasks will only stay in this tab for now."
            message="This browser cannot access local storage, so changes will not persist after a refresh or restart."
          />
        </section>
      ) : null}

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Search"
            placeholder="Search title, assignee, tags..."
            value={filters.query}
            onChange={(event) => handleSearchChange(event.target.value)}
          />

          <Select
            label="Priority"
            value={filters.priority}
            onChange={(event) => handlePriorityChange(event.target.value)}
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>

          <Select
            label="Sort by"
            value={filters.sortBy}
            onChange={(event) => handleSortChange(event.target.value)}
          >
            <option value="updatedAt">Updated time</option>
            <option value="createdAt">Created time</option>
            <option value="priority">Priority</option>
          </Select>

          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-800">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTER_OPTIONS.map((option) => {
              const checked = filters.statuses.includes(option.value)
              return (
                <label
                  key={option.value}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={checked}
                    onChange={() => handleStatusToggle(option.value)}
                  />
                  {option.label}
                </label>
              )
            })}
          </div>
        </div>
      </section>

      {!hasTasks ? (
        <TaskBoardState
          eyebrow="No tasks yet"
          title="Start the board with your first task."
          message="Create a task to begin tracking work across backlog, in progress, and done."
          actionLabel="Create First Task"
          onAction={handleOpenCreate}
        />
      ) : !hasFilteredResults ? (
        <TaskBoardState
          eyebrow="No matches"
          title="No tasks match these filters."
          message="Try clearing the search, changing the selected statuses, or resetting filters to bring tasks back into view."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleColumns.map((column) => (
              <TaskColumn
                key={column.key}
                status={column.key}
                title={column.title}
                description={column.description}
                nowTs={nowTs}
                tasks={tasksByStatus[column.key]}
                onEditTask={handleOpenEdit}
              />
            ))}
          </section>
        </DndContext>
      )}

      {migrationStatus === 'migrated' && migratedFromVersion ? (
        <p className="mt-4 text-center text-sm text-slate-500">
          Saved tasks were upgraded from schema v{migratedFromVersion}.
        </p>
      ) : null}

      <TaskFormModal
        open={isFormOpen}
        mode={formMode}
        task={editingTask}
        onClose={handleCloseForm}
        onSubmitTask={handleSubmitTask}
      />
    </PageShell>
  )
}
