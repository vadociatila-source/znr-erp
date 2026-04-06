// Jedan Supabase client za cijelu ZNR ERP aplikaciju
// Model 1: jedna baza, sve tvrtke izolirane RLS-om po tenant_id
// Nema factory funkcija, nema dinamičkih klijenata — jedan import, svugdje.

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Supabase credentials nisu postavljeni.\n' +
    'Provjeri .env: VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient<Database>(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
