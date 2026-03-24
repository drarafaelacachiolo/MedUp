import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import HallView from '@/components/HallView'
import NovoLancamentoForm from '@/components/novo-lancamento/NovoLancamentoForm'
import DashboardView from '@/components/dashboard/DashboardView'
import CalendarView from '@/components/calendar/CalendarView'
import AjustesView from '@/components/AjustesView'
import LogoutButton from './LogoutButton'

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-4 animate-pulse">
      <div className="h-6 rounded w-40" style={{ backgroundColor: 'hsl(var(--muted))' }} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted))' }} />
        ))}
      </div>
      <div className="h-64 rounded-xl" style={{ backgroundColor: 'hsl(var(--muted))' }} />
    </div>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; date?: string }> | { tab?: string; date?: string }
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams
  const tab  = params?.tab  ?? 'hall'
  const date = params?.date ?? undefined

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Busca o nome real no perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  const emailPrefix = user?.email?.split('@')[0] ?? ''
  const userName = profile?.full_name || (emailPrefix
    ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    : 'Usuário')

  return (
    <>
      {tab === 'hall' && <HallView userName={userName} />}

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

      {(tab === 'ajustes' || tab === 'perfil') && (
        <Suspense fallback={<LoadingSkeleton />}>
          <AjustesView />
        </Suspense>
      )}
    </>
  )
}
