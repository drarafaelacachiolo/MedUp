'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AtendimentoWithStatus, TipoAtendimento, Categoria, EditAtendimentoInput } from '@/types/database'

interface EditModalProps {
  item: AtendimentoWithStatus
  onSave: (id: string, data: EditAtendimentoInput) => Promise<void>
  onClose: () => void
  isLoading: boolean
}

export default function EditModal({ item, onSave, onClose, isLoading }: EditModalProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [categoriaId, setCategoriaId] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    data_atendimento:        item.data_atendimento,
    tipo:                    item.tipo as TipoAtendimento,
    tempo:                   item.tempo,
    local:                   item.local,
    paciente:                item.paciente ?? '',
    valor_a_receber:         String(item.valor_a_receber),
    data_prevista_pagamento: item.data_prevista_pagamento,
    observacoes:             item.observacoes ?? '',
    data_recebimento:        item.data_recebimento ?? '',
    valor_recebido:          item.valor_recebido != null ? String(item.valor_recebido) : '',
    banco:                   item.banco ?? '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categorias')
      .select('*')
      .order('ordem')
      .then(({ data }) => {
        const cats = (data as Categoria[]) ?? []
        setCategorias(cats)
        // Tenta encontrar categoria correspondente ao tipo+tempo do item
        const match = cats.find((c) => c.tipo === item.tipo && c.tempo === item.tempo)
        if (match) setCategoriaId(match.id)
        setLoadingCats(false)
      })
  }, [item.tipo, item.tempo])

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSelectCategoria(id: string) {
    const cat = categorias.find((c) => c.id === id)
    if (cat) {
      setCategoriaId(id)
      setForm((prev) => ({ ...prev, tipo: cat.tipo, tempo: cat.tempo }))
    } else {
      setCategoriaId('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.local.trim()) {
      setError('Informe o local.')
      return
    }
    if (!form.valor_a_receber || parseFloat(form.valor_a_receber) < 0) {
      setError('Informe o valor a receber.')
      return
    }

    // Validar consistência de recebimento
    const temData = !!form.data_recebimento
    const temValor = !!form.valor_recebido

    if (temData && !temValor) {
      setError('Se informar a data de recebimento, informe também o valor recebido.')
      return
    }
    if (temValor && !temData) {
      setError('Se informar o valor recebido, informe também a data de recebimento.')
      return
    }

    const payload: EditAtendimentoInput = {
      data_atendimento:        form.data_atendimento,
      tipo:                    form.tipo,
      tempo:                   form.tempo,
      local:                   form.local.trim(),
      paciente:                form.paciente.trim() || null,
      observacoes:             form.observacoes.trim() || null,
      valor_a_receber:         parseFloat(form.valor_a_receber),
      data_prevista_pagamento: form.data_prevista_pagamento,
      data_recebimento:        form.data_recebimento || null,
      valor_recebido:          form.valor_recebido ? parseFloat(form.valor_recebido) : null,
      banco:                   form.banco.trim() || null,
    }

    await onSave(item.id, payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative z-10 bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 overflow-y-auto"
        style={{ border: '1px solid var(--border)', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
            Editar Registro
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: 'var(--ink-light)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--ivory-mid)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data do atendimento */}
          <div>
            <label className="field-label">Data do Atendimento *</label>
            <input
              type="date"
              required
              className="field"
              value={form.data_atendimento}
              onChange={(e) => set('data_atendimento', e.target.value)}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="field-label">Tipo de Atendimento *</label>
            {loadingCats ? (
              <div className="field flex items-center" style={{ color: 'var(--ink-light)' }}>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Carregando...
              </div>
            ) : (
              <select
                className="field"
                value={categoriaId}
                onChange={(e) => handleSelectCategoria(e.target.value)}
              >
                <option value="">Selecione...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            )}
            {/* Fallback manual caso a categoria não exista mais */}
            {!loadingCats && !categoriaId && (
              <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>
                Tipo atual: <strong>{form.tipo} · {form.tempo}</strong> — selecione uma categoria acima para alterar
              </p>
            )}
          </div>

          {/* Local */}
          <div>
            <label className="field-label">Local *</label>
            <input
              type="text"
              required
              className="field"
              placeholder="Hospital / Clínica"
              value={form.local}
              onChange={(e) => set('local', e.target.value)}
            />
          </div>

          {/* Paciente */}
          <div>
            <label className="field-label">Paciente / Identificação</label>
            <input
              type="text"
              className="field"
              placeholder="Nome do paciente ou identificação do plantão"
              value={form.paciente}
              onChange={(e) => set('paciente', e.target.value)}
            />
          </div>

          {/* Valor e Previsão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Valor a Receber (R$) *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                inputMode="decimal"
                className="field"
                placeholder="0,00"
                value={form.valor_a_receber}
                onChange={(e) => set('valor_a_receber', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Previsão de Pagamento *</label>
              <input
                type="date"
                required
                className="field"
                value={form.data_prevista_pagamento}
                onChange={(e) => set('data_prevista_pagamento', e.target.value)}
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="field-label">Observações</label>
            <textarea
              className="field"
              rows={2}
              placeholder="Anotações adicionais..."
              value={form.observacoes}
              onChange={(e) => set('observacoes', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Recebimento */}
          <div
            className="rounded-xl p-4 space-y-4"
            style={{ backgroundColor: 'var(--ivory-mid)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-light)' }}>
              Recebimento — opcional
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Data que Recebeu</label>
                <input
                  type="date"
                  className="field"
                  value={form.data_recebimento}
                  onChange={(e) => set('data_recebimento', e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Valor Recebido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  className="field"
                  placeholder="0,00"
                  value={form.valor_recebido}
                  onChange={(e) => set('valor_recebido', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="field-label">Banco</label>
              <input
                type="text"
                className="field"
                placeholder="ex: Bradesco, Nubank, Itaú"
                value={form.banco}
                onChange={(e) => set('banco', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
              {error}
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
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
