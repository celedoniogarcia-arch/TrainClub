import { useState, useEffect } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const MUSCLE_GROUPS = {
  PECHO: "#e74c3c",
  ESPALDA: "#2ecc71",
  PIERNA: "#f39c12",
  HOMBRO: "#9b59b6",
  BICEPS: "#3498db",
  TRICEPS: "#e67e22",
  CORE: "#1abc9c",
  FULL: "#e74c3c",
};

const EXERCISE_IMAGES = {
  "Press banca plano": "https://www.bodybuilding.com/images/2016/june/5-tips-for-a-bigger-bench-press-header-v2-830x467.jpg",
  "Press inclinado mancuernas": "https://images.squarespace-cdn.com/content/v1/5a5e42e7b7411c123a99bf42/1594234444398-HZAQ5WXEQ5RPVHSQJHG7/incline+dumbbell+press.jpg",
};

const ROUTINES = {
  Lunes: {
    label: "Lunes",
    focus: "Pecho + Tríceps",
    color: "#e74c3c",
    bg: "#fdf2f2",
    cardio: "Caminata inclinada en cinta – 10 min (ritmo rápido)",
    exercises: [
      { name: "Press banca plano", muscles: "Pecho (fibras medias)", sets: 4, reps: "6–8", emoji: "🏋️" },
      { name: "Press inclinado mancuernas", muscles: "Pecho (parte superior)", sets: 3, reps: "8–10", emoji: "💪" },
      { name: "Fondos asistidos", muscles: "Pecho inferior y tríceps", sets: 3, reps: "8–10", emoji: "⬇️" },
      { name: "Aperturas en polea", muscles: "Aislamiento de pecho", sets: 3, reps: "12", emoji: "🔀" },
      { name: "Extensión tríceps en polea", muscles: "Tríceps (cabeza lateral)", sets: 3, reps: "12", emoji: "📏" },
      { name: "Press francés", muscles: "Tríceps (cabeza larga)", sets: 2, reps: "12", emoji: "🥐" },
    ],
  },
  Martes: {
    label: "Martes",
    focus: "Espalda + Bíceps",
    color: "#27ae60",
    bg: "#f2fdf5",
    cardio: "Bicicleta – HIIT 10–12 min (30 seg fuerte / 60 seg suave)",
    exercises: [
      { name: "Jalón al pecho", muscles: "Dorsal ancho (espalda)", sets: 4, reps: "8", emoji: "⬇️" },
      { name: "Remo con barra", muscles: "Espesor de espalda", sets: 4, reps: "8", emoji: "🚣" },
      { name: "Remo sentado en polea", muscles: "Espalda media", sets: 3, reps: "10", emoji: "🧲" },
      { name: "Jalón agarre estrecho", muscles: "Dorsal y bíceps", sets: 3, reps: "10", emoji: "🤏" },
      { name: "Curl con barra", muscles: "Bíceps (cabeza larga)", sets: 3, reps: "10", emoji: "💪" },
      { name: "Curl martillo", muscles: "Bíceps (braquial)", sets: 2, reps: "12", emoji: "🔨" },
    ],
  },
  Miércoles: {
    label: "Miércoles",
    focus: "Pierna Completa",
    color: "#f39c12",
    bg: "#fdf9f2",
    cardio: "Caminata inclinada – 10 min (moderado)",
    exercises: [
      { name: "Sentadilla", muscles: "Cuádriceps, glúteos", sets: 4, reps: "6–8", emoji: "🦵" },
      { name: "Prensa", muscles: "Cuádriceps, glúteos", sets: 4, reps: "10", emoji: "⬛" },
      { name: "Peso muerto rumano", muscles: "Isquiotibiales, glúteos", sets: 3, reps: "10", emoji: "🏋️" },
      { name: "Curl femoral", muscles: "Isquiotibiales", sets: 3, reps: "12", emoji: "🦿" },
      { name: "Extensión cuádriceps", muscles: "Cuádriceps (aislado)", sets: 3, reps: "12", emoji: "📐" },
      { name: "Gemelos de pie", muscles: "Gemelos (pantorrillas)", sets: 4, reps: "15", emoji: "🦶" },
    ],
  },
  Jueves: {
    label: "Jueves",
    focus: "Hombro + Core",
    color: "#9b59b6",
    bg: "#f9f2fd",
    cardio: "Remo o elíptica – 10 min (suave)",
    exercises: [
      { name: "Press militar", muscles: "Hombros (cabeza frontal)", sets: 4, reps: "8", emoji: "🪖" },
      { name: "Elevaciones laterales", muscles: "Hombros (cabeza lateral)", sets: 4, reps: "12", emoji: "↔️" },
      { name: "Pájaros posteriores", muscles: "Hombros (posterior)", sets: 3, reps: "12", emoji: "🐦" },
      { name: "Face pull", muscles: "Deltoides posterior", sets: 3, reps: "12", emoji: "😤" },
      { name: "Encogimientos trapecio", muscles: "Trapecio", sets: 3, reps: "12", emoji: "🤷" },
      { name: "Plancha", muscles: "Core (isométrico)", sets: 3, reps: "45 seg", emoji: "📏" },
      { name: "Crunch en polea", muscles: "Abdomen", sets: 3, reps: "15", emoji: "🔁" },
      { name: "Elevación de piernas", muscles: "Abdomen inferior", sets: 3, reps: "12", emoji: "🦵" },
    ],
  },
  Viernes: {
    label: "Viernes",
    focus: "Full Body Metabólico",
    color: "#e67e22",
    bg: "#fdf5f2",
    cardio: "Caminata rápida – 10 min",
    isCircuit: true,
    circuits: 4,
    exercises: [
      { name: "Sentadilla goblet", muscles: "Cuádriceps, glúteos", sets: 4, reps: "12", emoji: "🏆" },
      { name: "Press mancuernas", muscles: "Pecho y hombros", sets: 4, reps: "12", emoji: "💪" },
      { name: "Remo mancuerna", muscles: "Espalda", sets: 4, reps: "12", emoji: "🚣" },
      { name: "Peso muerto kettlebell", muscles: "Cadena posterior", sets: 4, reps: "12", emoji: "🏋️" },
      { name: "Burpees", muscles: "Full body", sets: 4, reps: "10", emoji: "🔥" },
      { name: "Plancha", muscles: "Core", sets: 4, reps: "45 seg", emoji: "📏" },
    ],
  },
};

