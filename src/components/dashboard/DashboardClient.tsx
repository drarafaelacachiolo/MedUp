'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FilterBar from './FilterBar'
import AtendimentosTable from './AtendimentosTable'
import EditModal from './EditModal'
import ConfirmModal from '@/components/checklist/ConfirmModal'
import type {
  AtendimentoWithStatus,
  StatusAtendimento,
  TipoAtendimento,
  ConfirmReceiptInput,
  EditAtendimentoInput,
} from '@/types/database'
import { currentMonthValue } from '@/lib/utils'

type FilterStatus = 'Todos' | StatusAtendimento
type FilterTipo = 'Todos' | TipoAtendimento

interface DashboardClientProps {
  atendimentos: AtendimentoWithStatus[]
}

const TIPO_TABS: { key: FilterTipo; label: string }[] = [
  { key: 'Todos',    label: 'Todos' },
  { key: 'Plantão',  label: 'Plantões' },
  { key: 'Consulta', label: 'Consultas' },
]

export default function DashboardClient({ atendimentos: initialAtendimentos }: DashboardClientProps) {
  const router = useRouter()
  const [atendimentos, setAtendimentos] = useState<AtendimentoWithStatus[]>(initialAtendimentos)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('Todos')
  const [monthFilter, setMonthFilter] = useState<string>(currentMonthValue())
  const [tipoFilter, setTipoFilter] = useState<FilterTipo>('Todos')
  const [editingItem, setEditingItem] = useState<AtendimentoWithStatus | null>(null)
  const [confirmingItem, setConfirmingItem] = useState<AtendimentoWithStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const filtered = atendimentos.filter((a) => {
    if (statusFilter !== 'Todos' && a.status !== statusFilter) return false
    if (tipoFilter !== 'Todos' && a.tipo !== tipoFilter) return false
    if (monthFilter) {
      const mes = a.data_atendimento.slice(0, 7)
      if (mes !== monthFilter) return false
    }
    return true
  })

  async function handleConfirm(formData: ConfirmReceiptInput) {
    setIsLoading(true)
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('atendimentos')
      .update({
        data_recebimento: formData.data_recebimento,
        valor_recebido:   formData.valor_recebido,
        banco:            formData.banco,
      })
      .eq('id', formData.id)

    if (error) {
      setActionError('Erro ao confirmar recebimento. Tente novamente.')
      setIsLoading(false)
      return
    }

    setAtendimentos((prev) =>
      prev.map((a) =>
        a.id === formData.id
          ? {
              ...a,
              status: 'Recebido' as StatusAtendimento,
              data_recebimento: formData.data_recebimento,
              valor_recebido: formData.valor_recebido,
              banco: formData.banco,
            }
          : a
      )
    )
    setConfirmingItem(null)
    setIsLoading(false)
  }

  async function handleEditSave(id: string, data: EditAtendimentoInput) {
    setIsLoading(true)
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('atendimentos').update(data).eq('id', id)

    if (error) {
      setActionError('Erro ao salvar alterações. Tente novamente.')
      setIsLoading(false)
      return
    }

    const newStatus: StatusAtendimento = data.data_recebimento ? 'Recebido' : 'Pendente'
    setAtendimentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data, status: newStatus } : a))
    )
    setEditingItem(null)
    setIsLoading(false)
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.')) return

    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('atendimentos').delete().eq('id', id)

    if (error) {
      setActionError('Erro ao excluir registro. Tente novamente.')
      return
    }

    setAtendimentos((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div>
      {/* Barra superior: abas de tipo + botão Novo Registro */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid hsl(var(--border))' }}
        >
          {TIPO_TABS.map((tab) => {
            const isActive = tipoFilter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setTipoFilter(tab.key)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? 'hsl(var(--primary))' : 'transparent',
                  color: isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground) / 0.65)',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => router.push('/?tab=novo')}
          className="btn-primary"
          style={{ minHeight: '38px', fontSize: '14px', paddingLeft: '16px', paddingRight: '16px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Registro
        </button>
      </div>

      <FilterBar
        status={statusFilter}
        month={monthFilter}
        onStatusChange={setStatusFilter}
        onMonthChange={setMonthFilter}
      />

      <p className="text-xs mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {actionError && (
        <p className="mb-3 text-sm rounded-lg px-3 py-2" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
          {actionError}
        </p>
      )}

      <AtendimentosTable
        atendimentos={filtered}
        onEdit={setEditingItem}
        onDelete={handleDelete}
        onConfirmPayment={setConfirmingItem}
      />

      {editingItem && (
        <EditModal
          item={editingItem}
          onSave={handleEditSave}
          onClose={() => setEditingItem(null)}
          isLoading={isLoading}
        />
      )}

      {confirmingItem && (
        <ConfirmModal
          item={confirmingItem}
          onConfirm={handleConfirm}
          onClose={() => setConfirmingItem(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
