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
    if (!novaCategoria.nome.trim() || !novaCategoria.tempo.trim()) {
      setSavingCategoria(false)
      return
    }
    setSavingCategoria(true)

    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user_id = userData?.user?.id

    const maxOrdem = categorias.length > 0 ? Math.max(...categorias.map((c) => c.ordem)) : 0
    const { data, error: dbError } = await supabase
      .from('categorias')
      .insert([{
        user_id,
        nome:  novaCategoria.nome.trim(),
        tipo:  novaCategoria.tipo,
        tempo: novaCategoria.tempo.trim(),
        ordem: maxOrdem + 1,
      }])
      .select()
      .single()

    if (!dbError && data) {
      await fetchCategorias()
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sessão expirada. Por favor, faça login novamente.')
      setLoading(false)
      return
    }

    const payload = {
      user_id:                 user.id,
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
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: '#1A1816', letterSpacing: '-0.5px' }}>Novo Lançamento</h2>
        <p className="text-sm" style={{ color: '#7A756E' }}>Preencha os dados abaixo para registrar seu atendimento.</p>
      </div>

      {success && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 mb-8 text-sm font-medium border animate-in fade-in slide-in-from-top-4"
          style={{ backgroundColor: '#EEFBF4', color: '#065F46', borderColor: '#D1FAE5' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Atendimento lançado com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção 1: Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
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

          <div>
            <label className="field-label">Tipo de Atendimento *</label>
            {loadingCategorias ? (
              <div className="field flex items-center" style={{ color: 'hsl(var(--muted-foreground))' }}>
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

            <button
              type="button"
              onClick={() => setShowNovaCategoria((v) => !v)}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold transition-colors"
              style={{ color: '#1C4E80' }}
            >
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: showNovaCategoria ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {showNovaCategoria ? 'Cancelar' : 'Nova categoria'}
            </button>

            {showNovaCategoria && (
              <div
                className="mt-3 rounded-xl p-4 space-y-4 shadow-sm animate-in zoom-in-95"
                style={{ backgroundColor: '#F9F8F6', border: '1px solid #E5E1DB' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A756E]">Nova Categoria</p>
                
                <div>
                  <label className="field-label !text-xs">Nome *</label>
                  <input
                    type="text"
                    className="field !h-10 !py-1"
                    placeholder='ex: "Plantão 24h"'
                    value={novaCategoria.nome}
                    onChange={(e) => setNovaCategoria((p) => ({ ...p, nome: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label !text-xs">Tipo *</label>
                    <select
                      className="field !h-10 !py-1"
                      value={novaCategoria.tipo}
                      onChange={(e) => setNovaCategoria((p) => ({ ...p, tipo: e.target.value as TipoAtendimento }))}
                    >
                      <option value="Plantão">Plantão</option>
                      <option value="Consulta">Consulta</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label !text-xs">Tempo *</label>
                    <input
                      type="text"
                      className="field !h-10 !py-1"
                      placeholder="ex: 12h"
                      value={novaCategoria.tempo}
                      onChange={(e) => setNovaCategoria((p) => ({ ...p, tempo: e.target.value }))}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCriarCategoria}
                  disabled={savingCategoria || !novaCategoria.nome.trim() || !novaCategoria.tempo.trim()}
                  className="btn-primary w-full !min-h-0 py-2 text-xs"
                >
                  {savingCategoria ? 'Criando...' : 'Criar e selecionar'}
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="field-label">Local *</label>
            <input
              type="text"
              required
              className="field"
              placeholder="Ex: Hospital das Clínicas, Unifesp..."
              value={form.local}
              onChange={(e) => set('local', e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="field-label">Paciente / Identificação</label>
            <input
              type="text"
              className="field"
              placeholder="Nome do paciente ou identificação extra"
              value={form.paciente}
              onChange={(e) => set('paciente', e.target.value)}
            />
          </div>
        </div>

        <hr style={{ borderColor: '#E5E1DB' }} />

        {/* Seção 2: Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <label className="field-label">Valor a Receber (R$) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7A756E] font-semibold">R$</span>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                inputMode="decimal"
                className="field pl-11"
                placeholder="0,00"
                value={form.valor_a_receber}
                onChange={(e) => set('valor_a_receber', e.target.value)}
              />
            </div>
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
          
          <div className="md:col-span-2">
            <label className="field-label">Observações</label>
            <textarea
              className="field min-h-[100px]"
              rows={3}
              placeholder="Notas financeiras ou detalhes do plantão..."
              value={form.observacoes}
              onChange={(e) => set('observacoes', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Seção 3: Recebimento (Optional) */}
        <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: '#F9F8F6', border: '1px solid #E5E1DB' }}>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-[#1C4E80]"></div>
             <p className="text-xs font-bold uppercase tracking-widest text-[#1C4E80]">Recebimento — opcional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className="field-label">Data do Recebimento</label>
              <input
                type="date"
                className="field"
                value={form.data_recebimento}
                onChange={(e) => set('data_recebimento', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Valor Recebido (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7A756E] font-semibold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  className="field pl-11"
                  placeholder="0,00"
                  value={form.valor_recebido}
                  onChange={(e) => set('valor_recebido', e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="field-label">Banco</label>
              <input
                type="text"
                className="field"
                placeholder="Ex: Itaú, Santander, Nubank..."
                value={form.banco}
                onChange={(e) => set('banco', e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm font-medium border" style={{ color: '#991B1B', backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }}>
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-14 text-base shadow-md disabled:shadow-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Processando...
              </>
            ) : (
              'Salvar Lançamento'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
