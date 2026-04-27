import { AppRouterProvider } from '@/app/router'
import { ToastProvider } from '@/components/ui/Toast'

export function App() {
  return (
    <ToastProvider>
      <AppRouterProvider />
    </ToastProvider>
  )
}
