import type { Task, TaskPriority, TaskStatus } from '@/types/task'

export const TASKS_STORAGE_KEY = 'team-workflow-board.tasks'
export const TASKS_SCHEMA_VERSION = 2

type TaskV1 = {
  id: string
  title: string
  description?: string
  assignee?: string
  status: TaskStatus
}

type TaskV2 = Task

type PersistedTasksV1 = {
  schemaVersion: 1
  tasks: TaskV1[]
}

type PersistedTasksV2 = {
  schemaVersion: 2
  tasks: TaskV2[]
}

type PersistedTasks = PersistedTasksV1 | PersistedTasksV2

export type MigrationStatus = 'none' | 'migrated' | 'empty' | 'invalid'
export type StorageStatus = 'available' | 'unavailable'

export type LoadTasksResult = {
  tasks: Task[]
  schemaVersion: number
  migrationStatus: MigrationStatus
  storageStatus: StorageStatus
  migratedFromVersion?: number
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function toTaskV2(task: TaskV1, nowIso: string): TaskV2 {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    status: normalizeStatus(task.status),
    priority: 'medium',
    assignee: task.assignee ?? '',
    tags: [],
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}

function normalizeStatus(status: string): TaskStatus {
  if (status === 'todo' || status === 'in_progress' || status === 'done') {
    return status
  }
  return 'todo'
}

function normalizePriority(priority: string): TaskPriority {
  if (priority === 'low' || priority === 'medium' || priority === 'high') {
    return priority
  }
  return 'medium'
}

function normalizeTaskV2(task: TaskV2): TaskV2 {
  const nowIso = new Date().toISOString()
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    status: normalizeStatus(task.status),
    priority: normalizePriority(task.priority),
    assignee: task.assignee ?? '',
    tags: Array.isArray(task.tags) ? task.tags : [],
    createdAt: task.createdAt || nowIso,
    updatedAt: task.updatedAt || nowIso,
  }
}

export function saveTasks(tasks: Task[]): StorageStatus {
  const storage = getLocalStorage()
  if (!storage) return 'unavailable'

  const normalized = tasks.map((task) => normalizeTaskV2(task))
  const payload: PersistedTasksV2 = {
    schemaVersion: TASKS_SCHEMA_VERSION,
    tasks: normalized,
  }

  try {
    storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(payload))
    return 'available'
  } catch {
    return 'unavailable'
  }
}

export function loadTasks(): LoadTasksResult {
  const storage = getLocalStorage()
  if (!storage) {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'empty',
      storageStatus: 'unavailable',
    }
  }

  let raw: string | null
  try {
    raw = storage.getItem(TASKS_STORAGE_KEY)
  } catch {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'empty',
      storageStatus: 'unavailable',
    }
  }

  if (!raw) {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'empty',
      storageStatus: 'available',
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'invalid',
      storageStatus: 'available',
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'invalid',
      storageStatus: 'available',
    }
  }

  const payload = parsed as Partial<PersistedTasks> & { schemaVersion?: number }
  if (!Array.isArray(payload.tasks) || typeof payload.schemaVersion !== 'number') {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'invalid',
      storageStatus: 'available',
    }
  }

  if (payload.schemaVersion === 2) {
    const normalized = payload.tasks.map((task) => normalizeTaskV2(task))
    return {
      tasks: normalized,
      schemaVersion: 2,
      migrationStatus: 'none',
      storageStatus: 'available',
    }
  }

  if (payload.schemaVersion === 1) {
    const nowIso = new Date().toISOString()
    const migratedTasks = payload.tasks.map((task) => toTaskV2(task, nowIso))
    const storageStatus = saveTasks(migratedTasks)
    return {
      tasks: migratedTasks,
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'migrated',
      storageStatus,
      migratedFromVersion: 1,
    }
  }

  return {
    tasks: [],
    schemaVersion: TASKS_SCHEMA_VERSION,
    migrationStatus: 'invalid',
    storageStatus: 'available',
    migratedFromVersion: payload.schemaVersion,
  }
}
