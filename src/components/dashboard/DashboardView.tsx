import { createClient } from '@/lib/supabase/server'
import SummaryCards from './SummaryCards'
import DashboardClient from './DashboardClient'
import type { AtendimentoWithStatus } from '@/types/database'
import { currentMonthValue } from '@/lib/utils'

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
  const qtdPendente = pendentes.length

  const mesAtual = currentMonthValue()
  const recebidosMes = atendimentos.filter(
    (a) =>
      a.status === 'Recebido' &&
      a.data_recebimento?.slice(0, 7) === mesAtual
  )
  const totalRecebidoMes = recebidosMes.reduce((sum, a) => sum + (a.valor_recebido ?? 0), 0)

  // Nome curto do mês atual (ex: "março")
  const mesNome = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())

  return (
    <div className="p-4 sm:p-6">
      <h2 className="section-title mb-5">Dashboard</h2>

      <SummaryCards
        totalPendente={totalPendente}
        totalRecebidoMes={totalRecebidoMes}
        qtdPendente={qtdPendente}
        mesNome={mesNome}
      />

      <DashboardClient atendimentos={atendimentos} />
    </div>
  )
}
