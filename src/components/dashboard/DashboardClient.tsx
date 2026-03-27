'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FilterBar from './FilterBar'
import type { FilterStatus, FilterTipo } from './FilterBar'
import AtendimentosTable from './AtendimentosTable'
import EditModal from './EditModal'
import DeleteModal from './DeleteModal'
import ConfirmModal from '@/components/checklist/ConfirmModal'
import type {
  AtendimentoWithStatus,
  StatusAtendimento,
  TipoAtendimento,
  ConfirmReceiptInput,
  EditAtendimentoInput,
} from '@/types/database'
import { currentMonthValue, formatCurrency, formatDate, daysOverdue } from '@/lib/utils'

interface DashboardClientProps {
  atendimentos: AtendimentoWithStatus[]
}

export default function DashboardClient({ atendimentos: initialAtendimentos }: DashboardClientProps) {
  const router = useRouter()
  const [atendimentos, setAtendimentos] = useState<AtendimentoWithStatus[]>(initialAtendimentos)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('Todos')
  const [monthFilter, setMonthFilter] = useState<string>(currentMonthValue())
  const [tipoFilter, setTipoFilter] = useState<FilterTipo>('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [bancoFilter, setBancoFilter] = useState('')

  const [editingItem, setEditingItem] = useState<AtendimentoWithStatus | null>(null)
  const [confirmingItem, setConfirmingItem] = useState<AtendimentoWithStatus | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  // Opções dinâmicas derivadas dos dados
  const tipoOptions = useMemo(() => {
    return [...new Set(atendimentos.map((a) => a.tipo))].sort() as TipoAtendimento[]
  }, [atendimentos])

  const statusOptions = useMemo(() => {
    const opts = new Set<string>()
    for (const a of atendimentos) {
      if (a.status === 'Recebido') opts.add('Recebido')
      else if (daysOverdue(a.data_prevista_pagamento, a.status) > 0) opts.add('Atrasado')
      else opts.add('Pendente')
    }
    return (['Pendente', 'Atrasado', 'Recebido'] as const).filter((o) => opts.has(o))
  }, [atendimentos])

  const bancoOptions = useMemo(() => {
    const banks = atendimentos
      .map((a) => a.banco)
      .filter((b): b is string => !!b && b.trim() !== '')
    return [...new Set(banks)].sort()
  }, [atendimentos])

  const monthOptions = useMemo(() => {
    const months = atendimentos
      .map((a) => a.data_atendimento.slice(0, 7))
      .filter(Boolean)
    return [...new Set(months)].sort().reverse()
  }, [atendimentos])

  const filtered = atendimentos.filter((a) => {
    if (tipoFilter !== 'Todos' && a.tipo !== tipoFilter) return false

    if (statusFilter !== 'Todos') {
      if (statusFilter === 'Recebido') {
        if (a.status !== 'Recebido') return false
      } else if (statusFilter === 'Atrasado') {
        if (a.status === 'Recebido' || daysOverdue(a.data_prevista_pagamento, a.status) <= 0) return false
      } else if (statusFilter === 'Pendente') {
        if (a.status === 'Recebido' || daysOverdue(a.data_prevista_pagamento, a.status) > 0) return false
      }
    }

    if (monthFilter) {
      const mes = a.data_atendimento.slice(0, 7)
      if (mes !== monthFilter) return false
    }
    if (bancoFilter && a.banco !== bancoFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const normalize = (s?: string | null) =>
        (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const haystack = [
        normalize(a.paciente),
        normalize(a.local),
        normalize(a.tipo),
        normalize(a.banco),
        normalize(a.observacoes),
        normalize(formatDate(a.data_atendimento)),
        normalize(formatDate(a.data_prevista_pagamento)),
        a.data_recebimento ? normalize(formatDate(a.data_recebimento)) : '',
        normalize(formatCurrency(a.valor_a_receber)),
        a.valor_recebido != null ? normalize(formatCurrency(a.valor_recebido)) : '',
      ].join(' ')
      if (!haystack.includes(q)) return false
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

  async function handleDelete() {
    if (!deletingId) return
    setActionError('')
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('atendimentos').delete().eq('id', deletingId)
    setIsLoading(false)

    if (error) {
      setActionError('Erro ao excluir registro. Tente novamente.')
      setDeletingId(null)
      return
    }

    setAtendimentos((prev) => prev.filter((a) => a.id !== deletingId))
    setDeletingId(null)
  }

  return (
    <div>
      {/* Botão Novo Registro */}
      <div className="flex justify-end mb-4">
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
        tipo={tipoFilter}
        status={statusFilter}
        month={monthFilter}
        search={searchQuery}
        banco={bancoFilter}
        tipoOptions={tipoOptions}
        statusOptions={statusOptions}
        monthOptions={monthOptions}
        bancoOptions={bancoOptions}
        onTipoChange={setTipoFilter}
        onStatusChange={setStatusFilter}
        onMonthChange={setMonthFilter}
        onSearchChange={setSearchQuery}
        onBancoChange={setBancoFilter}
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
        onDelete={setDeletingId}
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

      {deletingId && (
        <DeleteModal
          onConfirm={handleDelete}
          onClose={() => setDeletingId(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
