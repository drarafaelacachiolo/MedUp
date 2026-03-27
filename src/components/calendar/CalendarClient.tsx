'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import EditModal from '@/components/dashboard/EditModal'
import DeleteModal from '@/components/dashboard/DeleteModal'
import ConfirmModal from '@/components/checklist/ConfirmModal'
import { formatCurrency, formatDate, daysOverdue, todayString } from '@/lib/utils'
import type {
  AtendimentoWithStatus,
  ConfirmReceiptInput,
  EditAtendimentoInput,
  StatusAtendimento,
} from '@/types/database'

type FilterMode = 'todos' | 'pendentes' | 'atrasados' | 'recebidos'

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getCalendarDays(yearMonth: string): (string | null)[] {
  const [year, month] = yearMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay  = new Date(year, month, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const cells: (string | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(`${yearMonth}-${String(d).padStart(2, '0')}`)
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function shiftMonth(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthTitle(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  const s = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
    .format(new Date(y, m - 1, 1))
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getItemStatus(item: AtendimentoWithStatus): 'recebido' | 'atrasado' | 'pendente' {
  if (item.status === 'Recebido') return 'recebido'
  if (daysOverdue(item.data_prevista_pagamento, item.status) > 0) return 'atrasado'
  return 'pendente'
}

function chipStyle(item: AtendimentoWithStatus): React.CSSProperties {
  const s = getItemStatus(item)
  if (s === 'recebido') return { backgroundColor: '#E0EDE2', color: '#3D5E3F' }
  if (s === 'atrasado') return { backgroundColor: '#F8E5EB', color: '#9B1D3E' }
  return { backgroundColor: '#FEE9CC', color: '#8A500A' }
}

function dotColor(item: AtendimentoWithStatus): string {
  const s = getItemStatus(item)
  if (s === 'recebido') return '#5A7B5C'
  if (s === 'atrasado') return '#9B2040'
  return '#d97706'
}

function leftBorderColor(item: AtendimentoWithStatus): string {
  const s = getItemStatus(item)
  if (s === 'recebido') return '#5A7B5C'
  if (s === 'atrasado') return '#9B2040'
  return '#d97706'
}

interface Props { atendimentos: AtendimentoWithStatus[] }

export default function CalendarClient({ atendimentos: initial }: Props) {
  const router = useRouter()
  const today = todayString()
  const currentYM = today.slice(0, 7)

  const [atendimentos, setAtendimentos] = useState<AtendimentoWithStatus[]>(initial)
  const [currentMonth, setCurrentMonth] = useState(currentYM)
  const [filterMode, setFilterMode] = useState<FilterMode>('todos')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<AtendimentoWithStatus | null>(null)
  const [confirmingItem, setConfirmingItem] = useState<AtendimentoWithStatus | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth])

  const filteredAtendimentos = useMemo(() => {
    return atendimentos.filter(item => {
      if (filterMode === 'todos') return true
      const s = getItemStatus(item)
      if (filterMode === 'recebidos') return s === 'recebido'
      if (filterMode === 'atrasados') return s === 'atrasado'
      if (filterMode === 'pendentes') return s === 'pendente'
      return true
    })
  }, [atendimentos, filterMode])

  // Plotado na data financeira relevante — sem duplicatas
  // Recebido → data_recebimento | Pendente/Atrasado → data_prevista_pagamento
  const eventsByDate = useMemo(() => {
    const map = new Map<string, AtendimentoWithStatus[]>()
    for (const a of filteredAtendimentos) {
      const date = a.status === 'Recebido' ? a.data_recebimento : a.data_prevista_pagamento
      if (!date) continue
      const list = map.get(date) ?? []
      list.push(a)
      map.set(date, list)
    }
    return map
  }, [filteredAtendimentos])

  const dayEvents = useMemo(
    () => (selectedDay ? (eventsByDate.get(selectedDay) ?? []) : []),
    [selectedDay, eventsByDate]
  )

  // Resumo do mês visível — baseado na data financeira relevante do mês
  const monthStats = useMemo(() => {
    const monthItems = atendimentos.filter(a => {
      const date = a.status === 'Recebido' ? a.data_recebimento : a.data_prevista_pagamento
      return date?.startsWith(currentMonth)
    })
    const aReceber = monthItems
      .filter(a => a.status !== 'Recebido')
      .reduce((sum, a) => sum + (a.valor_a_receber ?? 0), 0)
    const recebido = monthItems
      .filter(a => a.status === 'Recebido')
      .reduce((sum, a) => sum + (a.valor_recebido ?? 0), 0)
    const atrasados = monthItems.filter(a =>
      daysOverdue(a.data_prevista_pagamento, a.status) > 0
    ).length
    return { aReceber, recebido, atrasados, total: monthItems.length }
  }, [atendimentos, currentMonth])

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
    if (error) { setActionError('Erro ao confirmar. Tente novamente.'); setIsLoading(false); return }
    setAtendimentos((prev) =>
      prev.map((a) =>
        a.id === formData.id
          ? { ...a, status: 'Recebido' as StatusAtendimento, data_recebimento: formData.data_recebimento, valor_recebido: formData.valor_recebido, banco: formData.banco }
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
    if (error) { setActionError('Erro ao salvar. Tente novamente.'); setIsLoading(false); return }
    const newStatus: StatusAtendimento = data.data_recebimento ? 'Recebido' : 'Pendente'
    setAtendimentos((prev) => prev.map((a) => (a.id === id ? { ...a, ...data, status: newStatus } : a)))
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
    if (error) { setActionError('Erro ao excluir. Tente novamente.'); setDeletingId(null); return }
    setAtendimentos((prev) => prev.filter((a) => a.id !== deletingId))
    if (selectedDay && eventsByDate.get(selectedDay)?.length === 1) setSelectedDay(null)
    setDeletingId(null)
  }

  const FILTERS: { key: FilterMode; label: string }[] = [
    { key: 'todos',      label: 'Todos' },
    { key: 'pendentes',  label: 'Pendentes' },
    { key: 'atrasados',  label: 'Atrasados' },
    { key: 'recebidos',  label: 'Recebidos' },
  ]

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '20px 20px 32px' }}>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setCurrentMonth((m) => shiftMonth(m, -1)); setSelectedDay(null) }}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ border: '1px solid #E5E1DB', color: '#7A756E', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'hsl(var(--muted))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', fontWeight: 600, color: '#1A1816', minWidth: '160px', textAlign: 'center' }}>
            {monthTitle(currentMonth)}
          </h2>

          <button
            onClick={() => { setCurrentMonth((m) => shiftMonth(m, 1)); setSelectedDay(null) }}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ border: '1px solid #E5E1DB', color: '#7A756E', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'hsl(var(--muted))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          {currentMonth !== currentYM && (
            <button
              onClick={() => { setCurrentMonth(currentYM); setSelectedDay(null) }}
              className="text-xs px-2.5 py-1 rounded-md transition-colors"
              style={{ color: '#1C4E80', border: '1px solid #E5E1DB', backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EEF4FB' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Hoje
            </button>
          )}
        </div>

        {/* Filtros de status */}
        <div className="flex rounded-lg overflow-hidden self-start sm:self-auto" style={{ border: '1px solid #E5E1DB' }}>
          {FILTERS.map(({ key, label }) => {
            const active = filterMode === key
            return (
              <button
                key={key}
                onClick={() => { setFilterMode(key); setSelectedDay(null) }}
                className="px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: active ? '#1C4E80' : 'transparent',
                  color: active ? '#FFFFFF' : '#7A756E',
                  borderRight: key !== 'recebidos' ? '1px solid #E5E1DB' : 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Resumo mensal */}
      {monthStats.total > 0 && (
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'hsl(var(--muted))', border: '1px solid #E5E1DB' }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#7A756E' }}>
            {currentMonth === currentYM ? 'Este mês' : monthTitle(currentMonth).split(' de')[0]}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1A1816' }}>
            <span style={{ color: '#7A756E', fontSize: '11px' }}>A receber </span>
            <strong style={{ color: '#8A500A' }}>{formatCurrency(monthStats.aReceber)}</strong>
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1A1816' }}>
            <span style={{ color: '#7A756E', fontSize: '11px' }}>Recebido </span>
            <strong style={{ color: '#3D5E3F' }}>{formatCurrency(monthStats.recebido)}</strong>
          </span>
          {monthStats.atrasados > 0 && (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
              <strong style={{ color: '#9B1D3E' }}>{monthStats.atrasados}</strong>
              <span style={{ color: '#7A756E', fontSize: '11px' }}> atrasado{monthStats.atrasados !== 1 ? 's' : ''}</span>
            </span>
          )}
        </div>
      )}

      {actionError && (
        <p className="mb-3 text-sm rounded-lg px-3 py-2" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
          {actionError}
        </p>
      )}

      {/* Grade do calendário */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid #E5E1DB', backgroundColor: '#FFFFFF' }}
      >
        {/* Header dos dias da semana */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #E5E1DB', backgroundColor: 'hsl(var(--muted))' }}>
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold uppercase tracking-wide"
              style={{ fontFamily: 'Inter, sans-serif', color: '#A8A09A', letterSpacing: '0.07em', fontSize: '10px' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Células */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, i) => {
            const events    = date ? (eventsByDate.get(date) ?? []) : []
            const isToday   = date === today
            const isSelected = date === selectedDay
            const isLastCol = (i + 1) % 7 === 0
            const isLastRow = i >= calendarDays.length - 7
            const dayNum    = date ? parseInt(date.split('-')[2]) : null
            const isEmpty   = !date

            return (
              <div
                key={i}
                onClick={() => date && setSelectedDay(isSelected ? null : date)}
                className="relative transition-colors"
                style={{
                  minHeight: '80px',
                  padding: '6px 5px 5px',
                  borderRight:  isLastCol ? 'none' : '1px solid #E5E1DB',
                  borderBottom: isLastRow ? 'none' : '1px solid #E5E1DB',
                  backgroundColor: isEmpty
                    ? 'hsl(var(--muted))'
                    : isSelected
                    ? '#EEF4FB'
                    : isToday
                    ? '#F5F8FC'
                    : 'transparent',
                  cursor: date ? 'pointer' : 'default',
                }}
                onMouseEnter={(e) => {
                  if (date && !isSelected) e.currentTarget.style.backgroundColor = '#F7FAFD'
                }}
                onMouseLeave={(e) => {
                  if (date && !isSelected) e.currentTarget.style.backgroundColor = isToday ? '#F5F8FC' : 'transparent'
                }}
              >
                {/* Número do dia */}
                <div className="flex justify-end mb-1">
                  <span
                    className="w-5 h-5 flex items-center justify-center rounded-full text-xs"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: isToday ? 700 : 400,
                      fontSize: '11px',
                      backgroundColor: isToday ? '#1C4E80' : 'transparent',
                      color: isToday
                        ? '#FFFFFF'
                        : date
                        ? '#1A1816'
                        : '#C0B8B0',
                    }}
                  >
                    {dayNum}
                  </span>
                </div>

                {/* Chips desktop */}
                <div className="hidden sm:block space-y-0.5">
                  {events.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-xs rounded px-1 py-0.5 truncate leading-snug"
                      style={{ ...chipStyle(ev), fontFamily: 'Inter, sans-serif', fontSize: '10px' }}
                      title={`${ev.tipo} · ${ev.paciente ?? ev.local} · ${formatCurrency(ev.valor_a_receber)}`}
                    >
                      {ev.tipo === 'Plantão' ? '⬤ ' : '◆ '}
                      {ev.paciente ?? ev.local}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs pl-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#A8A09A' }}>
                      +{events.length - 2}
                    </div>
                  )}
                </div>

                {/* Dots mobile */}
                {events.length > 0 && (
                  <div className="sm:hidden flex flex-wrap gap-0.5 mt-0.5">
                    {events.slice(0, 3).map((ev, j) => (
                      <div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: dotColor(ev) }}
                      />
                    ))}
                    {events.length > 3 && (
                      <span style={{ color: '#A8A09A', fontSize: '9px', lineHeight: 1 }}>
                        +{events.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Painel de detalhe do dia */}
      {selectedDay && (
        <div
          className="mt-4 rounded-xl overflow-hidden"
          style={{ border: '1px solid #E5E1DB', backgroundColor: '#FFFFFF' }}
        >
          <div
            className="flex items-center justify-between px-4 sm:px-5 py-3"
            style={{ borderBottom: '1px solid #E5E1DB', backgroundColor: 'hsl(var(--muted))' }}
          >
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#1A1816' }}>
              {formatDate(selectedDay)}
              {dayEvents.length > 0 && (
                <span style={{ marginLeft: '8px', fontWeight: 400, fontSize: '13px', color: '#7A756E' }}>
                  {dayEvents.length} registro{dayEvents.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/?tab=novo&date=${selectedDay}`)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#1C4E80', color: '#FFFFFF', fontSize: '12px' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Novo neste dia
              </button>
              <button
                onClick={() => setSelectedDay(null)}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                style={{ color: '#A8A09A' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E1DB' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2" style={{ color: '#C0B8B0' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#A8A09A' }}>
                  {filterMode === 'recebidos'
                    ? 'Nenhum recebimento neste dia'
                    : filterMode === 'atrasados'
                    ? 'Nenhum atrasado neste dia'
                    : filterMode === 'pendentes'
                    ? 'Nenhum pendente neste dia'
                    : 'Nenhum atendimento neste dia'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((ev) => {
                  const late = daysOverdue(ev.data_prevista_pagamento, ev.status)
                  const borderColor = leftBorderColor(ev)

                  return (
                    <div
                      key={ev.id}
                      className="rounded-xl p-3 sm:p-4"
                      style={{
                        border: '1px solid #E5E1DB',
                        borderLeft: `3px solid ${borderColor}`,
                        backgroundColor: '#FAFAFA',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {ev.paciente ? (
                            <>
                              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1A1816' }} className="truncate">{ev.paciente}</p>
                              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#7A756E' }} className="truncate">{ev.local}</p>
                            </>
                          ) : (
                            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#1A1816' }} className="truncate">{ev.local}</p>
                          )}
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#A8A09A', marginTop: '2px' }}>
                            {ev.tipo} · {ev.tempo} · trabalhado em {formatDate(ev.data_atendimento)}
                          </p>
                          {ev.observacoes && (
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#C0B8B0', fontStyle: 'italic', marginTop: '4px' }}>{ev.observacoes}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#8A500A' }} className="tabular-nums">
                            {formatCurrency(ev.valor_a_receber)}
                          </p>
                          {ev.status === 'Pendente' ? (
                            late > 0
                              ? <span className="badge-overdue">{late}d atraso</span>
                              : <span className="badge-pending">Pendente</span>
                          ) : (
                            <span className="badge-received">Recebido</span>
                          )}
                        </div>
                      </div>

                      {ev.status === 'Recebido' && (
                        <div
                          className="flex flex-wrap items-center gap-3 mt-2 pt-2 text-xs"
                          style={{ borderTop: '1px solid #E5E1DB', fontFamily: 'Inter, sans-serif', color: '#7A756E' }}
                        >
                          <span>Recebido: <strong style={{ color: '#3D5E3F' }}>{formatCurrency(ev.valor_recebido)}</strong></span>
                          <span>em {formatDate(ev.data_recebimento)}</span>
                          {ev.banco && <span>· {ev.banco}</span>}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        {ev.status === 'Pendente' && (
                          <button
                            onClick={() => setConfirmingItem(ev)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                            style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#E0EDE2', color: '#2F5E34', fontSize: '11px' }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Confirmar
                          </button>
                        )}
                        <button
                          onClick={() => setEditingItem(ev)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                          style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'hsl(var(--muted))', color: '#7A756E', border: '1px solid #E5E1DB', fontSize: '11px' }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => setDeletingId(ev.id)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                          style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8E5EB', color: '#9B1D3E', fontSize: '11px' }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          </svg>
                          Excluir
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
