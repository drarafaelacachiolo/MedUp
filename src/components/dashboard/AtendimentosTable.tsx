'use client'

import { useState } from 'react'
import { formatCurrency, formatDate, daysOverdue } from '@/lib/utils'
import type { AtendimentoWithStatus } from '@/types/database'

interface AtendimentosTableProps {
  atendimentos: AtendimentoWithStatus[]
  onEdit: (item: AtendimentoWithStatus) => void
  onDelete: (id: string) => void
  onConfirmPayment: (item: AtendimentoWithStatus) => void
}

type SortKey = 'data_atendimento' | 'valor_a_receber' | 'data_prevista_pagamento' | 'data_recebimento' | 'valor_recebido'
type SortDir = 'asc' | 'desc'

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg width="10" height="10" viewBox="0 0 10 14" fill="none" style={{ opacity: 0.35 }}>
        <path d="M5 1L1 5h8L5 1zM5 13l4-4H1l4 4z" fill="currentColor"/>
      </svg>
    )
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'hsl(var(--primary))' }}>
      {dir === 'asc'
        ? <path d="M5 1L1 8h8L5 1z" fill="currentColor"/>
        : <path d="M5 9L1 2h8L5 9z" fill="currentColor"/>
      }
    </svg>
  )
}

export default function AtendimentosTable({
  atendimentos,
  onEdit,
  onDelete,
  onConfirmPayment,
}: AtendimentosTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('data_atendimento')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...atendimentos].sort((a, b) => {
    const aVal = a[sortKey] ?? ''
    const bVal = b[sortKey] ?? ''
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (atendimentos.length === 0) {
    return (
      <div
        className="rounded-xl flex flex-col items-center justify-center py-16 text-center"
        style={{ border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground) / 0.65)' }}>Nenhum atendimento encontrado</p>
        <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Tente ajustar os filtros</p>
      </div>
    )
  }

  return (
    <>
      {/* Tabela — desktop */}
      <div
        className="hidden md:block rounded-xl overflow-hidden"
        style={{ border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted))' }}>
                {(['data_atendimento', 'valor_a_receber', 'data_prevista_pagamento', 'data_recebimento', 'valor_recebido'] as SortKey[]).map((key, i) => {
                  const labels: Record<SortKey, string> = {
                    data_atendimento: 'Data',
                    valor_a_receber: 'A Receber',
                    data_prevista_pagamento: 'Previsão Pgto',
                    data_recebimento: 'Recebido em',
                    valor_recebido: 'Valor Rec.',
                  }
                  const isActive = sortKey === key
                  return (
                    <>
                      {i === 1 && (
                        <th
                          key="tipo-header"
                          className="text-left px-4 py-3 font-medium whitespace-nowrap"
                          style={{ color: 'hsl(var(--muted-foreground))', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                        >
                          Tipo
                        </th>
                      )}
                      {i === 1 && (
                        <th
                          key="local-header"
                          className="text-left px-4 py-3 font-medium whitespace-nowrap"
                          style={{ color: 'hsl(var(--muted-foreground))', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                        >
                          Local / Paciente
                        </th>
                      )}
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="text-left px-4 py-3 font-medium whitespace-nowrap cursor-pointer select-none transition-colors"
                        style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'hsl(var(--foreground) / 0.65)' }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'hsl(var(--muted-foreground))' }}
                      >
                        <div className="flex items-center gap-1.5">
                          {labels[key]}
                          <SortIcon active={isActive} dir={sortDir} />
                        </div>
                      </th>
                      {i === 3 && (
                        <th
                          key="banco-header"
                          className="text-left px-4 py-3 font-medium whitespace-nowrap"
                          style={{ color: 'hsl(var(--muted-foreground))', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                        >
                          Banco
                        </th>
                      )}
                    </>
                  )
                })}
                <th
                  className="text-left px-4 py-3 font-medium whitespace-nowrap"
                  style={{ color: 'hsl(var(--muted-foreground))', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  Status
                </th>
                <th
                  className="text-left px-4 py-3 font-medium whitespace-nowrap"
                  style={{ color: 'hsl(var(--muted-foreground))', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a, i) => {
                const atraso = daysOverdue(a.data_prevista_pagamento, a.status)
                const isOverdue = atraso > 0
                const rowBg = a.status === 'Recebido' ? '#F4FBF5' : isOverdue ? '#FFF5F7' : '#FFFBF0'

                return (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom: i < sorted.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                      backgroundColor: rowBg,
                    }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums" style={{ color: 'hsl(var(--foreground))' }}>
                      {formatDate(a.data_atendimento)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium w-fit"
                          style={
                            a.tipo === 'Plantão'
                              ? { backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--primary))' }
                              : { backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }
                          }
                        >
                          {a.tipo}
                        </span>
                        <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>{a.tempo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ maxWidth: '180px' }}>
                      {a.paciente ? (
                        <>
                          <p className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>{a.paciente}</p>
                          <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{a.local}</p>
                        </>
                      ) : (
                        <p className="font-medium text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>{a.local}</p>
                      )}
                      {a.observacoes && (
                        <p className="text-xs italic truncate" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }} title={a.observacoes}>
                          {a.observacoes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium" style={{ color: '#C4752A' }}>
                      {formatCurrency(a.valor_a_receber)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: isOverdue ? '#9B1D3E' : 'hsl(var(--foreground) / 0.65)' }}>
                      <div className="flex flex-col gap-0.5">
                        <span className="tabular-nums text-sm">{formatDate(a.data_prevista_pagamento)}</span>
                        {isOverdue && (
                          <span className="text-xs font-medium" style={{ color: '#9B1D3E' }}>
                            {atraso}d de atraso
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums" style={{ color: 'hsl(var(--foreground) / 0.65)' }}>
                      {formatDate(a.data_recebimento)}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'hsl(var(--foreground) / 0.65)' }}>
                      {a.banco ?? '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium" style={{ color: '#5A7A5C' }}>
                      {formatCurrency(a.valor_recebido)}
                    </td>
                    <td className="px-4 py-3">
                      {a.status === 'Pendente' ? (
                        isOverdue
                          ? <span className="badge-overdue">Atrasado</span>
                          : <span className="badge-pending">Pendente</span>
                      ) : (
                        <span className="badge-received">Recebido</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {a.status === 'Pendente' && (
                          <button
                            onClick={() => onConfirmPayment(a)}
                            title="Confirmar recebimento"
                            className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                            style={{ color: '#5A7A5C' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E0EDE2' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(a)}
                          title="Editar"
                          className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                          style={{ color: 'hsl(var(--foreground) / 0.65)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'hsl(var(--muted))' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(a.id)}
                          title="Excluir"
                          className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                          style={{ color: '#C0405E' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8E5EB' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {sorted.map((a) => {
          const atraso = daysOverdue(a.data_prevista_pagamento, a.status)
          const isOverdue = atraso > 0
          const cardBg = a.status === 'Recebido' ? '#F4FBF5' : isOverdue ? '#FFF5F7' : '#FFFBF0'
          const leftBorderColor = a.status === 'Recebido' ? '#6DB57A' : isOverdue ? '#E88A9A' : '#F5C842'

          return (
            <div
              key={a.id}
              className="rounded-xl p-4"
              style={{
                border: '1px solid hsl(var(--border))',
                backgroundColor: cardBg,
                borderLeft: `3px solid ${leftBorderColor}`,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  {a.paciente ? (
                    <>
                      <p className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>{a.paciente}</p>
                      <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{a.local}</p>
                    </>
                  ) : (
                    <p className="font-medium text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>{a.local}</p>
                  )}
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {formatDate(a.data_atendimento)} · {a.tipo} · {a.tempo}
                  </p>
                </div>
                {a.status === 'Pendente' ? (
                  isOverdue
                    ? <span className="badge-overdue shrink-0">Atrasado</span>
                    : <span className="badge-pending shrink-0">Pendente</span>
                ) : (
                  <span className="badge-received shrink-0">Recebido</span>
                )}
              </div>

              {a.observacoes && (
                <p className="text-xs italic mb-2" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>{a.observacoes}</p>
              )}

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                <div>
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>A receber</p>
                  <p className="text-sm font-semibold tabular-nums" style={{ color: '#C4752A' }}>
                    {formatCurrency(a.valor_a_receber)}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Previsão</p>
                  <p className="text-sm tabular-nums" style={{ color: isOverdue ? '#9B1D3E' : 'hsl(var(--foreground) / 0.65)' }}>
                    {formatDate(a.data_prevista_pagamento)}
                    {isOverdue && (
                      <span className="block text-xs font-medium" style={{ color: '#9B1D3E' }}>
                        {atraso}d de atraso
                      </span>
                    )}
                  </p>
                </div>
                {a.status === 'Recebido' && (
                  <>
                    <div>
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Recebido</p>
                      <p className="text-sm font-semibold tabular-nums" style={{ color: '#5A7A5C' }}>
                        {formatCurrency(a.valor_recebido)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Banco</p>
                      <p className="text-sm" style={{ color: 'hsl(var(--foreground) / 0.65)' }}>{a.banco ?? '—'}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Ações mobile */}
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                {a.status === 'Pendente' && (
                  <button
                    onClick={() => onConfirmPayment(a)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{ backgroundColor: '#3D5E3F', color: '#FFFFFF' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Confirmar
                  </button>
                )}
                <button
                  onClick={() => onEdit(a)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: '#9B1D3E', color: '#FFFFFF' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    </>
  )
}
