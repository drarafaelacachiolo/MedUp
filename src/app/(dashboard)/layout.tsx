import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Segunda camada de proteção (além do middleware)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-base)' }}>
      {/* Header */}
      <header
        className="h-14 flex items-center justify-between px-4 sm:px-6 shrink-0"
        style={{ backgroundColor: 'var(--surface-card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: 'var(--wine)', color: '#fff' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span
            className="text-xl font-semibold tracking-tight"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
              color: 'var(--wine)',
              letterSpacing: '-0.01em',
            }}
          >
            Rafa Finance
          </span>
        </div>

        <LogoutButton />
      </header>

      {/* Conteúdo + tabs (gerenciado pelo TabShell no page.tsx) */}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  )
}
