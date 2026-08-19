import { createClient } from '@supabase/supabase-js'

// Publishable key — безопасен для использования в браузере (доступ ограничивается RLS-политиками)
const SUPABASE_URL = 'https://smhbpqnumyeilrjpmlru.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Z8uwbZMgT551IyevirwJyg_sig5-yr8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
