'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
      style={{ color: 'hsl(var(--muted-foreground))' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'hsl(var(--muted))'
        e.currentTarget.style.color = 'hsl(var(--foreground))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = 'hsl(var(--muted-foreground))'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Sair
    </button>
  )
}
