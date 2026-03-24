'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const TITLES: Record<string, string> = {
  hall: 'Página Inicial',
  novo: 'Novo Lançamento',
  dashboard: 'Dashboard Financeiro',
  calendario: 'Agenda Médica',
  ajustes: 'Ajustes da Conta',
  perfil: 'Perfil do Usuário'
}

function HeaderContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'hall'
  const title = TITLES[tab] || 'MedUp'

  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A756E]">
      {title}
    </span>
  )
}

export default function DesktopHeader() {
  return (
    <header 
      className="hidden md:flex items-center px-8 border-b bg-white sticky top-0 z-20" 
      style={{ height: '56px', borderColor: '#E5E1DB' }}
    >
      <Suspense fallback={<div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div>}>
        <HeaderContent />
      </Suspense>
    </header>
  )
}
