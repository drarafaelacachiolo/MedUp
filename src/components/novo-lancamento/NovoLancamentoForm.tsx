'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { todayString } from '@/lib/utils'
import type { TipoAtendimento, Categoria } from '@/types/database'

const emptyForm = {
  data_atendimento: todayString(),
  categoriaId: '',
  tipo: '' as TipoAtendimento | '',
  tempo: '',
  local: '',
  paciente: '',
  valor_a_receber: '',
  data_prevista_pagamento: '',
  observacoes: '',
  // opcionais
  data_recebimento: '',
  valor_recebido: '',
  banco: '',
}

const emptyNovaCategoria = {
  nome: '',
  tipo: 'Plantão' as TipoAtendimento,
  tempo: '',
}

export default function NovoLancamentoForm({ initialDate }: { initialDate?: string }) {
  const [form, setForm] = useState({
    ...emptyForm,
    data_atendimento: initialDate ?? todayString(),
  })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [showNovaCategoria, setShowNovaCategoria] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState(emptyNovaCategoria)
  const [savingCategoria, setSavingCategoria] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function fetchCategorias() {
    const supabase = createClient()
    const { data } = await supabase
      .from('categorias')
      .select('*')
      .order('ordem')
    setCategorias((data as Categoria[]) ?? [])
    setLoadingCategorias(false)
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  function set(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSelectCategoria(id: string) {
    const cat = categorias.find((c) => c.id === id)
    if (cat) {
      setForm((prev) => ({ ...prev, categoriaId: id, tipo: cat.tipo, tempo: cat.tempo }))
    } else {
      setForm((prev) => ({ ...prev, categoriaId: '', tipo: '', tempo: '' }))
    }
  }

  async function handleCriarCategoria(e: React.FormEvent) {
    e.preventDefault()
    if (!novaCategoria.nome.trim() || !novaCategoria.tempo.trim()) return
    setSavingCategoria(true)

    const supabase = createClient()
    const maxOrdem = categorias.length > 0 ? Math.max(...categorias.map((c) => c.ordem)) : 0
    const { data, error: dbError } = await supabase
      .from('categorias')
      .insert([{
        nome:  novaCategoria.nome.trim(),
        tipo:  novaCategoria.tipo,
        tempo: novaCategoria.tempo.trim(),
        ordem: maxOrdem + 1,
      }])
      .select()
      .single()

    if (!dbError && data) {
      await fetchCategorias()
      // Selecionar a nova categoria automaticamente
      setForm((prev) => ({
        ...prev,
        categoriaId: (data as Categoria).id,
        tipo: (data as Categoria).tipo,
        tempo: (data as Categoria).tempo,
      }))
      setNovaCategoria(emptyNovaCategoria)
      setShowNovaCategoria(false)
    }
    setSavingCategoria(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.categoriaId) {
      setError('Selecione uma categoria de atendimento.')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const payload = {
      data_atendimento:        form.data_atendimento,
      tipo:                    form.tipo as TipoAtendimento,
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

    const { error: dbError } = await supabase.from('atendimentos').insert([payload])

    if (dbError) {
      setError('Erro ao salvar. Tente novamente.')
      setLoading(false)
      return
    }

    setForm({ ...emptyForm, data_atendimento: todayString() })
    setSuccess(true)
    setLoading(false)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <h2 className="section-title mb-5">Novo Lançamento</h2>

      {success && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-3 mb-5 text-sm font-medium"
          style={{ backgroundColor: '#d1fae5', color: '#047857' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Atendimento lançado com sucesso!
        </div>
      )}

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

        {/* Categoria (tipo + tempo combinados) */}
        <div>
          <label className="field-label">Tipo de Atendimento *</label>
          {loadingCategorias ? (
            <div className="field flex items-center" style={{ color: 'var(--ink-light)' }}>
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Carregando...
            </div>
          ) : (
            <select
              required
              className="field"
              value={form.categoriaId}
              onChange={(e) => handleSelectCategoria(e.target.value)}
            >
              <option value="">Selecione...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          )}

          {/* Mini-form de nova categoria */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowNovaCategoria((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: 'var(--teal-light)' }}
            >
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showNovaCategoria ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {showNovaCategoria ? 'Cancelar' : 'Nova categoria'}
            </button>

            {showNovaCategoria && (
              <div
                className="mt-3 rounded-xl p-4 space-y-3"
                style={{ backgroundColor: 'var(--ivory-mid)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-light)' }}>
                  Criar nova categoria
                </p>

                <div>
                  <label className="field-label">Nome *</label>
                  <input
                    type="text"
                    className="field"
                    placeholder='ex: "Plantão 24h", "Consulta retorno"'
                    value={novaCategoria.nome}
                    onChange={(e) => setNovaCategoria((p) => ({ ...p, nome: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Tipo *</label>
                    <select
                      className="field"
                      value={novaCategoria.tipo}
                      onChange={(e) => setNovaCategoria((p) => ({ ...p, tipo: e.target.value as TipoAtendimento }))}
                    >
                      <option value="Plantão">Plantão</option>
                      <option value="Consulta">Consulta</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Tempo *</label>
                    <input
                      type="text"
                      className="field"
                      placeholder="ex: 24h, 2h"
                      value={novaCategoria.tempo}
                      onChange={(e) => setNovaCategoria((p) => ({ ...p, tempo: e.target.value }))}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCriarCategoria}
                  disabled={savingCategoria || !novaCategoria.nome.trim() || !novaCategoria.tempo.trim()}
                  className="btn-primary text-sm px-4 py-2"
                  style={{ minHeight: '40px', fontSize: '13px' }}
                >
                  {savingCategoria ? 'Criando...' : 'Criar e selecionar'}
                </button>
              </div>
            )}
          </div>
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

        {/* Seção opcional de recebimento */}
        <div
          className="rounded-xl p-4 space-y-4 mt-2"
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Salvando...
            </>
          ) : (
            'Salvar Lançamento'
          )}
        </button>
      </form>
    </div>
  )
}
