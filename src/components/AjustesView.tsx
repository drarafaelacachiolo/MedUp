'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/app/(dashboard)/LogoutButton'

interface Profile {
  full_name: string | null
  crm: string | null
  especialidade: string | null
  banco_padrao: string | null
}

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
              placeholder="Ex: Dra. Rafaela"
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
                 <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
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
