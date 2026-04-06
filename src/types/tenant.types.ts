// Tipovi za multi-tenant arhitekturu

export type UserRole =
  | 'owner'           // vlasnik/direktor — puna prava
  | 'hr'              // HR osoba — gotovo puna prava
  | 'znr_specialist'  // interni ZNR stručnjak — puna prava
  | 'delegate'        // povjerenik radnika — read-only za ZNR teme
  | 'worker'          // radnik — read-only vlastiti dosje

export type TenantPlan =
  | 'micro'           // do 5 radnika — 15 EUR/mj
  | 'small'           // 6-20 radnika — 29 EUR/mj
  | 'medium'          // 21-50 radnika — 49 EUR/mj
  | 'large'           // 51+ radnika — 79 EUR/mj
  | 'znr_partner'     // ZNR stručnjak, do 10 klijenata — 99 EUR/mj
  | 'znr_pro'         // ZNR stručnjak, neograničeno — 199 EUR/mj

// Derivirano iz database.types.ts (public.tenants.Row) — jedini izvor istine
// je prava shema u Supabase. Ovdje samo suzujemo TEXT stupce na stroge enum tipove.
import type { Database } from './database.types'

type TenantRow = Database['public']['Tables']['tenants']['Row']

export type Tenant = Omit<TenantRow, 'plan' | 'status'> & {
  plan: TenantPlan
  status: 'active' | 'suspended' | 'trial'
}

export interface TenantUser {
  id: string
  user_id: string
  tenant_id: string
  role: UserRole
  is_external_specialist: boolean
  created_at: string
}

export interface ZnrSpecialistClient {
  id: string
  specialist_user_id: string
  tenant_id: string
  tenant_name: string
  status: 'active' | 'pending' | 'revoked'
  invited_at: string
  accepted_at: string | null
  critical_count?: number
  urgent_count?: number
}

// Prava pristupa po ulozi
export const ROLE_PERMISSIONS: Record<UserRole, {
  canEdit: boolean
  canDelete: boolean
  canManageUsers: boolean
  canViewAll: boolean
}> = {
  owner:          { canEdit: true,  canDelete: true,  canManageUsers: true,  canViewAll: true },
  hr:             { canEdit: true,  canDelete: false, canManageUsers: false, canViewAll: true },
  znr_specialist: { canEdit: true,  canDelete: false, canManageUsers: false, canViewAll: true },
  delegate:       { canEdit: false, canDelete: false, canManageUsers: false, canViewAll: true },
  worker:         { canEdit: false, canDelete: false, canManageUsers: false, canViewAll: false },
}
