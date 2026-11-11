import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  await supabase.from('subscriptions').select('auth_user_id').limit(1)
  return res.status(200).json({ ok: true, ts: new Date().toISOString() })
}
