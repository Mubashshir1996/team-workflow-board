import { PageShell } from '@/components/ui/PageShell'

export function TaskBoardPage() {
  return (
    <PageShell>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="m-0 text-2xl font-semibold tracking-tight">
          Team Workflow Board
        </h1>
        <p className="mt-2 text-slate-600">
          Foundation setup complete. Feature implementation starts next.
        </p>
      </section>
    </PageShell>
  )
}
