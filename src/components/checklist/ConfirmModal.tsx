'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate, todayString } from '@/lib/utils'
import type { AtendimentoWithStatus, ConfirmReceiptInput } from '@/types/database'

interface ConfirmModalProps {
  item: AtendimentoWithStatus
  onConfirm: (data: ConfirmReceiptInput) => Promise<void>
  onClose: () => void
  isLoading: boolean
}

export default function ConfirmModal({
  item,
  onConfirm,
  onClose,
  isLoading,
}: ConfirmModalProps) {
  const [dataRecebimento, setDataRecebimento] = useState(todayString())
  const [valorRecebido, setValorRecebido] = useState(String(item.valor_a_receber))
  const [banco, setBanco] = useState('')
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldError('')

    if (!banco.trim()) {
      setFieldError('Informe o banco.')
      return
    }
    if (!valorRecebido || parseFloat(valorRecebido) < 0) {
      setFieldError('Informe o valor recebido.')
      return
    }

    await onConfirm({
      id: item.id,
      data_recebimento: dataRecebimento,
      valor_recebido: parseFloat(valorRecebido),
      banco: banco.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-10 bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6"
        style={{ border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            Confirmar Recebimento
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: 'hsl(var(--muted-foreground))' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--muted))'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div
          className="rounded-xl p-4 mb-5 space-y-1"
          style={{ backgroundColor: 'hsl(var(--muted))', borderLeft: '3px solid #C4752A' }}
        >
          {item.paciente && (
            <p className="text-xs font-medium" style={{ color: 'hsl(var(--foreground) / 0.65)' }}>{item.paciente}</p>
          )}
          <p className="font-medium text-sm" style={{ color: 'hsl(var(--foreground))' }}>{item.local}</p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {item.tipo} · {item.tempo} · {formatDate(item.data_atendimento)}
          </p>
          <p className="text-sm font-semibold tabular-nums mt-1" style={{ color: '#C4752A' }}>
            Esperado: {formatCurrency(item.valor_a_receber)}
          </p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Previsão: {formatDate(item.data_prevista_pagamento)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Data que Recebeu *</label>
            <input
              type="date"
              required
              className="field"
              value={dataRecebimento}
              onChange={(e) => setDataRecebimento(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Valor Recebido (R$) *</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              inputMode="decimal"
              className="field"
              value={valorRecebido}
              onChange={(e) => setValorRecebido(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Banco *</label>
            <input
              type="text"
              required
              className="field"
              placeholder="ex: Bradesco, Nubank, Itaú"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
            />
          </div>

          {fieldError && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
              {fieldError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1"
              style={{ backgroundColor: '#5A7A5C' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Confirmando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Confirmar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
