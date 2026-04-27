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

export type LoadTasksResult = {
  tasks: Task[]
  schemaVersion: number
  migrationStatus: MigrationStatus
  migratedFromVersion?: number
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

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return

  const normalized = tasks.map((task) => normalizeTaskV2(task))
  const payload: PersistedTasksV2 = {
    schemaVersion: TASKS_SCHEMA_VERSION,
    tasks: normalized,
  }

  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(payload))
}

export function loadTasks(): LoadTasksResult {
  if (typeof window === 'undefined') {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'empty',
    }
  }

  const raw = window.localStorage.getItem(TASKS_STORAGE_KEY)
  if (!raw) {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'empty',
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
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'invalid',
    }
  }

  const payload = parsed as Partial<PersistedTasks> & { schemaVersion?: number }
  if (!Array.isArray(payload.tasks) || typeof payload.schemaVersion !== 'number') {
    return {
      tasks: [],
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'invalid',
    }
  }

  if (payload.schemaVersion === 2) {
    const normalized = payload.tasks.map((task) => normalizeTaskV2(task))
    return {
      tasks: normalized,
      schemaVersion: 2,
      migrationStatus: 'none',
    }
  }

  if (payload.schemaVersion === 1) {
    const nowIso = new Date().toISOString()
    const migratedTasks = payload.tasks.map((task) => toTaskV2(task, nowIso))
    saveTasks(migratedTasks)
    return {
      tasks: migratedTasks,
      schemaVersion: TASKS_SCHEMA_VERSION,
      migrationStatus: 'migrated',
      migratedFromVersion: 1,
    }
  }

  return {
    tasks: [],
    schemaVersion: TASKS_SCHEMA_VERSION,
    migrationStatus: 'invalid',
    migratedFromVersion: payload.schemaVersion,
  }
}
