import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import {
  loadTasks,
  type LoadTasksResult,
  saveTasks,
  type MigrationStatus,
  type StorageStatus,
} from '@/features/tasks/taskStorage'
import type { Task, TaskPriority, TaskStatus } from '@/types/task'

type AddTaskInput = {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee?: string
  tags?: string[]
}

type UpdateTaskInput = Partial<
  Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
>

type TaskStoreState = {
  tasks: Task[]
  isLoaded: boolean
  migrationStatus: MigrationStatus | null
  migratedFromVersion: number | null
  storageStatus: StorageStatus
  addTask: (input: AddTaskInput) => Task
  updateTask: (id: string, updates: UpdateTaskInput) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, nextStatus: TaskStatus) => void
  loadInitialTasks: () => LoadTasksResult
}

function createTaskId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function nowIso() {
  return new Date().toISOString()
}

export const useTaskStore = create<TaskStoreState>((set) => ({
  tasks: [],
  isLoaded: false,
  migrationStatus: null,
  migratedFromVersion: null,
  storageStatus: 'available',

  addTask: (input) => {
    const timestamp = nowIso()
    const nextTask: Task = {
      id: createTaskId(),
      title: input.title.trim(),
      description: input.description ?? '',
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      assignee: input.assignee ?? '',
      tags: input.tags ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    set((state) => {
      const nextTasks = [...state.tasks, nextTask]
      const storageStatus = saveTasks(nextTasks)
      return { tasks: nextTasks, storageStatus }
    })

    return nextTask
  },

  updateTask: (id, updates) => {
    set((state) => {
      const nextTasks = state.tasks.map((task) => {
        if (task.id !== id) return task
        return {
          ...task,
          ...updates,
          updatedAt: nowIso(),
        }
      })
      const storageStatus = saveTasks(nextTasks)
      return { tasks: nextTasks, storageStatus }
    })
  },

  deleteTask: (id) => {
    set((state) => {
      const nextTasks = state.tasks.filter((task) => task.id !== id)
      const storageStatus = saveTasks(nextTasks)
      return { tasks: nextTasks, storageStatus }
    })
  },

  moveTask: (id, nextStatus) => {
    set((state) => {
      const nextTasks = state.tasks.map((task) => {
        if (task.id !== id) return task
        return {
          ...task,
          status: nextStatus,
          updatedAt: nowIso(),
        }
      })
      const storageStatus = saveTasks(nextTasks)
      return { tasks: nextTasks, storageStatus }
    })
  },

  loadInitialTasks: () => {
    const result = loadTasks()
    set({
      tasks: result.tasks,
      isLoaded: true,
      migrationStatus: result.migrationStatus,
      migratedFromVersion: result.migratedFromVersion ?? null,
      storageStatus: result.storageStatus,
    })
    return result
  },
}))

export const selectTasks = (state: TaskStoreState) => state.tasks
export const selectIsLoaded = (state: TaskStoreState) => state.isLoaded
export const selectMigrationStatus = (state: TaskStoreState) =>
  state.migrationStatus
export const selectMigratedFromVersion = (state: TaskStoreState) =>
  state.migratedFromVersion
export const selectStorageStatus = (state: TaskStoreState) =>
  state.storageStatus

export const selectTaskById =
  (taskId: string) =>
  (state: TaskStoreState): Task | undefined =>
    state.tasks.find((task) => task.id === taskId)

export const selectTasksByStatus =
  (status: TaskStatus) =>
  (state: TaskStoreState): Task[] =>
    state.tasks.filter((task) => task.status === status)

const selectTaskActions = (state: TaskStoreState) =>
  ({
    addTask: state.addTask,
    updateTask: state.updateTask,
    deleteTask: state.deleteTask,
    moveTask: state.moveTask,
    loadInitialTasks: state.loadInitialTasks,
  }) as const

export function useTaskActions() {
  return useTaskStore(useShallow(selectTaskActions))
}

export function useTaskById(taskId: string) {
  return useTaskStore(selectTaskById(taskId))
}

export function useTasksByStatus(status: TaskStatus) {
  return useTaskStore(useShallow(selectTasksByStatus(status)))
}

export type { AddTaskInput, TaskStoreState, UpdateTaskInput }
