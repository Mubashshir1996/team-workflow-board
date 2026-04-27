import { TASKS_STORAGE_KEY } from '@/features/tasks/taskStorage'
import { useTaskStore } from '@/store/useTaskStore'

describe('useTaskStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useTaskStore.setState({
      tasks: [],
      isLoaded: false,
      migrationStatus: null,
      migratedFromVersion: null,
    })
  })

  it('supports add, update, move and delete task actions', () => {
    const store = useTaskStore.getState()

    const created = store.addTask({
      title: 'Create task store',
      description: 'Add all required actions',
      priority: 'high',
      assignee: 'Sam',
      tags: ['zustand', 'store'],
    })

    expect(useTaskStore.getState().tasks).toHaveLength(1)
    expect(useTaskStore.getState().tasks[0]).toMatchObject({
      id: created.id,
      title: 'Create task store',
      status: 'todo',
      priority: 'high',
    })

    store.updateTask(created.id, { title: 'Create robust task store' })
    expect(useTaskStore.getState().tasks[0]?.title).toBe('Create robust task store')

    store.moveTask(created.id, 'done')
    expect(useTaskStore.getState().tasks[0]?.status).toBe('done')

    store.deleteTask(created.id)
    expect(useTaskStore.getState().tasks).toHaveLength(0)
  })

  it('loads initial tasks and returns migration status', () => {
    window.localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tasks: [{ id: 'legacy-1', title: 'Legacy', status: 'todo' }],
      }),
    )

    const result = useTaskStore.getState().loadInitialTasks()

    expect(result.migrationStatus).toBe('migrated')
    expect(result.migratedFromVersion).toBe(1)
    expect(useTaskStore.getState().isLoaded).toBe(true)
    expect(useTaskStore.getState().tasks).toHaveLength(1)
  })
})
