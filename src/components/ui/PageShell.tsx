import type { PropsWithChildren } from 'react'

export function PageShell({ children }: PropsWithChildren) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col p-6 md:p-10">
      {children}
    </main>
  )
}
