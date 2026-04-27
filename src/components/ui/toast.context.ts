import * as React from 'react'
import type { ToastContextValue } from '@/components/ui/toast.types'

export const ToastContext = React.createContext<ToastContextValue | null>(null)
