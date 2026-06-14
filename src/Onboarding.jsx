import { useState } from 'react'

// Incrementa este número cada vez que quieras que la guía vuelva a aparecer
export const ONBOARDING_VERSION = 1

const TABS_NAV = [
  { id: 'entreno',  icon: '🏋️', label: 'Entreno'  },
  { id: 'datos',    icon: '📊',  label: 'Datos'    },
  { id: 'dieta',    icon: '🥗',  label: 'Dieta'    },
  { id: 'progreso', icon: '📈',  label: 'Progreso' },
]

const STEPS = [
  {
    icon: '🏋️',
    titulo: '¡Bienvenido a TrainClub!',
    texto: 'Tu entrenador personal en el bolsillo. En unos pasos rápidos te explicamos cómo sacar el máximo partido a la app desde el primer día.',
    tab: null,
    color: '#6366f1',
  },
  {
    icon: '📅',
    titulo: 'Tu rutina diaria',
    texto: 'En Entreno verás los ejercicios del día adaptados a tu objetivo. Toca cualquier ejercicio, mira la animación y registra tus series y pesos.',
    tab: 'entreno',
    color: '#6366f1',
    hint: 'Toca aquí cada día para entrenar',
  },
  {
    icon: '📊',
    titulo: 'Tus datos físicos',
    texto: 'En Datos guarda tu altura, peso, edad, sexo y objetivo. Con esa información la app adapta los ejercicios, cargas y series a ti.',
    tab: 'datos',
    color: '#f59e0b',
    hint: 'Rellena tu perfil para rutinas personalizadas',
  },
  {
    icon: '🥗',
    titulo: 'Plan de alimentación',
    texto: 'En Dieta la app calcula tus calorías y macros según tu objetivo. También encontrarás ideas de platos preparados para ganar músculo o perder grasa.',
    tab: 'dieta',
    color: '#f97316',
    hint: 'Calcula tu plan nutricional aquí',
  },
  {
    icon: '📈',
    titulo: 'Sigue tu progreso',
    texto: 'En Progreso verás gráficas de peso, volumen de entrenamiento y rachas semanales. Cuantos más datos registres, más útil se vuelve.',
    tab: 'progreso',
    color: '#10b981',
    hint: 'Tu evolución semana a semana',
  },
  {
    icon: '🚀',
    titulo: '¡Listo para empezar!',
    texto: 'Empieza registrando tu sesión de hoy. Cuanto más uses la app, más inteligente se vuelve tu entrenamiento. ¡A por ello!',
    tab: null,
    color: '#6366f1',
    cta: 'Empezar a entrenar',
  },
]

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0)
  const [saliendo, setSaliendo] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0
  const tabIdx = current.tab ? TABS_NAV.findIndex(t => t.id === current.tab) : -1

  function siguiente() {
    if (isLast) return finish()
    setStep(s => s + 1)
  }

  function anterior() {
    if (!isFirst) setStep(s => s - 1)
  }

  function finish() {
    setSaliendo(true)
    setTimeout(onFinish, 280)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: saliendo ? 0 : 1,
      transition: 'opacity 0.28s ease',
    }}>
      {/* Fondo oscuro */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} onClick={finish} />

      {/* Tarjeta central */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 430,
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 20px',
        paddingBottom: tabIdx >= 0 ? 110 : 20,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 24,
          padding: '32px 24px 28px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}>
          {/* Icono y título */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 54, lineHeight: 1, marginBottom: 12 }}>{current.icon}</div>
            <div style={{ fontSize: 21, fontWeight: 800, color: '#1c1c1e', lineHeight: 1.25 }}>
              {current.titulo}
            </div>
          </div>

          {/* Texto */}
          <div style={{ fontSize: 15, color: '#3c3c43', lineHeight: 1.65, textAlign: 'center', marginBottom: 26 }}>
            {current.texto}
          </div>

          {/* Puntos de progreso */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 22 }}>
            {STEPS.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} style={{
                width: i === step ? 22 : 7, height: 7,
                borderRadius: 4,
                background: i === step ? current.color : '#e5e5ea',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
              }} />
            ))}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!isFirst && (
              <button onClick={anterior} style={{
                flex: 1, padding: '13px', borderRadius: 14,
                background: '#f5f5f7', color: '#8e8e93',
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15,
              }}>← Atrás</button>
            )}
            <button onClick={siguiente} style={{
              flex: 2, padding: '14px', borderRadius: 14,
              background: current.color, color: '#fff',
              border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15,
              boxShadow: `0 4px 14px ${current.color}55`,
              transition: 'background 0.2s',
            }}>
              {isLast ? (current.cta || 'Empezar') : 'Siguiente →'}
            </button>
          </div>

          {/* Saltar */}
          {!isLast && (
            <button onClick={finish} style={{
              display: 'block', margin: '14px auto 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: '#aeaeb2', fontWeight: 500,
            }}>Saltar guía</button>
          )}
        </div>
      </div>

      {/* Flecha + nav resaltado cuando hay tab activa */}
      {tabIdx >= 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, zIndex: 2,
          pointerEvents: 'none',
        }}>
          {/* Flecha animada apuntando a la pestaña */}
          <div style={{
            position: 'absolute',
            bottom: 70,
            left: `calc(${(tabIdx + 0.5) * 25}% - 12px)`,
            fontSize: 22,
            animation: 'bounce 0.9s infinite',
          }}>👇</div>

          {/* Barra nav simulada con el tab resaltado */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid #e5e5ea',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
            {TABS_NAV.map((t, i) => (
              <div key={t.id} style={{
                flex: 1, padding: '10px 0 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                background: i === tabIdx ? `${current.color}15` : 'transparent',
                borderTop: i === tabIdx ? `2.5px solid ${current.color}` : '2.5px solid transparent',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: i === tabIdx ? 700 : 400,
                  color: i === tabIdx ? current.color : '#8e8e93',
                }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(7px); }
        }
      `}</style>
    </div>
  )
}
