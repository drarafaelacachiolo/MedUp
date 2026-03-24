'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

type TabKey = 'hall' | 'novo' | 'dashboard' | 'calendario' | 'ajustes' | 'perfil'

const BOTTOM_NAV: { key: TabKey; label: string }[] = [
  { key: 'novo', label: 'Novo' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'calendario', label: 'Calendário' },
  { key: 'ajustes', label: 'Ajustes' },
  { key: 'perfil', label: 'Perfil' },
]

function NavIcon({ tab, active }: { tab: TabKey; active: boolean }) {
  const color = active ? '#1C4E80' : '#A8A09A'
  const sw = active ? 2.5 : 2

  if (tab === 'novo') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
  if (tab === 'dashboard') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
  if (tab === 'calendario') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
  if (tab === 'ajustes') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M21 12h-2M5 12H3M18.66 18.66l-1.41-1.41M6.34 6.34L4.93 4.93M12 5V3M12 21v-2"/>
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

interface NavigationProps {
  userName?: string
}

function NavigationInner({ userName }: NavigationProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = (searchParams.get('tab') ?? 'hall') as TabKey

  function navigate(tab: TabKey) {
    router.push(`/?tab=${tab}`)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sidebarItems: { key: TabKey; label: string }[] = [
    { key: 'novo', label: 'Novo Lançamento' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'calendario', label: 'Calendário' },
    { key: 'ajustes', label: 'Ajustes' },
  ]

  return (
    <>
      {/* ── Sidebar (desktop) ── */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0"
        style={{ width: '240px', height: '100vh', position: 'sticky', top: 0, backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E1DB' }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px' }}>
          <img src="/logo.png" alt="MedUp" style={{ width: '160px', height: 'auto' }} />
        </div>

        {/* Nav items */}
        <nav style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {sidebarItems.map(({ key, label }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => navigate(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '8px', width: '100%',
                  backgroundColor: isActive ? '#EEF4FB' : 'transparent',
                  color: isActive ? '#1C4E80' : '#7A756E',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', border: 'none', textAlign: 'left',
                  transition: 'background-color 0.15s',
                }}
              >
                <NavIcon tab={key} active={isActive} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Profile + Logout */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #E5E1DB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', minWidth: 0 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1C4E80', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontSize: '13px', 
                fontWeight: 600, 
                color: '#1A1816',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {userName ?? 'Usuário'}
              </p>
              <button
                onClick={() => navigate('perfil')}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#7A756E', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                Ver perfil
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#7A756E',
              cursor: 'pointer', background: 'none', border: 'none', padding: '2px 0',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      </aside>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
        style={{ height: '72px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E1DB', paddingBottom: '4px' }}
      >
        {BOTTOM_NAV.map(({ key, label }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                padding: '6px 12px', cursor: 'pointer', background: 'none', border: 'none',
              }}
            >
              <NavIcon tab={key} active={isActive} />
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#1C4E80' : '#A8A09A',
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

export default function Navigation({ userName }: NavigationProps) {
  return (
    <Suspense fallback={<div className="hidden md:block flex-shrink-0" style={{ width: '240px' }} />}>
      <NavigationInner userName={userName} />
    </Suspense>
  )
}
