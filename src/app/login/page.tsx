'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Spinner from '@/components/ui/Spinner'

type Tab = 'login' | 'cadastro'

const NAVY = '#0D1B3E'
const BLUE = '#1C4E80'

function MedUpLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.2 : 1
  const w = Math.round(220 * scale)
  return (
    <img
      src="/logo.png"
      alt="MedUp"
      width={w}
      style={{ maxWidth: '100%' }}
    />
  )
}


function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function Footer({ dark }: { dark?: boolean }) {
  const muted = dark ? 'rgba(255,255,255,0.4)' : '#9CA3AF'
  const link = dark ? 'rgba(255,255,255,0.6)' : '#6B7280'
  return (
    <div style={{ textAlign: 'center', fontSize: 12 }}>
      <p style={{ color: muted, marginBottom: 4 }}>
        by{' '}
        <span style={{ color: dark ? 'rgba(255,255,255,0.7)' : '#374151', fontWeight: 500 }}>
          Post Up — Ads &amp; Social
        </span>
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <a href="/privacidade" style={{ color: link, textDecoration: 'none' }}>
          Política de Privacidade
        </a>
        <a href="/termos" style={{ color: link, textDecoration: 'none' }}>
          Termos de Serviço
        </a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showCadastroPassword, setShowCadastroPassword] = useState(false)
  const [showCadastroConfirm, setShowCadastroConfirm] = useState(false)

  // Cadastro
  const [cadastroNome, setCadastroNome] = useState('')
  const [cadastroEmail, setCadastroEmail] = useState('')
  const [cadastroPassword, setCadastroPassword] = useState('')
  const [cadastroConfirm, setCadastroConfirm] = useState('')
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
    if (cadastroPassword !== cadastroConfirm) {
      setCadastroError('As senhas não coincidem.')
      setCadastroLoading(false)
      return
    }
    setCadastroLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: cadastroEmail,
      password: cadastroPassword,
      options: { data: { full_name: cadastroNome } },
    })
    if (error) {
      setCadastroError(
        error.message === 'User already registered'
          ? 'Este email já está cadastrado.'
          : 'Erro ao criar conta. Tente novamente.'
      )
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 8,
    border: '1px solid #E5E1DB',
    backgroundColor: '#F5F5F4',
    padding: '10px 14px',
    fontSize: 15,
    color: NAVY,
    outline: 'none',
    minHeight: 44,
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: NAVY,
    marginBottom: 6,
  }

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    backgroundColor: BLUE,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '13px 20px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
  }

  const btnGoogle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#FFFFFF',
    color: NAVY,
    border: '1px solid #E5E1DB',
    borderRadius: 8,
    padding: '11px 20px',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
  }

  const errorBox = (msg: string) => (
    <p style={{
      fontSize: 13,
      color: '#b91c1c',
      backgroundColor: '#fee2e2',
      borderRadius: 6,
      padding: '8px 12px',
    }}>
      {msg}
    </p>
  )

  const dividerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '4px 0',
  }

  function LoginForm() {
    return (
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            placeholder="seu@email.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Senha</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showLoginPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
            >
              {showLoginPassword
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </div>
        {loginError && errorBox(loginError)}
        <button type="submit" disabled={loginLoading} style={{ ...btnPrimary, opacity: loginLoading ? 0.6 : 1 }}>
          {loginLoading ? <><Spinner /> Entrando...</> : 'Entrar'}
        </button>
        <div style={dividerStyle}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E5E1DB' }} />
          <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>ou continue com</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E5E1DB' }} />
        </div>
        <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} style={{ ...btnGoogle, opacity: googleLoading ? 0.6 : 1 }}>
          {googleLoading ? <Spinner /> : <GoogleIcon />}
          Google
        </button>
      </form>
    )
  }

  function CadastroForm() {
    if (cadastroSuccess) {
      return (
        <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#E6F4ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D5E3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ fontWeight: 500, color: NAVY, fontSize: 15 }}>Conta criada com sucesso!</p>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: '1.5' }}>
            Enviamos um e-mail de confirmação para <strong>{cadastroEmail}</strong>. Acesse sua caixa de entrada e clique no link para ativar sua conta.
          </p>
          <button
            onClick={() => { setCadastroSuccess(false); setTab('login') }}
            style={{ fontSize: 14, fontWeight: 500, color: BLUE, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Ir para o login →
          </button>
        </div>
      )
    }
    return (
      <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Nome completo</label>
          <input
            type="text"
            autoComplete="name"
            required
            placeholder="Dra. Ana Silva"
            value={cadastroNome}
            onChange={(e) => setCadastroNome(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            placeholder="seu@email.com"
            value={cadastroEmail}
            onChange={(e) => setCadastroEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Senha</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showCadastroPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              value={cadastroPassword}
              onChange={(e) => setCadastroPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowCadastroPassword(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
            >
              {showCadastroPassword
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Confirmar senha</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showCadastroConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Repita a senha"
              value={cadastroConfirm}
              onChange={(e) => setCadastroConfirm(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowCadastroConfirm(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
            >
              {showCadastroConfirm
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </div>
        {cadastroError && errorBox(cadastroError)}
        <button type="submit" disabled={cadastroLoading} style={{ ...btnPrimary, opacity: cadastroLoading ? 0.6 : 1 }}>
          {cadastroLoading ? <><Spinner /> Criando conta...</> : 'Criar conta'}
        </button>
        <div style={dividerStyle}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E5E1DB' }} />
          <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>ou continue com</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#E5E1DB' }} />
        </div>
        <button type="button" onClick={handleGoogleLogin} disabled={googleLoading} style={{ ...btnGoogle, opacity: googleLoading ? 0.6 : 1 }}>
          {googleLoading ? <Spinner /> : <GoogleIcon />}
          Google
        </button>
      </form>
    )
  }

  const card = (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      width: '100%',
      maxWidth: 380,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    }}>
      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid #E5E1DB',
      }}>
        {(['login', 'cadastro'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '14px',
              fontSize: 14,
              fontWeight: 500,
              color: tab === t ? BLUE : '#9CA3AF',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: tab === t ? `2px solid ${BLUE}` : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={{ padding: 24 }}>
        {tab === 'login' ? LoginForm() : CadastroForm()}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#F7F6F3' }}>

      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex" style={{
        width: '43%',
        flexShrink: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '64px 48px',
        backgroundColor: '#F7F6F3',
      }}>
        <div />
        <MedUpLogo size="lg" />
        <Footer />
      </div>

      {/* ── Right panel ── */}
      <div
        className="login-dark-panel lg:relative lg:justify-center"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '48px 24px',
          gap: 32,
        }}
      >
        {/* Logo (mobile only) */}
        <div className="lg:hidden">
          <MedUpLogo size="md" />
        </div>

        {/* Card */}
        <div style={{ width: '100%', maxWidth: 380 }}>
          {card}
        </div>

        {/* Footer mobile */}
        <div className="lg:hidden" style={{ marginTop: 'auto', textAlign: 'center' }}>
          <Footer />
        </div>

        {/* Footer desktop — absolute bottom */}
        <div className="hidden lg:block" style={{ position: 'absolute', bottom: 32, textAlign: 'center' }}>
          <Footer dark />
        </div>
      </div>

    </div>
  )
}
