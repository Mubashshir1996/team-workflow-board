import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { ToastProvider } from '@/components/ui'
import { TASKS_STORAGE_KEY } from '@/features/tasks/taskStorage'
import { TaskBoardPage } from '@/features/tasks/TaskBoardPage'
import { useTaskStore } from '@/store/useTaskStore'

type CreateTaskOptions = {
  title: string
  description?: string
  assignee?: string
  priority?: 'low' | 'medium' | 'high'
  status?: 'todo' | 'in_progress' | 'done'
  tags?: string
}

function renderTaskBoard() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <TaskBoardPage />,
      },
    ],
    {
      initialEntries: ['/'],
    },
  )

  return render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  )
}

async function findDialog() {
  await waitFor(() => {
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
  })

  return document.body.querySelector('[role="dialog"]') as HTMLElement
}

async function createTask(user: ReturnType<typeof userEvent.setup>, options: CreateTaskOptions) {
  await user.click(screen.getByRole('button', { name: /new task/i }))

  const dialog = await findDialog()
  await user.type(within(dialog).getByLabelText(/title/i), options.title)
  await user.type(
    within(dialog).getByLabelText(/description/i),
    options.description ?? `Plan work for ${options.title}`,
  )
  await user.type(
    within(dialog).getByLabelText(/assignee/i),
    options.assignee ?? 'Jordan Lee',
  )

  if (options.status) {
    await user.selectOptions(within(dialog).getByLabelText(/status/i), options.status)
  }

  if (options.priority) {
    await user.selectOptions(within(dialog).getByLabelText(/priority/i), options.priority)
  }

  if (options.tags) {
    await user.type(within(dialog).getByLabelText(/tags/i), options.tags)
  }

  await user.click(
    within(dialog).getByRole('button', { name: /create task/i, hidden: true }),
  )

  await waitFor(() => {
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })
}

describe('TaskBoardPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useTaskStore.setState({
      tasks: [],
      isLoaded: false,
      migrationStatus: null,
      migratedFromVersion: null,
      storageStatus: 'available',
    })
  })

  it('creates a task and shows it in the backlog board column', async () => {
    const user = userEvent.setup()

    renderTaskBoard()

    await createTask(user, {
      title: 'Prepare release checklist',
      description: 'List the final QA and rollout steps',
      assignee: 'Avery',
      priority: 'high',
      tags: 'release, qa',
    })

    const backlogColumn = screen.getByRole('region', { name: /backlog/i })
    expect(
      within(backlogColumn).getByRole('heading', { name: /prepare release checklist/i }),
    ).toBeInTheDocument()
    expect(within(backlogColumn).getByText(/avery/i)).toBeInTheDocument()
  })

  it('filters tasks by priority using the board controls', async () => {
    const user = userEvent.setup()

    renderTaskBoard()

    await createTask(user, {
      title: 'Fix production alert',
      priority: 'high',
      assignee: 'Kai',
    })
    await createTask(user, {
      title: 'Refine onboarding copy',
      priority: 'low',
      assignee: 'Mina',
    })

    await user.selectOptions(screen.getByLabelText(/priority/i), 'high')

    expect(
      screen.getByRole('heading', { name: /fix production alert/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /refine onboarding copy/i }),
    ).not.toBeInTheDocument()
  })

  it('moves a task to done by editing its status', async () => {
    const user = userEvent.setup()

    renderTaskBoard()

    await createTask(user, {
      title: 'Ship analytics dashboard',
      status: 'in_progress',
      priority: 'medium',
      assignee: 'Nora',
    })

    const inProgressColumn = screen.getByRole('region', { name: /in progress/i })
    await user.click(
      within(inProgressColumn).getByText(/edit/i, { selector: 'button' }),
    )

    const dialog = await findDialog()
    await user.selectOptions(within(dialog).getByLabelText(/status/i), 'done')
    await user.click(
      within(dialog).getByRole('button', { name: /save changes/i, hidden: true }),
    )

    await waitFor(() => {
      const doneColumn = screen.getByRole('region', { name: /done/i })
      expect(
        within(doneColumn).getByRole('heading', { name: /ship analytics dashboard/i }),
      ).toBeInTheDocument()
    })

    expect(window.localStorage.getItem(TASKS_STORAGE_KEY)).toContain('done')
  })
})
