import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useBeforeUnload, useBlocker } from 'react-router-dom'
import { Button, Input, Modal, Select, TextArea } from '@/components/ui'
import {
  taskFormSchema,
  type TaskFormValues,
} from '@/features/tasks/taskForm.schema'
import type { Task, TaskPriority, TaskStatus } from '@/types/task'

type SubmitTaskPayload = {
  title: string
  description: string
  assignee: string
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
}

type TaskFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task | null
  onClose: () => void
  onSubmitTask: (payload: SubmitTaskPayload) => void
}

const DEFAULT_VALUES: TaskFormValues = {
  title: '',
  description: '',
  assignee: '',
  status: 'todo',
  priority: 'medium',
  tags: '',
}

function getFormValues(task?: Task | null): TaskFormValues {
  if (!task) return DEFAULT_VALUES
  return {
    title: task.title,
    description: task.description,
    assignee: task.assignee,
    status: task.status,
    priority: task.priority,
    tags: task.tags.join(', '),
  }
}

function parseTags(tagsValue: string) {
  if (!tagsValue.trim()) return []
  return tagsValue
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function TaskFormModal({
  open,
  mode,
  task,
  onClose,
  onSubmitTask,
}: TaskFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
    setFocus,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: getFormValues(task),
  })
  const shouldWarnUnsavedChanges = open && isDirty && !isSubmitting
  const blocker = useBlocker(shouldWarnUnsavedChanges)

  useEffect(() => {
    if (!open) return
    reset(getFormValues(task))
    const focusTimer = window.setTimeout(() => setFocus('title'), 0)
    return () => window.clearTimeout(focusTimer)
  }, [open, reset, setFocus, task])

  useBeforeUnload((event) => {
    if (!shouldWarnUnsavedChanges) return
    event.preventDefault()
    event.returnValue = ''
  })

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    const shouldLeave = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?',
    )
    if (shouldLeave) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])

  const validationMessages = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(errors)
            .map((error) => error?.message)
            .filter((message): message is string => Boolean(message)),
        ),
      ),
    [errors],
  )

  const onSubmit = handleSubmit(
    (values) => {
      onSubmitTask({
        title: values.title.trim(),
        description: values.description.trim(),
        assignee: values.assignee.trim(),
        status: values.status,
        priority: values.priority,
        tags: parseTags(values.tags),
      })
      onClose()
    },
    (formErrors) => {
      const firstField = Object.keys(formErrors)[0]
      if (firstField) {
        void setFocus(firstField as keyof TaskFormValues)
      }
    },
  )
  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    void onSubmit(event)
  }
  const handleRequestClose = () => {
    if (!shouldWarnUnsavedChanges) {
      onClose()
      return
    }

    const shouldDiscard = window.confirm(
      'You have unsaved changes. Discard them and close?',
    )
    if (shouldDiscard) {
      onClose()
    }
  }

  const isEditMode = mode === 'edit'

  return (
    <Modal
      open={open}
      onClose={handleRequestClose}
      title={isEditMode ? 'Edit Task' : 'Create Task'}
      className="max-w-2xl"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {validationMessages.length > 0 ? (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
          >
            <p className="m-0 text-sm font-semibold text-rose-900">
              Fix {validationMessages.length === 1 ? 'this issue' : 'these issues'} to continue.
            </p>
            <p className="mt-1 text-sm text-rose-700">
              {validationMessages.join(' ')}
            </p>
          </div>
        ) : null}

        <Input
          label="Title"
          required
          placeholder="Task title"
          errorText={errors.title?.message}
          {...register('title')}
        />

        <TextArea
          label="Description"
          required
          placeholder="Describe what needs to be done"
          errorText={errors.description?.message}
          rows={4}
          {...register('description')}
        />

        <Input
          label="Assignee"
          required
          placeholder="Who owns this task?"
          errorText={errors.assignee?.message}
          {...register('assignee')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Status"
            errorText={errors.status?.message}
            {...register('status')}
          >
            <option value="todo">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </Select>

          <Select
            label="Priority"
            errorText={errors.priority?.message}
            {...register('priority')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>

        <Input
          label="Tags"
          placeholder="Comma separated tags (e.g. frontend, urgent)"
          errorText={errors.tags?.message}
          {...register('tags')}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleRequestClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export type { SubmitTaskPayload }
