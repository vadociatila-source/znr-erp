// M02 Radna mjesta — domain types
// [ZAK: čl. 18 ZZnR] Procjena rizika — revizija min. svake 2 godine
import type { Database } from '@/types/database.types'

export type WorkPositionRow = Database['public']['Tables']['work_positions']['Row']
export type WorkPositionInsert = Database['public']['Tables']['work_positions']['Insert']
export type WorkPositionUpdate = Database['public']['Tables']['work_positions']['Update']

export const RISK_LEVELS = [
  { value: 'low',    label: 'Nizak' },
  { value: 'medium', label: 'Srednji' },
  { value: 'high',   label: 'Visok' },
] as const

export function computeRiskAssessmentStatus(nextDate: string | null): 'ok' | 'expiring_soon' | 'expired' {
  if (!nextDate) return 'ok'
  const days = Math.ceil((new Date(nextDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'expired'
  if (days <= 90) return 'expiring_soon'
  return 'ok'
}

export type PositionFilters = {
  search: string
  status: string
  page: number
}

export const DEFAULT_POS_FILTERS: PositionFilters = { search: '', status: 'active', page: 1 }
export const POS_PAGE_SIZE = 25
