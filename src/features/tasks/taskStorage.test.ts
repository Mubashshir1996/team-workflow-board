import {
  loadTasks,
  saveTasks,
  TASKS_SCHEMA_VERSION,
  TASKS_STORAGE_KEY,
} from '@/features/tasks/taskStorage'
import type { Task } from '@/types/task'

describe('taskStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns empty status when storage has no tasks', () => {
    const result = loadTasks()

    expect(result.tasks).toEqual([])
    expect(result.schemaVersion).toBe(TASKS_SCHEMA_VERSION)
    expect(result.migrationStatus).toBe('empty')
    expect(result.storageStatus).toBe('available')
  })

  it('saves and loads version 2 tasks without migration', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Write tests',
        description: 'Cover core storage behavior',
        status: 'todo',
        priority: 'high',
        assignee: 'Alex',
        tags: ['testing'],
        createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        updatedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
      },
    ]

    saveTasks(tasks)
    const result = loadTasks()

    expect(result.tasks).toEqual(tasks)
    expect(result.schemaVersion).toBe(2)
    expect(result.migrationStatus).toBe('none')
    expect(result.storageStatus).toBe('available')
  })

  it('migrates schema version 1 data to version 2 and returns migration status', () => {
    window.localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tasks: [
          {
            id: 'legacy-1',
            title: 'Legacy task',
            status: 'in_progress',
            description: 'Older schema record',
          },
        ],
      }),
    )

    const result = loadTasks()

    expect(result.schemaVersion).toBe(2)
    expect(result.migrationStatus).toBe('migrated')
    expect(result.migratedFromVersion).toBe(1)
    expect(result.storageStatus).toBe('available')
    expect(result.tasks).toHaveLength(1)
    const migratedTask = result.tasks[0]
    expect(migratedTask).toBeDefined()
    if (!migratedTask) {
      throw new Error('Expected a migrated task')
    }
    expect(migratedTask).toMatchObject({
      id: 'legacy-1',
      title: 'Legacy task',
      description: 'Older schema record',
      status: 'in_progress',
      priority: 'medium',
      assignee: '',
      tags: [],
    })
    expect(migratedTask.createdAt).toBeTruthy()
    expect(migratedTask.updatedAt).toBeTruthy()

    const persisted = window.localStorage.getItem(TASKS_STORAGE_KEY)
    expect(persisted).not.toBeNull()
    const parsed: unknown = JSON.parse(persisted ?? '{}')
    if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed) {
      const schemaVersion = Reflect.get(parsed, 'schemaVersion')
      expect(schemaVersion).toBe(2)
      return
    }
    throw new Error('Persisted payload is malformed')
  })

  it('returns invalid migration status for malformed payload', () => {
    window.localStorage.setItem(TASKS_STORAGE_KEY, '{"bad":"value"}')

    const result = loadTasks()

    expect(result.tasks).toEqual([])
    expect(result.migrationStatus).toBe('invalid')
    expect(result.storageStatus).toBe('available')
  })

  it('reports storage unavailable when saving fails', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage blocked')
      })

    const result = saveTasks([
      {
        id: 'task-1',
        title: 'Draft fallback state',
        description: 'Show memory-only warning',
        status: 'todo',
        priority: 'medium',
        assignee: 'Jordan',
        tags: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        updatedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
      },
    ])

    expect(result).toBe('unavailable')
    setItemSpy.mockRestore()
  })

  it('reports storage unavailable when loading fails', () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('Storage blocked')
      })

    const result = loadTasks()

    expect(result.tasks).toEqual([])
    expect(result.migrationStatus).toBe('empty')
    expect(result.storageStatus).toBe('unavailable')
    getItemSpy.mockRestore()
  })
})
