import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import HallView from '@/components/HallView'
import NovoLancamentoForm from '@/components/novo-lancamento/NovoLancamentoForm'
import DashboardView from '@/components/dashboard/DashboardView'
import CalendarView from '@/components/calendar/CalendarView'
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
  const emailPrefix = user?.email?.split('@')[0] ?? ''
  const userName = emailPrefix
    ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    : 'Usuário'

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
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#1C4E80] flex items-center justify-center mb-4 shadow-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#1A1816' }}>{userName}</h2>
          <p className="text-sm mb-8" style={{ color: '#7A756E' }}>Acesse suas configurações e conta</p>

          <div className="w-full max-w-sm space-y-3">
            <div className="p-4 rounded-xl border flex items-center justify-between" style={{ borderColor: '#E5E1DB', backgroundColor: '#FFFFFF' }}>
              <span className="text-sm font-medium">Sair da conta</span>
              <LogoutButton />
            </div>
          </div>

          <p className="text-xs mt-10" style={{ color: 'hsl(var(--muted-foreground))' }}>
            MedUp v1.0.0
          </p>
        </div>
      )}
    </>
  )
}
