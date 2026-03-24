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
  const [googleLoading, setGoogleLoading] = useState(false)

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

  async function handleGoogleLogin() {
    setLoginError('')
    setCadastroError('')
    setGoogleLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setLoginError('Erro ao conectar com Google.')
      setCadastroError('Erro ao conectar com Google.')
      setGoogleLoading(false)
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setCadastroError('')
    setCadastroLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
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

    if (data.session) {
      router.refresh()
      router.push('/')
      return
    }

    setCadastroSuccess(true)
    setCadastroLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Logo */}
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <h1
            className="text-4xl font-semibold tracking-tight"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'hsl(var(--primary))',
              letterSpacing: '-0.02em',
            }}
          >
            MedUp
          </h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Controle financeiro para médicos
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Tabs */}
          <div
            className="grid grid-cols-2"
            style={{ borderBottom: '1px solid hsl(var(--border))' }}
          >
            {(['login', 'cadastro'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="py-3 text-sm font-medium transition-colors"
                style={{
                  color: tab === t ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  borderBottom: tab === t ? '2px solid hsl(var(--primary))' : '2px solid transparent',
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
                  <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
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

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: 'hsl(var(--border))' }}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2" style={{ color: 'hsl(var(--muted-foreground))', backgroundColor: 'hsl(var(--background))' }}>
                      Ou continue com
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full py-2.5 px-4 border rounded-lg flex items-center justify-center gap-2 hover:bg-black/5 transition-colors font-medium text-sm"
                  style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                >
                  {googleLoading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Google
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
                      style={{ backgroundColor: '#E6F4ED', color: '#5A7A5C' }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                      Conta criada com sucesso!
                    </p>
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      Sua conta já está pronta para uso. Agora é só entrar!
                    </p>
                    <button
                      onClick={() => { setCadastroSuccess(false); setTab('login') }}
                      className="text-sm font-medium"
                      style={{ color: 'hsl(var(--primary))' }}
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
                        placeholder="Dr. João Silva"
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
                      <p className="text-sm rounded-lg px-3 py-2" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
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

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" style={{ borderColor: 'hsl(var(--border))' }}></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2" style={{ color: 'hsl(var(--muted-foreground))', backgroundColor: 'hsl(var(--background))' }}>
                          Ou continue com
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      className="w-full py-2.5 px-4 border rounded-lg flex items-center justify-center gap-2 hover:bg-black/5 transition-colors font-medium text-sm"
                      style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    >
                      {googleLoading ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      )}
                      Google
                    </button>
                  </form>
                )}
              </>
            )}

          </div>
        </div>

        {/* Rodapé */}
        <div className="flex flex-col items-center gap-2 mt-4 text-xs" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>
          <p>
            by{' '}
            <span className="font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Post Up — Ads &amp; Social
            </span>
          </p>
          <div className="flex gap-4">
            <a href="/privacidade" className="hover:underline" style={{ color: 'hsl(var(--muted-foreground))' }}>Política de Privacidade</a>
            <a href="/termos" className="hover:underline" style={{ color: 'hsl(var(--muted-foreground))' }}>Termos de Serviço</a>
          </div>
        </div>

      </div>
    </div>
  )
}
