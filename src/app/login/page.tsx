'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tab = 'login' | 'cadastro'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Cadastro
  const [cadastroNome, setCadastroNome] = useState('')
  const [cadastroEmail, setCadastroEmail] = useState('')
  const [cadastroPassword, setCadastroPassword] = useState('')
  const [cadastroError, setCadastroError] = useState('')
  const [cadastroSuccess, setCadastroSuccess] = useState(false)
  const [cadastroLoading, setCadastroLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (error) {
      setLoginError('Email ou senha incorretos.')
      setLoginLoading(false)
      return
    }

    router.refresh()
    router.push('/')
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setCadastroError('')
    setCadastroLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: cadastroEmail,
      password: cadastroPassword,
      options: {
        data: { full_name: cadastroNome },
      },
    })

    if (error) {
      setCadastroError(error.message === 'User already registered'
        ? 'Este email já está cadastrado.'
        : 'Erro ao criar conta. Tente novamente.')
      setCadastroLoading(false)
      return
    }

    setCadastroSuccess(true)
    setCadastroLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--surface-base)' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Logo */}
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: 'var(--wine)', color: '#fff' }}
          >
            {/* Ícone de pulso médico + seta up */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <h1
            className="text-4xl font-semibold tracking-tight"
            style={{
              fontFamily: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
              color: 'var(--wine)',
              letterSpacing: '-0.02em',
            }}
          >
            MedUp
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>
            Controle financeiro para médicos
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Tabs */}
          <div
            className="grid grid-cols-2"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {(['login', 'cadastro'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="py-3 text-sm font-medium transition-colors"
                style={{
                  color: tab === t ? 'var(--wine)' : 'var(--ink-light)',
                  borderBottom: tab === t ? '2px solid var(--wine)' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  marginBottom: '-1px',
                }}
              >
                {t === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <div style={{ padding: '1.5rem' }}>

            {/* ===== LOGIN ===== */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="field-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="field"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="field-label">Senha</label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="field"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                {loginError && (
                  <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#9B1D3E', backgroundColor: '#F8E5EB' }}>
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-primary w-full mt-2"
                >
                  {loginLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </button>
              </form>
            )}

            {/* ===== CADASTRO ===== */}
            {tab === 'cadastro' && (
              <>
                {cadastroSuccess ? (
                  <div className="text-center py-4 space-y-3">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full"
                      style={{ backgroundColor: '#E6F4ED', color: 'var(--forest)' }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                      Conta criada com sucesso!
                    </p>
                    <p className="text-xs" style={{ color: 'var(--ink-light)' }}>
                      Verifique seu email para confirmar o cadastro e então faça login.
                    </p>
                    <button
                      onClick={() => { setCadastroSuccess(false); setTab('login') }}
                      className="text-sm font-medium"
                      style={{ color: 'var(--wine)' }}
                    >
                      Ir para o login →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCadastro} className="space-y-4">
                    <div>
                      <label htmlFor="nome" className="field-label">Nome completo</label>
                      <input
                        id="nome"
                        type="text"
                        autoComplete="name"
                        required
                        className="field"
                        placeholder="Dra. Maria Silva"
                        value={cadastroNome}
                        onChange={(e) => setCadastroNome(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="cadastro-email" className="field-label">Email</label>
                      <input
                        id="cadastro-email"
                        type="email"
                        autoComplete="email"
                        required
                        className="field"
                        placeholder="seu@email.com"
                        value={cadastroEmail}
                        onChange={(e) => setCadastroEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="cadastro-password" className="field-label">Senha</label>
                      <input
                        id="cadastro-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        className="field"
                        placeholder="Mínimo 6 caracteres"
                        value={cadastroPassword}
                        onChange={(e) => setCadastroPassword(e.target.value)}
                      />
                    </div>

                    {cadastroError && (
                      <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#9B1D3E', backgroundColor: '#F8E5EB' }}>
                        {cadastroError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={cadastroLoading}
                      className="btn-primary w-full mt-2"
                    >
                      {cadastroLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                          Criando conta...
                        </>
                      ) : 'Criar conta'}
                    </button>
                  </form>
                )}
              </>
            )}

          </div>
        </div>

        {/* Rodapé Post Up */}
        <p className="text-center text-xs" style={{ color: 'var(--ink-faint)' }}>
          by{' '}
          <span className="font-medium" style={{ color: 'var(--ink-light)' }}>
            Post Up — Ads &amp; Social
          </span>
        </p>

      </div>
    </div>
  )
}
