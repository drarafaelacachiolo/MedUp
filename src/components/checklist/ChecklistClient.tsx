'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from './ConfirmModal'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { AtendimentoWithStatus, ConfirmReceiptInput } from '@/types/database'

interface ChecklistClientProps {
  initialPendentes: AtendimentoWithStatus[]
  initialRecebidos: AtendimentoWithStatus[]
}

export default function ChecklistClient({ initialPendentes, initialRecebidos }: ChecklistClientProps) {
  const [pendentes, setPendentes] = useState<AtendimentoWithStatus[]>(initialPendentes)
  const [recebidos, setRecebidos] = useState<AtendimentoWithStatus[]>(initialRecebidos)
  const [selectedItem, setSelectedItem] = useState<AtendimentoWithStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmError, setConfirmError] = useState('')
  const [recebidosAberto, setRecebidosAberto] = useState(false)

  async function handleConfirm(formData: ConfirmReceiptInput) {
    setIsLoading(true)
    setConfirmError('')

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
      setConfirmError('Erro ao confirmar. Tente novamente.')
      setIsLoading(false)
      return
    }

    const itemConfirmado = pendentes.find((i) => i.id === formData.id)
    if (itemConfirmado) {
      const itemAtualizado: AtendimentoWithStatus = {
        ...itemConfirmado,
        status: 'Recebido',
        data_recebimento: formData.data_recebimento,
        valor_recebido: formData.valor_recebido,
        banco: formData.banco,
      }
      setPendentes((prev) => prev.filter((i) => i.id !== formData.id))
      setRecebidos((prev) => [itemAtualizado, ...prev])
    }

    setSelectedItem(null)
    setIsLoading(false)
  }

  return (
    <>
      {pendentes.length === 0 && recebidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: '#d1fae5', color: '#047857' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Tudo em dia!</p>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Nenhum atendimento registrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pendentes */}
          <div>
            {pendentes.length === 0 ? (
              <div
                className="rounded-xl flex items-center gap-3 px-4 py-4"
                style={{ backgroundColor: '#d1fae5', border: '1px solid #6ee7b7' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p className="text-sm font-medium" style={{ color: '#047857' }}>
                  Nenhum recebimento pendente! Tudo em dia.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendentes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setConfirmError('') }}
                    className="w-full text-left rounded-xl p-4 transition-colors"
                    style={{
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))',
                      borderLeft: '4px solid #C4752A',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--muted))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--card))'}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'hsl(var(--foreground))' }}>
                          {item.local}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {item.tipo} · {item.tempo} · {formatDate(item.data_atendimento)}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Esperado</p>
                            <p className="text-sm font-semibold tabular-nums" style={{ color: '#C4752A' }}>
                              {formatCurrency(item.valor_a_receber)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Previsão</p>
                            <p className="text-sm tabular-nums" style={{ color: 'hsl(var(--foreground) / 0.65)' }}>
                              {formatDate(item.data_prevista_pagamento)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors"
                        style={{ border: '2px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground) / 0.6)' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recebidos — accordion */}
          {recebidos.length > 0 && (
            <div>
              <button
                onClick={() => setRecebidosAberto((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: recebidosAberto ? '#d1fae5' : '#ecfdf5',
                  border: '1px solid #6ee7b7',
                }}
              >
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className="text-sm font-semibold" style={{ color: '#047857' }}>
                    Recebidos ({recebidos.length})
                  </span>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: recebidosAberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {recebidosAberto && (
                <div className="mt-2 space-y-2">
                  {recebidos.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl p-4"
                      style={{
                        border: '1px solid #6ee7b7',
                        backgroundColor: '#f0fdf4',
                        borderLeft: '4px solid #5A7A5C',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'hsl(var(--foreground))' }}>{item.local}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            {item.tipo} · {item.tempo} · {formatDate(item.data_atendimento)}
                          </p>
                        </div>
                        <span className="badge-received shrink-0">Recebido</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: '1px solid #bbf7d0' }}>
                        <div>
                          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Recebido em</p>
                          <p className="text-xs font-medium tabular-nums" style={{ color: 'hsl(var(--foreground) / 0.65)' }}>
                            {formatDate(item.data_recebimento)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Valor</p>
                          <p className="text-xs font-semibold tabular-nums" style={{ color: '#5A7A5C' }}>
                            {formatCurrency(item.valor_recebido)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Banco</p>
                          <p className="text-xs font-medium" style={{ color: 'hsl(var(--foreground) / 0.65)' }}>
                            {item.banco ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {confirmError && (
        <p className="mt-4 text-sm rounded-lg px-3 py-2" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
          {confirmError}
        </p>
      )}

      {selectedItem && (
        <ConfirmModal
          item={selectedItem}
          onConfirm={handleConfirm}
          onClose={() => setSelectedItem(null)}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
