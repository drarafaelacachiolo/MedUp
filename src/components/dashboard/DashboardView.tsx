import { createClient } from '@/lib/supabase/server'
import SummaryCards from './SummaryCards'
import DashboardClient from './DashboardClient'
import type { AtendimentoWithStatus } from '@/types/database'
import { currentMonthValue, daysOverdue } from '@/lib/utils'

export default async function DashboardView() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('atendimentos_view')
    .select('*')
    .order('data_atendimento', { ascending: false })

  if (error) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
      >
        Erro ao carregar dados. Tente recarregar a página.
      </div>
    )
  }

  const atendimentos = (data ?? []) as AtendimentoWithStatus[]

  // Calcular resumos no servidor
  const pendentes = atendimentos.filter((a) => a.status === 'Pendente')
  const totalPendente = pendentes.reduce((sum, a) => sum + (a.valor_a_receber ?? 0), 0)
  const qtdAtrasados = pendentes.filter((a) => daysOverdue(a.data_prevista_pagamento, a.status) > 0).length

  const mesAtual = currentMonthValue()
  const recebidosMes = atendimentos.filter(
    (a) =>
      a.status === 'Recebido' &&
      a.data_recebimento?.slice(0, 7) === mesAtual
  )
  const totalRecebidoMes = recebidosMes.reduce((sum, a) => sum + (a.valor_recebido ?? 0), 0)

  const mesNome = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())

  return (
    <div className="p-4 sm:p-6">
      <SummaryCards
        totalPendente={totalPendente}
        totalRecebidoMes={totalRecebidoMes}
        qtdAtrasados={qtdAtrasados}
        mesNome={mesNome}
      />

      <DashboardClient atendimentos={atendimentos} />
    </div>
  )
}
