'use client'

import { useRouter } from 'next/navigation'

const OPTIONS = [
  {
    key: 'novo',
    title: 'Novo Lançamento',
    description: 'Registre um plantão ou consulta',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    color: '#1C4E80',
    bg: '#EEF4FB',
  },
  {
    key: 'dashboard',
    title: 'Dashboard',
    description: 'Recebimentos, pendências e histórico',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    color: '#1C4E80',
    bg: '#EEF4FB',
  },
  {
    key: 'calendario',
    title: 'Calendário',
    description: 'Visualize seus atendimentos no mês',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    color: '#1C4E80',
    bg: '#EEF4FB',
  },
]

export default function HallView() {
  const router = useRouter()

  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="p-4 sm:p-8 max-w-xl mx-auto">
      <p className="text-xs mb-6 capitalize" style={{ color: '#7A756E' }}>{today}</p>

      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1A1816', letterSpacing: '-0.4px' }}>
        Olá, Rafaela
      </h1>
      <p className="text-sm mb-8" style={{ color: '#7A756E' }}>O que você quer fazer hoje?</p>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => router.push(`/?tab=${opt.key}`)}
            className="rounded-xl p-4 text-left transition-all"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E1DB',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1C4E80'; e.currentTarget.style.backgroundColor = '#EEF4FB' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E1DB'; e.currentTarget.style.backgroundColor = '#FFFFFF' }}
          >
            <span
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', borderRadius: '10px',
                backgroundColor: opt.bg, color: opt.color, flexShrink: 0,
              }}
            >
              {opt.icon}
            </span>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1A1816' }}>
                {opt.title}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#7A756E', marginTop: '1px' }}>
                {opt.description}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5BEBC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
