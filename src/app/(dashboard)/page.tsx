import { Suspense } from 'react'
import TabShell from '@/components/TabShell'
import NovoLancamentoForm from '@/components/novo-lancamento/NovoLancamentoForm'
import DashboardView from '@/components/dashboard/DashboardView'
import CalendarView from '@/components/calendar/CalendarView'

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-4 animate-pulse">
      <div className="h-6 rounded w-40" style={{ backgroundColor: 'var(--ivory-dark)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl" style={{ backgroundColor: 'var(--ivory-dark)' }} />
        ))}
      </div>
      <div className="h-64 rounded-xl" style={{ backgroundColor: 'var(--ivory-dark)' }} />
    </div>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; date?: string }> | { tab?: string; date?: string }
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams
  const tab  = params?.tab  ?? 'novo'
  const date = params?.date ?? undefined

  return (
    <TabShell activeTab={tab}>
      {tab === 'novo' && <NovoLancamentoForm initialDate={date} />}

      {tab === 'dashboard' && (
        <Suspense fallback={<LoadingSkeleton />}>
          <DashboardView />
        </Suspense>
      )}

      {tab === 'calendario' && (
        <Suspense fallback={<LoadingSkeleton />}>
          <CalendarView />
        </Suspense>
      )}
    </TabShell>
  )
}
