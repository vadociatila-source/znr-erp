// Auth store — session i aktivni tenant
// Nakon logina: user ima tenant_id u JWT custom claims
// RLS automatski filtrira podatke po tenant_id — bez ikakvog ručnog postavljanja

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null

  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      error: null,

      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        set({ user: session?.user ?? null, session, isLoading: false })

        supabase.auth.onAuthStateChange((_event, session) => {
          set({ user: session?.user ?? null, session })
        })
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { set({ error: error.message, isLoading: false }); throw error }
        set({ user: data.user, session: data.session, isLoading: false })
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null })
      },
    }),
    { name: 'auth-store' }
  )
)
