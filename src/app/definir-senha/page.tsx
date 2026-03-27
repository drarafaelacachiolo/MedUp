'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Spinner from '@/components/ui/Spinner'

const NAVY = '#0D1B3E'
const BLUE = '#1C4E80'

export default function DefinirSenhaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    })

    if (updateError) {
      setError('Erro ao definir senha. Tente novamente.')
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/')
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

  const EyeIcon = ({ visible }: { visible: boolean }) => visible
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7F6F3',
      padding: '24px',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '28px 24px 0' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            backgroundColor: '#EBF2FA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: 0 }}>Defina sua senha</p>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
            Por segurança, crie uma senha pessoal para acessar sua conta.
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 6 }}>
                Nova senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: NAVY, marginBottom: 6 }}>
                Confirmar senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
                >
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#b91c1c', backgroundColor: '#fee2e2', borderRadius: 6, padding: '8px 12px', margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', backgroundColor: BLUE, color: '#FFFFFF', border: 'none',
                borderRadius: 8, padding: '13px 20px', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, minHeight: 48, marginTop: 4, opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? <><Spinner /> Salvando...</> : 'Salvar senha e entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
