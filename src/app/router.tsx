import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { TaskBoardPage } from '@/features/tasks/TaskBoardPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <TaskBoardPage />,
  },
])

export function AppRouterProvider() {
  return <RouterProvider router={router} />
}
