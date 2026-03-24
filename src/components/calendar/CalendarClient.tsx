'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import EditModal from '@/components/dashboard/EditModal'
import ConfirmModal from '@/components/checklist/ConfirmModal'
import { formatCurrency, formatDate, daysOverdue, todayString } from '@/lib/utils'
import type {
  AtendimentoWithStatus,
  ConfirmReceiptInput,
  EditAtendimentoInput,
  StatusAtendimento,
} from '@/types/database'

type ViewMode = 'trabalho' | 'recebimentos' | 'previsao'

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

function getEventDate(item: AtendimentoWithStatus, mode: ViewMode): string | null {
  if (mode === 'trabalho') return item.data_atendimento
  if (mode === 'recebimentos') return item.data_recebimento
  return item.data_prevista_pagamento
}

function chipStyle(item: AtendimentoWithStatus, mode: ViewMode): React.CSSProperties {
  if (mode === 'trabalho') {
    return item.tipo === 'Plantão'
      ? { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
      : { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }
  }
  if (mode === 'recebimentos') {
    return { backgroundColor: '#D1EDD4', color: '#2F5E34' }
  }
  const late = daysOverdue(item.data_prevista_pagamento, item.status)
  return late > 0
    ? { backgroundColor: '#F5D7DF', color: '#7A1E35' }
    : { backgroundColor: '#FEF3C7', color: '#78350F' }
}

function chipLabel(item: AtendimentoWithStatus, mode: ViewMode): string {
  if (mode === 'trabalho') return item.paciente ?? item.local
  if (mode === 'recebimentos') return formatCurrency(item.valor_recebido)
  const late = daysOverdue(item.data_prevista_pagamento, item.status)
  const v = formatCurrency(item.valor_a_receber)
  return late > 0 ? `${v} · ${late}d` : v
}

function dotColor(item: AtendimentoWithStatus, mode: ViewMode): string {
  if (mode === 'trabalho') return item.tipo === 'Plantão' ? 'hsl(var(--primary))' : 'hsl(var(--ring))'
  if (mode === 'recebimentos') return '#5A7B5C'
  return daysOverdue(item.data_prevista_pagamento, item.status) > 0 ? '#9B2040' : '#d97706'
}

interface Props { atendimentos: AtendimentoWithStatus[] }

export default function CalendarClient({ atendimentos: initial }: Props) {
  const router = useRouter()
  const today = todayString()
  const currentYM = today.slice(0, 7)

  const [atendimentos, setAtendimentos] = useState<AtendimentoWithStatus[]>(initial)
  const [currentMonth, setCurrentMonth] = useState(currentYM)
  const [viewMode, setViewMode] = useState<ViewMode>('trabalho')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<AtendimentoWithStatus | null>(null)
  const [confirmingItem, setConfirmingItem] = useState<AtendimentoWithStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AtendimentoWithStatus[]>()
    for (const a of atendimentos) {
      const date = getEventDate(a, viewMode)
      if (!date) continue
      if (viewMode === 'recebimentos' && a.status !== 'Recebido') continue
      const list = map.get(date) ?? []
      list.push(a)
      map.set(date, list)
    }
    return map
  }, [atendimentos, viewMode])

  const dayEvents = useMemo(
    () => (selectedDay ? (eventsByDate.get(selectedDay) ?? []) : []),
    [selectedDay, eventsByDate]
  )

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

  async function handleDelete(id: string) {
    if (!window.confirm('Excluir este registro? Esta ação não pode ser desfeita.')) return
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('atendimentos').delete().eq('id', id)
    if (error) { setActionError('Erro ao excluir. Tente novamente.'); return }
    setAtendimentos((prev) => prev.filter((a) => a.id !== id))
    if (selectedDay && eventsByDate.get(selectedDay)?.length === 1) setSelectedDay(null)
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setCurrentMonth((m) => shiftMonth(m, -1)); setSelectedDay(null) }}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground) / 0.65)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'hsl(var(--muted))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <h2 className="text-base sm:text-lg font-semibold tabular-nums min-w-[180px] text-center" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--foreground))' }}>
            {monthTitle(currentMonth)}
          </h2>

          <button
            onClick={() => { setCurrentMonth((m) => shiftMonth(m, 1)); setSelectedDay(null) }}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground) / 0.65)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'hsl(var(--muted))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          {currentMonth !== currentYM && (
            <button
              onClick={() => { setCurrentMonth(currentYM); setSelectedDay(null) }}
              className="text-xs px-2 py-1 rounded-md transition-colors"
              style={{ color: 'hsl(var(--primary))', border: '1px solid hsl(var(--border))' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'hsl(var(--muted))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Hoje
            </button>
          )}
        </div>

        {/* Modo de visualização */}
        <div className="flex rounded-lg overflow-hidden self-start sm:self-auto" style={{ border: '1px solid hsl(var(--border))' }}>
          {([
            { key: 'trabalho',      label: 'Trabalho' },
            { key: 'recebimentos',  label: 'Recebidos' },
            { key: 'previsao',      label: 'Previsão' },
          ] as { key: ViewMode; label: string }[]).map(({ key, label }) => {
            const active = viewMode === key
            return (
              <button
                key={key}
                onClick={() => { setViewMode(key); setSelectedDay(null) }}
                className="px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: active ? 'hsl(var(--primary))' : 'transparent',
                  color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground) / 0.65)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {actionError && (
        <p className="mb-3 text-sm rounded-lg px-3 py-2" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
          {actionError}
        </p>
      )}

      {/* Grade do calendário */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
      >
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'hsl(var(--muted-foreground))', letterSpacing: '0.06em' }}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((date, i) => {
            const events = date ? (eventsByDate.get(date) ?? []) : []
            const isToday     = date === today
            const isSelected  = date === selectedDay
            const isLastCol   = (i + 1) % 7 === 0
            const isLastRow   = i >= calendarDays.length - 7
            const dayNum      = date ? parseInt(date.split('-')[2]) : null

            return (
              <div
                key={i}
                onClick={() => date && setSelectedDay(isSelected ? null : date)}
                className="relative p-1 sm:p-2 transition-colors"
                style={{
                  minHeight: '80px',
                  borderRight:  isLastCol  ? 'none' : '1px solid hsl(var(--border))',
                  borderBottom: isLastRow  ? 'none' : '1px solid hsl(var(--border))',
                  backgroundColor: isSelected
                    ? 'hsl(var(--accent))'
                    : isToday
                    ? 'hsl(var(--accent) / 0.5)'
                    : 'transparent',
                  cursor: date ? 'pointer' : 'default',
                }}
              >
                <div className="flex justify-end mb-1">
                  <span
                    className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: isToday ? 'hsl(var(--primary))' : 'transparent',
                      color: isToday ? 'hsl(var(--primary-foreground))' : date ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.6)',
                    }}
                  >
                    {dayNum}
                  </span>
                </div>

                <div className="hidden sm:block space-y-0.5">
                  {events.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-xs rounded px-1.5 py-0.5 truncate leading-snug"
                      style={chipStyle(ev, viewMode)}
                      title={chipLabel(ev, viewMode)}
                    >
                      {chipLabel(ev, viewMode)}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs pl-1" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>
                      +{events.length - 2} mais
                    </div>
                  )}
                </div>

                {events.length > 0 && (
                  <div className="sm:hidden flex flex-wrap gap-0.5 mt-0.5">
                    {events.slice(0, 3).map((ev, j) => (
                      <div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: dotColor(ev, viewMode) }}
                      />
                    ))}
                    {events.length > 3 && (
                      <span className="text-xs leading-none" style={{ color: 'hsl(var(--muted-foreground) / 0.6)', fontSize: '9px' }}>
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
          style={{ border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
        >
          <div
            className="flex items-center justify-between px-4 sm:px-5 py-3"
            style={{ borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}
          >
            <h3
              className="font-semibold text-base"
              style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--foreground))' }}
            >
              {formatDate(selectedDay)}
              {dayEvents.length > 0 && (
                <span className="ml-2 text-sm font-normal" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {dayEvents.length} registro{dayEvents.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/?tab=novo&date=${selectedDay}`)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
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
                style={{ color: 'hsl(var(--muted-foreground))' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'hsl(var(--border))' }}
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {viewMode === 'recebimentos'
                    ? 'Nenhum pagamento recebido neste dia'
                    : viewMode === 'previsao'
                    ? 'Nenhum pagamento previsto para este dia'
                    : 'Nenhum atendimento neste dia'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((ev) => {
                  const late = daysOverdue(ev.data_prevista_pagamento, ev.status)
                  const leftColor =
                    ev.status === 'Recebido' ? '#5A7B5C'
                    : late > 0 ? '#9B2040'
                    : '#d97706'

                  return (
                    <div
                      key={ev.id}
                      className="rounded-xl p-3 sm:p-4"
                      style={{
                        border: '1px solid hsl(var(--border))',
                        borderLeft: `3px solid ${leftColor}`,
                        backgroundColor: 'hsl(var(--accent))',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {ev.paciente ? (
                            <>
                              <p className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>{ev.paciente}</p>
                              <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{ev.local}</p>
                            </>
                          ) : (
                            <p className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>{ev.local}</p>
                          )}
                          <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            {ev.tipo} · {ev.tempo}
                          </p>
                          {ev.observacoes && (
                            <p className="text-xs italic mt-1" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>{ev.observacoes}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm tabular-nums" style={{ color: '#C4752A' }}>
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
                          style={{ borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
                        >
                          <span>Recebido: <strong style={{ color: '#5A7B5C' }}>{formatCurrency(ev.valor_recebido)}</strong></span>
                          <span>em {formatDate(ev.data_recebimento)}</span>
                          {ev.banco && <span>· {ev.banco}</span>}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        {ev.status === 'Pendente' && (
                          <button
                            onClick={() => setConfirmingItem(ev)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                            style={{ backgroundColor: '#D1EDD4', color: '#2F5E34' }}
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
                          style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground) / 0.65)', border: '1px solid hsl(var(--border))' }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                          style={{ backgroundColor: '#F8E5EB', color: '#9B1D3E' }}
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
    </div>
  )
}