const DAYS_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function getTodayKey() {
  const d = new Date().getDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat
  const map = { 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes" };
  return map[d] || "Lunes";
}

function calcDiet(weight, targetWeight, heightCm, age, goal) {
  // Harris-Benedict BMR (male assumed; can extend)
  const bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
  const tdee = bmr * 1.55; // moderately active
  let calories, protein, carbs, fat;
  if (goal === "perder") {
    calories = Math.round(tdee - 400);
  } else if (goal === "ganar") {
    calories = Math.round(tdee + 300);
  } else {
    calories = Math.round(tdee);
  }
  protein = Math.round(weight * 2); // 2g/kg
  fat = Math.round((calories * 0.25) / 9);
  carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return { calories, protein, carbs, fat };
}

// ─── STORAGE HELPERS ────────────────────────────────────────────────────────

function load(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function Badge({ color, children }) {
  return (
    <span style={{
      background: color + "20", color, border: `1px solid ${color}40`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5
    }}>{children}</span>
  );
}

function ExerciseRow({ ex, dayKey, exIdx, weights, onWeightChange }) {
  const key = `${dayKey}-${exIdx}`;
  const [expanded, setExpanded] = useState(false);
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayWeight = weights[key]?.[todayDate] || "";
  const history = weights[key] ? Object.entries(weights[key]).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 5) : [];
  const best = history.length ? Math.max(...history.map(([, v]) => parseFloat(v) || 0)) : 0;

  return (
    <div style={{
      background: "#fff", borderRadius: 12, marginBottom: 8,
      border: "1px solid #f0f0f0", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", alignItems: "center", padding: "12px 14px", cursor: "pointer", gap: 10 }}
      >
        <span style={{ fontSize: 20 }}>{ex.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{ex.name}</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{ex.muscles}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "#555" }}>
          <div style={{ fontWeight: 700 }}>{ex.sets} × {ex.reps}</div>
          {best > 0 && <div style={{ color: "#27ae60", fontSize: 11 }}>🏆 {best}kg</div>}
        </div>
        <span style={{ color: "#bbb", fontSize: 16, marginLeft: 4 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f5f5f5" }}>
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              placeholder="kg hoy"
              value={todayWeight}
              onClick={e => e.stopPropagation()}
              onChange={e => onWeightChange(key, todayDate, e.target.value)}
              style={{
                width: 90, padding: "8px 10px", border: "1.5px solid #e0e0e0",
                borderRadius: 8, fontSize: 14, outline: "none"
              }}
            />
            <span style={{ fontSize: 13, color: "#666" }}>kg · hoy</span>
          </div>

          {history.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Historial</div>
              {history.map(([date, w]) => (
                <div key={date} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 12, color: "#555", padding: "3px 0", borderBottom: "1px solid #f5f5f5"
                }}>
                  <span>{date}</span>
                  <span style={{ fontWeight: 700 }}>{w} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutTab({ weights, setWeights }) {
  const [activeDay, setActiveDay] = useState(getTodayKey());
  const routine = ROUTINES[activeDay];

  function handleWeightChange(key, date, val) {
    setWeights(prev => {
      const next = { ...prev, [key]: { ...(prev[key] || {}), [date]: val } };
      save("fw_weights", next);
      return next;
    });
  }

  return (
    <div>
      {/* Day selector */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {DAYS_ORDER.map(day => {
          const r = ROUTINES[day];
          const isActive = day === activeDay;
          return (
            <button key={day} onClick={() => setActiveDay(day)} style={{
              padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              background: isActive ? r.color : "#f5f5f5",
              color: isActive ? "#fff" : "#555",
              fontWeight: isActive ? 700 : 500, fontSize: 13,
              whiteSpace: "nowrap", transition: "all 0.15s"
            }}>
              {day.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div style={{
        background: routine.bg, borderRadius: 14, padding: "14px 16px",
        marginBottom: 14, borderLeft: `4px solid ${routine.color}`
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: routine.color }}>{routine.label}</div>
        <div style={{ fontSize: 14, color: "#555", marginTop: 2 }}>{routine.focus}</div>
        {routine.isCircuit && (
          <Badge color={routine.color}>Circuito · {routine.circuits} vueltas · 2 min descanso</Badge>
        )}
      </div>

      {/* Exercises */}
      {routine.exercises.map((ex, i) => (
        <ExerciseRow
          key={i} ex={ex} dayKey={activeDay} exIdx={i}
          weights={weights} onWeightChange={handleWeightChange}
        />
      ))}

      {/* Cardio */}
      <div style={{
        background: "#f8f9fa", borderRadius: 12, padding: "12px 14px",
        marginTop: 4, display: "flex", gap: 10, alignItems: "center"
      }}>
        <span style={{ fontSize: 20 }}>🏃</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5 }}>Cardio final</div>
          <div style={{ fontSize: 13, color: "#444", marginTop: 2 }}>{routine.cardio}</div>
        </div>
      </div>
    </div>
  );
}

function WeightTab({ bodyWeights, setBodyWeights }) {
  const [input, setInput] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  function addWeight() {
    if (!input) return;
    const next = [...bodyWeights, { date: today, weight: parseFloat(input) }]
      .sort((a, b) => a.date.localeCompare(b.date));
    setBodyWeights(next);
    save("fw_body", next);
    setInput("");
  }

  const sorted = [...bodyWeights].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0]?.weight;
  const first = [...bodyWeights].sort((a, b) => a.date.localeCompare(b.date))[0]?.weight;
  const diff = last && first ? (last - first).toFixed(1) : null;

  return (
    <div>
      <div style={{
        background: "linear-gradient(135deg, #667eea20, #764ba220)",
        borderRadius: 16, padding: 20, marginBottom: 16, textAlign: "center"
      }}>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Peso actual</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: "#1a1a2e" }}>
          {last ? `${last} kg` : "—"}
        </div>
        {diff !== null && (
          <div style={{ fontSize: 14, color: parseFloat(diff) < 0 ? "#27ae60" : "#e74c3c", marginTop: 4 }}>
            {parseFloat(diff) < 0 ? "▼" : "▲"} {Math.abs(diff)} kg desde el inicio
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="number"
          placeholder="Tu peso hoy (kg)"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            flex: 1, padding: "12px 14px", border: "1.5px solid #e0e0e0",
            borderRadius: 10, fontSize: 15, outline: "none"
          }}
        />
        <button onClick={addWeight} style={{
          background: "#1a1a2e", color: "#fff", border: "none",
          borderRadius: 10, padding: "0 20px", fontWeight: 700, cursor: "pointer", fontSize: 15
        }}>+</button>
      </div>

      {/* Mini chart */}
      {bodyWeights.length > 1 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Evolución</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
            {bodyWeights.slice(-14).map((entry, i, arr) => {
              const min = Math.min(...arr.map(e => e.weight));
              const max = Math.max(...arr.map(e => e.weight));
              const range = max - min || 1;
              const h = Math.max(8, ((entry.weight - min) / range) * 50 + 10);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{
                    width: "100%", height: h, background: "#1a1a2e",
                    borderRadius: "4px 4px 0 0", opacity: 0.7 + (i / arr.length) * 0.3
                  }} />
                  {i % 4 === 0 && <div style={{ fontSize: 9, color: "#bbb" }}>{entry.date.slice(5)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History list */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        {sorted.slice(0, 10).map((entry, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", borderBottom: i < 9 ? "1px solid #f5f5f5" : "none"
          }}>
            <span style={{ fontSize: 13, color: "#666" }}>{entry.date}</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{entry.weight} kg</span>
          </div>
        ))}
        {bodyWeights.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#bbb", fontSize: 14 }}>
            Añade tu primer peso 👆
          </div>
        )}
      </div>
    </div>
  );
}

function DietTab({ bodyWeights }) {
  const [profile, setProfile] = useState(() => load("fw_profile", {
    height: 175, age: 30, target: 75, goal: "perder"
  }));
  const [saved, setSaved] = useState(true);

  const currentWeight = [...bodyWeights].sort((a, b) => b.date.localeCompare(a.date))[0]?.weight || 75;

  function updateProfile(field, val) {
    setProfile(p => ({ ...p, [field]: val }));
    setSaved(false);
  }

  function saveProfile() {
    save("fw_profile", profile);
    setSaved(true);
  }

  const diet = calcDiet(currentWeight, profile.target, profile.height, profile.age, profile.goal);
  const weightDiff = (currentWeight - profile.target).toFixed(1);

  const meals = [
    { time: "08:00", label: "Entreno (ayunas)", items: ["Agua", "Café negro (opcional)"], cal: 0 },
    { time: "09:00", label: "Post-entreno", items: [`Proteína: ${Math.round(diet.protein * 0.3)}g`, `Carbos: ${Math.round(diet.carbs * 0.35)}g`, "Ej: Pollo 150g + arroz 80g + fruta"] , cal: Math.round(diet.calories * 0.35) },
    { time: "13:00", label: "Comida principal", items: [`Proteína: ${Math.round(diet.protein * 0.35)}g`, `Carbos: ${Math.round(diet.carbs * 0.35)}g`, `Grasa: ${Math.round(diet.fat * 0.4)}g`, "Ej: Salmón + patata + ensalada + AOVE"], cal: Math.round(diet.calories * 0.35) },
    { time: "17:00", label: "Merienda", items: [`Proteína: ${Math.round(diet.protein * 0.15)}g`, "Ej: Queso cottage + fruta o yogur griego"], cal: Math.round(diet.calories * 0.15) },
    { time: "22:00", label: "Cena", items: [`Proteína: ${Math.round(diet.protein * 0.2)}g`, `Grasa: ${Math.round(diet.fat * 0.4)}g`, "Ej: Huevos + verduras salteadas + aguacate"], cal: Math.round(diet.calories * 0.15) },
  ];

  const goalLabels = { perder: "Perder grasa", ganar: "Ganar músculo", mantener: "Recomposición" };

  return (
    <div>
      {/* Profile card */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0", padding: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Tu perfil</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Talla (cm)", field: "height", type: "number" },
            { label: "Edad", field: "age", type: "number" },
            { label: "Peso objetivo (kg)", field: "target", type: "number" },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{label}</div>
              <input
                type={type}
                value={profile[field]}
                onChange={e => updateProfile(field, parseFloat(e.target.value))}
                style={{
                  width: "100%", padding: "8px 10px", border: "1.5px solid #e8e8e8",
                  borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none"
                }}
              />
            </div>
          ))}
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>Objetivo</div>
            <select
              value={profile.goal}
              onChange={e => updateProfile("goal", e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", border: "1.5px solid #e8e8e8",
                borderRadius: 8, fontSize: 14, outline: "none", background: "#fff"
              }}
            >
              <option value="perder">Perder grasa</option>
              <option value="ganar">Ganar músculo</option>
              <option value="mantener">Recomposición</option>
            </select>
          </div>
        </div>
        <button onClick={saveProfile} style={{
          marginTop: 12, background: saved ? "#f5f5f5" : "#1a1a2e",
          color: saved ? "#aaa" : "#fff", border: "none", borderRadius: 8,
          padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, width: "100%"
        }}>
          {saved ? "✓ Guardado" : "Guardar perfil"}
        </button>
      </div>

      {/* Macros summary */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        borderRadius: 14, padding: 16, marginBottom: 14, color: "#fff"
      }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{goalLabels[profile.goal]} · Peso actual {currentWeight}kg → {profile.target}kg</div>
        <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>{diet.calories} kcal/día</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Proteína", val: diet.protein, unit: "g", color: "#e74c3c" },
            { label: "Carbos", val: diet.carbs, unit: "g", color: "#f39c12" },
            { label: "Grasa", val: diet.fat, unit: "g", color: "#3498db" },
          ].map(({ label, val, unit, color }) => (
            <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color }}>{val}{unit}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal plan */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Plan de comidas</div>
      {meals.map((meal, i) => (
        <div key={i} style={{
          background: "#fff", borderRadius: 12, padding: "13px 14px",
          marginBottom: 8, border: "1px solid #f0f0f0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 12, color: "#aaa", fontWeight: 700 }}>{meal.time}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginLeft: 8 }}>{meal.label}</span>
            </div>
            {meal.cal > 0 && <Badge color="#667eea">~{meal.cal} kcal</Badge>}
          </div>
          {meal.items.map((item, j) => (
            <div key={j} style={{ fontSize: 13, color: "#666", padding: "2px 0" }}>· {item}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProgressTab({ weights, bodyWeights }) {
  const totalSessions = new Set(
    Object.entries(weights).flatMap(([, dates]) => Object.keys(dates))
  ).size;

  const PRs = Object.entries(weights).map(([key, dates]) => {
    const parts = key.split("-");
    const dayKey = parts[0];
    const exIdx = parseInt(parts[1]);
    const ex = ROUTINES[dayKey]?.exercises[exIdx];
    if (!ex) return null;
    const best = Math.max(...Object.values(dates).map(v => parseFloat(v) || 0));
    if (!best) return null;
    return { name: ex.name, day: dayKey, best };
  }).filter(Boolean).sort((a, b) => b.best - a.best).slice(0, 8);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Sesiones registradas", val: totalSessions, icon: "📅" },
          { label: "Ejercicios con datos", val: PRs.length, icon: "📊" },
          { label: "Peso inicial", val: bodyWeights.sort((a,b) => a.date.localeCompare(b.date))[0]?.weight ? `${bodyWeights.sort((a,b) => a.date.localeCompare(b.date))[0].weight}kg` : "—", icon: "⚖️" },
          { label: "Peso actual", val: bodyWeights.sort((a,b) => b.date.localeCompare(a.date))[0]?.weight ? `${bodyWeights.sort((a,b) => b.date.localeCompare(a.date))[0].weight}kg` : "—", icon: "🎯" },
        ].map(({ label, val, icon }) => (
          <div key={label} style={{
            background: "#fff", borderRadius: 12, padding: 14,
            border: "1px solid #f0f0f0", textAlign: "center"
          }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#1a1a2e", marginTop: 4 }}>{val}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Tus mejores marcas 🏆</div>
      {PRs.length === 0 ? (
        <div style={{ textAlign: "center", color: "#bbb", fontSize: 14, padding: 30 }}>
          Empieza a registrar pesos para ver tus marcas
        </div>
      ) : (
        PRs.map((pr, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 12, padding: "12px 14px",
            marginBottom: 8, border: "1px solid #f0f0f0",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{pr.name}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{pr.day}</div>
            </div>
            <div style={{
              background: "#fff9e6", color: "#f39c12",
              border: "1px solid #f39c1240", borderRadius: 8,
              padding: "6px 12px", fontWeight: 800, fontSize: 15
            }}>
              {pr.best} kg
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("workout");
  const [weights, setWeights] = useState(() => load("fw_weights", {}));
  const [bodyWeights, setBodyWeights] = useState(() => load("fw_body", []));

  const tabs = [
    { id: "workout", label: "Entreno", icon: "🏋️" },
    { id: "weight", label: "Peso", icon: "⚖️" },
    { id: "diet", label: "Dieta", icon: "🥗" },
    { id: "progress", label: "Progreso", icon: "📈" },
  ];

  return (
    <div style={{
      maxWidth: 480, margin: "0 auto", minHeight: "100vh",
      background: "#f8f9fb", fontFamily: "'Inter', -apple-system, sans-serif",
      paddingBottom: 80
    }}>
      {/* Header */}
      <div style={{
        background: "#1a1a2e", color: "#fff",
        padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase" }}>
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, marginTop: 2 }}>Mi Entrenamiento</div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 0" }}>
        {tab === "workout" && <WorkoutTab weights={weights} setWeights={setWeights} />}
        {tab === "weight" && <WeightTab bodyWeights={bodyWeights} setBodyWeights={setBodyWeights} />}
        {tab === "diet" && <DietTab bodyWeights={bodyWeights} />}
        {tab === "progress" && <ProgressTab weights={weights} bodyWeights={bodyWeights} />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "#fff", borderTop: "1px solid #f0f0f0",
        display: "flex", padding: "8px 0 4px"
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            padding: "6px 0", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 2
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? "#1a1a2e" : "#bbb",
              letterSpacing: 0.3
            }}>{t.label}</span>
            {tab === t.id && (
              <div style={{ width: 4, height: 4, background: "#1a1a2e", borderRadius: 2 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
