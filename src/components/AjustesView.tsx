'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/app/(dashboard)/LogoutButton'
import type { TipoAtendimento, Categoria } from '@/types/database'
import Spinner from '@/components/ui/Spinner'

interface Profile {
  full_name: string | null
  crm: string | null
  especialidade: string | null
  banco_padrao: string | null
}

const emptyNewCat = { nome: '', tipo: 'Plantão' as TipoAtendimento, tempo: '' }

export default function AjustesView() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Dados do Perfil
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    crm: '',
    especialidade: '',
    banco_padrao: ''
  })

  // Dados de Auth
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Categorias
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingFields, setEditingFields] = useState({ nome: '', tipo: 'Plantão' as TipoAtendimento, tempo: '' })
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCat, setNewCat] = useState(emptyNewCat)
  const [savingCat, setSavingCat] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [catError, setCatError] = useState('')

  async function fetchCategorias() {
    const { data } = await supabase.from('categorias').select('*').order('ordem')
    setCategorias((data as Categoria[]) ?? [])
    setLoadingCats(false)
  }

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email ?? '')

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (prof) {
        setProfile({
          full_name: prof.full_name ?? '',
          crm: prof.crm ?? '',
          especialidade: prof.especialidade ?? '',
          banco_padrao: prof.banco_padrao ?? ''
        })
      }
      setLoading(false)
    }
    loadData()
    fetchCategorias()
  }, [])

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profile
      })

    if (err) {
      setError('Erro ao salvar perfil.')
    } else {
      setSuccess('Perfil atualizado com sucesso!')
      router.refresh()
    }
    setSaving(false)
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const { error: err } = await supabase.auth.updateUser({ email })

    if (err) {
      setError(err.message)
    } else {
      setSuccess('E-mail atualizado! Verifique sua nova caixa de entrada para confirmar.')
    }
    setSaving(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError(err.message)
    } else {
      setSuccess('Senha alterada com sucesso!')
      setPassword('')
    }
    setSaving(false)
  }

  async function handleAddCategoria(e: React.FormEvent) {
    e.preventDefault()
    if (!newCat.nome.trim() || !newCat.tempo.trim()) return
    setSavingCat(true)
    setCatError('')

    const { data: { user } } = await supabase.auth.getUser()
    const maxOrdem = categorias.length > 0 ? Math.max(...categorias.map((c) => c.ordem)) : 0

    const { error: err } = await supabase.from('categorias').insert([{
      user_id: user?.id,
      nome: newCat.nome.trim(),
      tipo: newCat.tipo,
      tempo: newCat.tempo.trim(),
      ordem: maxOrdem + 1,
    }])

    if (err) {
      setCatError('Erro ao criar categoria.')
    } else {
      setNewCat(emptyNewCat)
      setShowAddCat(false)
      await fetchCategorias()
    }
    setSavingCat(false)
  }

  async function handleStartEdit(cat: Categoria) {
    setEditingId(cat.id)
    setEditingFields({ nome: cat.nome, tipo: cat.tipo, tempo: cat.tempo })
    setCatError('')
  }

  async function handleSaveEdit(id: string) {
    if (!editingFields.nome.trim() || !editingFields.tempo.trim()) return
    setSavingCat(true)
    setCatError('')

    const { error: err } = await supabase
      .from('categorias')
      .update({ nome: editingFields.nome.trim(), tipo: editingFields.tipo, tempo: editingFields.tempo.trim() })
      .eq('id', id)

    if (err) {
      setCatError('Erro ao salvar. Essa categoria pode ser uma padrão do sistema.')
    } else {
      setEditingId(null)
      await fetchCategorias()
    }
    setSavingCat(false)
  }

  async function handleDeleteCategoria(id: string) {
    setDeletingId(id)
    setCatError('')

    const { error: err } = await supabase.from('categorias').delete().eq('id', id)

    if (err) {
      setCatError('Não foi possível excluir. Essa categoria pode ser uma padrão do sistema.')
    } else {
      await fetchCategorias()
    }
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-10 animate-pulse space-y-8">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          <div className="h-12 w-full bg-gray-100 rounded-lg"></div>
          <div className="h-12 w-full bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-12">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1A1816', letterSpacing: '-0.5px' }}>Ajustes</h2>
        <p className="text-sm" style={{ color: '#7A756E' }}>Gerencie suas informações de conta e preferências.</p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-4">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-4">
          {error}
        </div>
      )}

      {/* Perfil Profissional */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: '#E5E1DB' }}>
          <h3 className="text-lg font-semibold">Perfil Profissional</h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="field-label">Nome Completo</label>
            <input
              type="text"
              className="field"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="field-label">CRM</label>
            <input
              type="text"
              className="field"
              value={profile.crm || ''}
              onChange={(e) => setProfile({ ...profile, crm: e.target.value })}
              placeholder="000000-SP"
            />
          </div>
          <div>
            <label className="field-label">Especialidade</label>
            <input
              type="text"
              className="field"
              value={profile.especialidade || ''}
              onChange={(e) => setProfile({ ...profile, especialidade: e.target.value })}
              placeholder="Ex: Pediatria"
            />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Banco Padrão (para preenchimento automático)</label>
            <input
              type="text"
              className="field"
              value={profile.banco_padrao || ''}
              onChange={(e) => setProfile({ ...profile, banco_padrao: e.target.value })}
              placeholder="Ex: Itaú, Santander..."
            />
          </div>
          <div className="md:col-span-2 pt-2">
            <button type="submit" disabled={saving} className="btn-primary px-8 py-2.5 !min-h-0 text-sm">
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </form>
      </section>

      {/* Tipos de Atendimento */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: '#E5E1DB' }}>
          <h3 className="text-lg font-semibold">Tipos de Atendimento</h3>
        </div>
        <p className="text-sm" style={{ color: '#7A756E' }}>
          Personalize as opções que aparecem ao registrar um novo atendimento.
        </p>

        {catError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {catError}
          </div>
        )}

        {loadingCats ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#7A756E' }}>
            <Spinner size="sm" /> Carregando...
          </div>
        ) : (
          <div className="space-y-2">
            {categorias.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: '#7A756E' }}>
                Nenhuma categoria cadastrada ainda.
              </p>
            )}
            {categorias.map((cat) => {
              const isGlobal = cat.user_id === null
              const isEditing = editingId === cat.id

              if (isEditing) {
                return (
                  <div
                    key={cat.id}
                    className="flex flex-col gap-3 p-4 rounded-xl border"
                    style={{ backgroundColor: '#F9F8F6', borderColor: '#1C4E80' }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="field-label !text-xs">Nome</label>
                        <input
                          type="text"
                          className="field !h-9 !py-1 text-sm"
                          value={editingFields.nome}
                          onChange={(e) => setEditingFields((p) => ({ ...p, nome: e.target.value }))}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="field-label !text-xs">Tipo</label>
                        <select
                          className="field !h-9 !py-1 text-sm"
                          value={editingFields.tipo}
                          onChange={(e) => setEditingFields((p) => ({ ...p, tipo: e.target.value as TipoAtendimento }))}
                        >
                          <option value="Plantão">Plantão</option>
                          <option value="Consulta">Consulta</option>
                        </select>
                      </div>
                      <div>
                        <label className="field-label !text-xs">Duração</label>
                        <input
                          type="text"
                          className="field !h-9 !py-1 text-sm"
                          placeholder="ex: 4h"
                          value={editingFields.tempo}
                          onChange={(e) => setEditingFields((p) => ({ ...p, tempo: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={savingCat || !editingFields.nome.trim() || !editingFields.tempo.trim()}
                        className="btn-primary !min-h-0 py-1.5 px-4 text-xs"
                      >
                        {savingCat ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="py-1.5 px-4 text-xs font-semibold rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: '#E5E1DB' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
                  style={{ backgroundColor: '#FAFAF9', borderColor: '#E5E1DB' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex-shrink-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.tipo === 'Consulta' ? '#1C4E80' : '#7A756E' }}
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-medium truncate" style={{ color: '#1A1816' }}>
                        {cat.nome}
                      </span>
                      <span className="ml-2 text-xs" style={{ color: '#7A756E' }}>
                        {cat.tipo} · {cat.tempo}
                      </span>
                    </div>
                    {isGlobal && (
                      <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#F0EDE8', color: '#7A756E' }}>
                        padrão
                      </span>
                    )}
                  </div>
                  {!isGlobal && (
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#7A756E' }}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCategoria(cat.id)}
                        disabled={deletingId === cat.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        {deletingId === cat.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#EF4444' }}>
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Adicionar nova categoria */}
        {showAddCat ? (
          <form
            onSubmit={handleAddCategoria}
            className="p-4 rounded-xl space-y-4 border"
            style={{ backgroundColor: '#F9F8F6', borderColor: '#E5E1DB' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#7A756E' }}>
              Nova Categoria
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="field-label !text-xs">Nome *</label>
                <input
                  type="text"
                  className="field !h-9 !py-1 text-sm"
                  placeholder='ex: "Visita Domiciliar"'
                  value={newCat.nome}
                  onChange={(e) => setNewCat((p) => ({ ...p, nome: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="field-label !text-xs">Tipo *</label>
                <select
                  className="field !h-9 !py-1 text-sm"
                  value={newCat.tipo}
                  onChange={(e) => setNewCat((p) => ({ ...p, tipo: e.target.value as TipoAtendimento }))}
                >
                  <option value="Plantão">Plantão</option>
                  <option value="Consulta">Consulta</option>
                </select>
              </div>
              <div>
                <label className="field-label !text-xs">Duração *</label>
                <input
                  type="text"
                  className="field !h-9 !py-1 text-sm"
                  placeholder="ex: 4h, 30min"
                  value={newCat.tempo}
                  onChange={(e) => setNewCat((p) => ({ ...p, tempo: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingCat || !newCat.nome.trim() || !newCat.tempo.trim()}
                className="btn-primary !min-h-0 py-1.5 px-5 text-xs"
              >
                {savingCat ? 'Criando...' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddCat(false); setNewCat(emptyNewCat) }}
                className="py-1.5 px-4 text-xs font-semibold rounded-lg border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#E5E1DB' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddCat(true)}
            className="flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: '#1C4E80' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar tipo de atendimento
          </button>
        )}
      </section>

      {/* Conta e Segurança */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: '#E5E1DB' }}>
          <h3 className="text-lg font-semibold">Conta e Segurança</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* E-mail */}
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7A756E]">Alterar E-mail</p>
            <div>
              <label className="field-label">Novo E-mail</label>
              <input
                type="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 border border-[#E5E1DB] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
              Atualizar E-mail
            </button>
          </form>

          {/* Senha */}
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7A756E]">Alterar Senha</p>
            <div>
              <label className="field-label">Nova Senha</label>
              <input
                type="password"
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 border border-[#E5E1DB] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
              Atualizar Senha
            </button>
          </form>
        </div>
      </section>

      {/* Sessão */}
      <section className="pt-8 border-t" style={{ borderColor: '#E5E1DB' }}>
        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: '#F9F8F6' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Sair do dispositivo</p>
              <p className="text-xs text-gray-500">Encerra sua sessão atual de forma segura.</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-10">
          MedUp v1.0.0 • Desenvolvido com carinho para Rafaela
        </p>
      </section>
    </div>
  )
}
