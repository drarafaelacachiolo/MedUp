import { createClient } from '@/lib/supabase/server'
import CalendarClient from './CalendarClient'
import type { AtendimentoWithStatus } from '@/types/database'

export default async function CalendarView() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('atendimentos_view')
    .select('*')
    .eq('user_id', user?.id)
    .order('data_atendimento', { ascending: true })

  if (error) {
    return (
      <div className="p-6 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
        Erro ao carregar calendário. Tente recarregar a página.
      </div>
    )
  }

  return <CalendarClient atendimentos={(data ?? []) as AtendimentoWithStatus[]} />
}
