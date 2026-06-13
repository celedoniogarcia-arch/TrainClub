import { useState } from 'react'
import { signInWithEmail, signUpWithEmail, signInWithGoogle, supabase } from './supabase.js'

const S = {
  page: {
    minHeight: '100dvh', background: '#f5f5f7', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px 20px', maxWidth: 430, margin: '0 auto',
  },
  card: {
    background: '#fff', borderRadius: 24, padding: '32px 24px',
    width: '100%', boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
  },
  input: {
    width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 16,
    border: '1.5px solid #e5e5ea', background: '#f9f9fb', outline: 'none',
    boxSizing: 'border-box', marginBottom: 12,
  },
  btnPrimary: {
    width: '100%', padding: '15px', borderRadius: 14, border: 'none',
    background: '#6366f1', color: '#fff', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', marginBottom: 12,
  },
  btnGoogle: {
    width: '100%', padding: '14px', borderRadius: 14, border: '1.5px solid #e5e5ea',
    background: '#fff', color: '#1c1c1e', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: 12,
  },
  link: {
    background: 'none', border: 'none', color: '#6366f1', fontSize: 14,
    fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
  },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
    padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 12,
  },
  success: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
    padding: '10px 14px', fontSize: 13, color: '#16a34a', marginBottom: 12,
  },
}

export default function AuthScreen() {
  const [modo, setModo] = useState('login')   // 'login' | 'registro' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  async function handleEmail(e) {
    e.preventDefault()
    if (!email || (!password && modo !== 'reset')) return
    setLoading(true); setError(null); setMensaje(null)
    try {
      if (modo === 'login') {
        await signInWithEmail(email, password)
        // onAuthStateChange en App.jsx detectará la sesión automáticamente
      } else if (modo === 'registro') {
        await signUpWithEmail(email, password)
        setMensaje('Cuenta creada. Revisa tu email para confirmarla antes de entrar.')
      } else if (modo === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setMensaje('Te hemos enviado un enlace para restablecer tu contraseña.')
      }
    } catch (err) {
      const msgs = {
        'Invalid login credentials': 'Email o contraseña incorrectos.',
        'Email not confirmed': 'Confirma tu email antes de entrar.',
        'User already registered': 'Ya existe una cuenta con ese email.',
        'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      }
      setError(msgs[err.message] || err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true); setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('No se pudo conectar con Google. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  const titulo = { login: 'Bienvenido', registro: 'Crear cuenta', reset: 'Recuperar contraseña' }[modo]
  const subtitulo = {
    login: 'Entra para ver las rutinas de tu familia',
    registro: 'Una cuenta para toda la familia',
    reset: 'Te enviaremos un enlace a tu email',
  }[modo]

  return (
    <div style={S.page}>
      {/* Logo / marca */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🏋️</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#1c1c1e' }}>MyFitnessClub</div>
        <div style={{ fontSize: 14, color: '#8e8e93', marginTop: 4 }}>Tu entrenador de familia</div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1c1c1e', marginBottom: 4 }}>{titulo}</div>
        <div style={{ fontSize: 14, color: '#8e8e93', marginBottom: 24 }}>{subtitulo}</div>

        {error && <div style={S.error}>⚠️ {error}</div>}
        {mensaje && <div style={S.success}>✅ {mensaje}</div>}

        <form onSubmit={handleEmail}>
          <input
            type="email" placeholder="tu@email.com" value={email}
            onChange={e => setEmail(e.target.value)} style={S.input}
            autoComplete="email" autoCapitalize="none"
          />
          {modo !== 'reset' && (
            <input
              type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password}
              onChange={e => setPassword(e.target.value)} style={S.input}
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
            />
          )}
          <button type="submit" style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? '...' : { login: 'Entrar', registro: 'Crear cuenta', reset: 'Enviar enlace' }[modo]}
          </button>
        </form>

        {modo === 'login' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#e5e5ea' }} />
              <span style={{ fontSize: 12, color: '#8e8e93' }}>o continúa con</span>
              <div style={{ flex: 1, height: 1, background: '#e5e5ea' }} />
            </div>
            <button onClick={handleGoogle} style={{ ...S.btnGoogle, opacity: loading ? 0.6 : 1 }} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
          </>
        )}

        {/* Links de navegación */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          {modo === 'login' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => { setModo('registro'); setError(null); setMensaje(null) }} style={S.link}>
                ¿No tienes cuenta? Crear una
              </button>
              <button onClick={() => { setModo('reset'); setError(null); setMensaje(null) }} style={{ ...S.link, color: '#8e8e93', fontSize: 13 }}>
                Olvidé mi contraseña
              </button>
            </div>
          )}
          {(modo === 'registro' || modo === 'reset') && (
            <button onClick={() => { setModo('login'); setError(null); setMensaje(null) }} style={S.link}>
              ← Volver al inicio de sesión
            </button>
          )}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#c7c7cc', marginTop: 24, textAlign: 'center' }}>
        Tus datos se guardan de forma segura.<br />No compartimos información con terceros.
      </div>
    </div>
  )
}
