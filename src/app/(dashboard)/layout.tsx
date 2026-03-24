import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/Navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca o nome real no perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  const emailPrefix = user.email?.split('@')[0] ?? ''
  const userName = profile?.full_name || (emailPrefix
    ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    : 'Usuário')

  return (
    <div className="flex" style={{ minHeight: '100svh' }}>
      {/* Sidebar (desktop) — renderizada pelo Navigation */}
      <Navigation userName={userName} />

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0" style={{ minHeight: '100svh' }}>
        {/* Header mobile */}
        <header
          className="md:hidden flex items-center justify-between px-4 flex-shrink-0"
          style={{ height: '56px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E1DB' }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 700, color: '#1C4E80', letterSpacing: '-0.3px' }}>
            MedUp
          </span>
          <a
            href="/?tab=perfil"
            style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#1C4E80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </a>
        </header>

        {/* Conteúdo */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: '72px' }}
        >
          <style>{`@media (min-width: 768px) { main { padding-bottom: 0 !important; } }`}</style>
          {children}
        </main>
      </div>
    </div>
  )
}
