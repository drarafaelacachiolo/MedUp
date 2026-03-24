'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const TABS = [
  { key: 'novo',       label: 'Novo Lançamento', shortLabel: 'Lançar' },
  { key: 'dashboard',  label: 'Dashboard',        shortLabel: 'Dashboard' },
  { key: 'calendario', label: 'Calendário',        shortLabel: 'Agenda' },
] as const

type TabKey = typeof TABS[number]['key']

function TabBarInner({ activeTab }: { activeTab: string }) {
  const router = useRouter()

  function navigate(tab: TabKey) {
    router.push(`/?tab=${tab}`)
  }

  return (
    <nav
      className="flex border-b sticky top-0 z-10 bg-white"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.key)}
            className="flex-1 py-3 px-2 text-sm font-medium transition-colors relative"
            style={{
              color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            }}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>

            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}

export default function TabShell({
  activeTab,
  children,
}: {
  activeTab: string
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={<div className="h-12 border-b" style={{ borderColor: 'hsl(var(--border))' }} />}>
        <TabBarInner activeTab={activeTab} />
      </Suspense>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </>
  )
}
