// Tenant store — drži podatke o aktivnoj tvrtki
// Model 1: nema zasebnih Supabase projekata, nema client factory
// tenant_id je u Supabase Auth user_metadata → RLS radi automatski

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Tenant, UserRole } from '@/types/tenant.types'
import { supabase } from '@/lib/supabase'

interface TenantState {
  activeTenant: Tenant | null
  role: UserRole | null
  isLoading: boolean
  // hasAttemptedLoad = true nakon prvog loadTenant poziva (bez obzira na ishod).
  // Koristi se u TenantRoute da izbjegnemo race condition: prvi render prije
  // nego useEffect stigne pozvati loadTenant bi inače odmah redirectao na
  // /onboarding čak i ako user ima tenant u bazi.
  hasAttemptedLoad: boolean
  error: string | null

  // Lista tenanata — za ZNR stručnjake koji vode više klijenata
  availableTenants: Tenant[]

  loadTenant: (userId: string) => Promise<void>
  switchTenant: (tenantId: string) => Promise<void>
  clearTenant: () => void
}

export const useTenantStore = create<TenantState>()(
  devtools(
    (set) => ({
      activeTenant: null,
      role: null,
      isLoading: false,
      hasAttemptedLoad: false,
      error: null,
      availableTenants: [],

      loadTenant: async (userId: string) => {
        set({ isLoading: true, error: null })
        try {
          // Dohvati sve tenante kojima user ima pristup
          const { data, error } = await supabase
            .from('tenant_users')
            .select('role, tenant:tenants(*)')
            .eq('user_id', userId)

          if (error) {
            console.error('[tenant.store] loadTenant query error:', error)
            throw error
          }

          console.log('[tenant.store] loadTenant result:', { userId, rowCount: data?.length ?? 0 })

          const tenants = (data ?? [])
            .map(m => m.tenant as Tenant | null)
            .filter((t): t is Tenant => Boolean(t))

          // Auto-switch ako ima samo jedan tenant
          if (tenants.length === 1 && data && data[0]) {
            console.log('[tenant.store] aktivni tenant:', tenants[0].name)
            set({
              activeTenant: tenants[0],
              role: data[0].role as UserRole,
              availableTenants: tenants,
              isLoading: false,
              hasAttemptedLoad: true,
            })
          } else {
            console.warn('[tenant.store] nema tenanta za userId', userId, '→ onboarding')
            set({ availableTenants: tenants, isLoading: false, hasAttemptedLoad: true })
          }
        } catch (err) {
          console.error('[tenant.store] loadTenant exception:', err)
          set({
            error: err instanceof Error ? err.message : 'Greška pri učitavanju tvrtke',
            isLoading: false,
            hasAttemptedLoad: true,
          })
        }
      },

      switchTenant: async (tenantId: string) => {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        if (!userId) return

        const { data, error } = await supabase
          .from('tenant_users')
          .select('role, tenant:tenants(*)')
          .eq('tenant_id', tenantId)
          .eq('user_id', userId)
          .single()

        if (error || !data) return
        const tenant = data.tenant as Tenant | null
        if (!tenant) return

        set({ activeTenant: tenant, role: data.role as UserRole })
      },

      clearTenant: () => set({
        activeTenant: null,
        role: null,
        availableTenants: [],
        hasAttemptedLoad: false,
      }),
    }),
    { name: 'tenant-store' }
  )
)
