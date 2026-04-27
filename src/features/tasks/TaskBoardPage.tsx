import { useEffect, useState } from 'react'
import { PageShell } from '@/components/ui/PageShell'
import { TaskColumn } from '@/features/tasks/TaskColumn'
import { TASK_BOARD_COLUMNS } from '@/features/tasks/taskBoard.constants'
import { selectIsLoaded, useTaskActions, useTaskStore } from '@/store/useTaskStore'

export function TaskBoardPage() {
  const isLoaded = useTaskStore(selectIsLoaded)
  const { loadInitialTasks } = useTaskActions()
  const [nowTs, setNowTs] = useState(() => Date.now())

  useEffect(() => {
    if (!isLoaded) {
      loadInitialTasks()
    }
  }, [isLoaded, loadInitialTasks])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowTs(Date.now()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <PageShell>
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-slate-900">
          Team Workflow Board
        </h1>
        <p className="mt-2 text-slate-600">
          Organize work by stage and keep updates visible across your team.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TASK_BOARD_COLUMNS.map((column) => (
          <TaskColumn
            key={column.key}
            status={column.key}
            title={column.title}
            description={column.description}
            nowTs={nowTs}
          />
        ))}
      </section>
    </PageShell>
  )
}
