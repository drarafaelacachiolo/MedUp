import { createClient } from '@/lib/supabase/server'
import ChecklistClient from './ChecklistClient'
import type { AtendimentoWithStatus } from '@/types/database'

export default async function ChecklistView() {
  const supabase = await createClient()

  const [pendentesRes, recebidosRes] = await Promise.all([
    supabase
      .from('atendimentos_view')
      .select('*')
      .eq('status', 'Pendente')
      .order('data_prevista_pagamento', { ascending: true }),
    supabase
      .from('atendimentos_view')
      .select('*')
      .eq('status', 'Recebido')
      .order('data_recebimento', { ascending: false }),
  ])

  if (pendentesRes.error || recebidosRes.error) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
      >
        Erro ao carregar checklist. Tente recarregar a página.
      </div>
    )
  }

  const pendentes = (pendentesRes.data ?? []) as AtendimentoWithStatus[]
  const recebidos = (recebidosRes.data ?? []) as AtendimentoWithStatus[]

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
          Checklist de Recebimentos
        </h2>
        {pendentes.length > 0 && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: '#fef3c7', color: '#b45309' }}
          >
            {pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <p className="text-sm mb-5" style={{ color: 'var(--ink-light)' }}>
        Toque em um item para confirmar o recebimento.
      </p>

      <ChecklistClient initialPendentes={pendentes} initialRecebidos={recebidos} />
    </div>
  )
}
