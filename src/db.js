import { supabase } from './supabase.js'

// ─── PERFILES ────────────────────────────────────────────────────────────────

export async function getProfiles() {
  if (!supabase) return JSON.parse(localStorage.getItem('rg_users') || '[]')
  const { data, error } = await supabase.from('rg_profiles').select('*').order('created_at')
  if (error) return JSON.parse(localStorage.getItem('rg_users') || '[]')
  localStorage.setItem('rg_users', JSON.stringify(data))
  return data
}

export async function upsertProfile(profile) {
  const users = JSON.parse(localStorage.getItem('rg_users') || '[]')
  const updated = users.some(u => u.id === profile.id)
    ? users.map(u => u.id === profile.id ? profile : u)
    : [...users, profile]
  localStorage.setItem('rg_users', JSON.stringify(updated))
  if (!supabase) return
  await supabase.from('rg_profiles').upsert({ ...profile, updated_at: new Date().toISOString() })
}

export async function deleteProfile(id) {
  const users = JSON.parse(localStorage.getItem('rg_users') || '[]')
  localStorage.setItem('rg_users', JSON.stringify(users.filter(u => u.id !== id)))
  if (!supabase) return
  await supabase.from('rg_profiles').delete().eq('id', id)
}

// ─── DATOS DE USUARIO ─────────────────────────────────────────────────────────

export async function getUserData(profileId) {
  if (!supabase) {
    const all = JSON.parse(localStorage.getItem('rg_data') || '{}')
    return all[profileId] || {}
  }
  const { data, error } = await supabase
    .from('rg_user_data').select('*').eq('profile_id', profileId).maybeSingle()
  if (error || !data) return {}
  return {
    registros:   data.registros   || {},
    histPeso:    data.hist_peso   || [],
    progSemanal: data.prog_semanal || {},
  }
}

export async function saveUserData(profileId, ud) {
  // Siempre guarda en local como caché
  const all = JSON.parse(localStorage.getItem('rg_data') || '{}')
  localStorage.setItem('rg_data', JSON.stringify({ ...all, [profileId]: ud }))
  if (!supabase) return
  await supabase.from('rg_user_data').upsert({
    profile_id:   profileId,
    registros:    ud.registros   || {},
    hist_peso:    ud.histPeso    || [],
    prog_semanal: ud.progSemanal || {},
    updated_at:   new Date().toISOString(),
  })
}

// ─── DIETA ────────────────────────────────────────────────────────────────────

export async function getDieta(profileId) {
  if (!supabase) {
    const all = JSON.parse(localStorage.getItem('rg_dieta') || '{}')
    return all[profileId] || {}
  }
  const { data, error } = await supabase
    .from('rg_dieta').select('*').eq('profile_id', profileId).maybeSingle()
  if (error || !data) return {}
  return data.data || {}
}

export async function saveDieta(profileId, dietaData) {
  const all = JSON.parse(localStorage.getItem('rg_dieta') || '{}')
  localStorage.setItem('rg_dieta', JSON.stringify({ ...all, [profileId]: dietaData }))
  if (!supabase) return
  await supabase.from('rg_dieta').upsert({
    profile_id: profileId,
    data:       dietaData,
    updated_at: new Date().toISOString(),
  })
}
