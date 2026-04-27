import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui'
import { PageShell } from '@/components/ui/PageShell'
import { TaskColumn } from '@/features/tasks/TaskColumn'
import { TaskFormModal, type SubmitTaskPayload } from '@/features/tasks/TaskFormModal'
import { TASK_BOARD_COLUMNS } from '@/features/tasks/taskBoard.constants'
import { selectIsLoaded, useTaskActions, useTaskStore } from '@/store/useTaskStore'
import type { Task } from '@/types/task'

export function TaskBoardPage() {
  const isLoaded = useTaskStore(selectIsLoaded)
  const tasks = useTaskStore((state) => state.tasks)
  const { addTask, loadInitialTasks, updateTask } = useTaskActions()
  const [nowTs, setNowTs] = useState(() => Date.now())
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const editingTask = useMemo(
    () => tasks.find((task) => task.id === editingTaskId) ?? null,
    [editingTaskId, tasks],
  )

  useEffect(() => {
    if (!isLoaded) {
      loadInitialTasks()
    }
  }, [isLoaded, loadInitialTasks])

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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TASK_BOARD_COLUMNS.map((column) => (
          <TaskColumn
            key={column.key}
            status={column.key}
            title={column.title}
            description={column.description}
            nowTs={nowTs}
            onEditTask={handleOpenEdit}
          />
        ))}
      </section>

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
