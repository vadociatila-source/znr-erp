// M04 Zdravstveni pregledi — domain types
// [ZAK: čl. 34 ZZnR] Zdravstveni pregledi za poslove s posebnim uvjetima

import type { Database } from '@/types/database.types'

export type HealthCheckRow = Database['public']['Tables']['health_checks']['Row']
export type HealthCheckInsert = Database['public']['Tables']['health_checks']['Insert']
export type HealthCheckUpdate = Database['public']['Tables']['health_checks']['Update']

export type HealthCheckWithWorker = HealthCheckRow & {
  worker: { id: string; first_name: string; last_name: string } | null
}

export const CHECK_TYPES = [
  { value: 'prior',         label: 'Prethodni' },
  { value: 'periodic',      label: 'Periodički' },
  { value: 'extraordinary', label: 'Izvanredni' },
] as const

export const RESULT_OPTIONS = [
  { value: 'fit',                    label: 'Sposoban' },
  { value: 'fit_with_restrictions',  label: 'Sposoban s ograničenjima' },
  { value: 'temporarily_unfit',      label: 'Privremeno nesposoban' },
  { value: 'unfit',                  label: 'Nesposoban' },
] as const

export const RESULT_BADGE: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  fit:                   { variant: 'success', label: 'Sposoban' },
  fit_with_restrictions: { variant: 'warning', label: 'S ograničenjima' },
  temporarily_unfit:     { variant: 'info',    label: 'Privremeno nesposoban' },
  unfit:                 { variant: 'danger',  label: 'Nesposoban' },
}

// Legal ref kodovi
export const CHECK_LEGAL_CODES: Record<string, string> = {
  prior:         'ZZnR-34-prethodni',
  periodic:      'ZZnR-34-periodicki-3god',
  extraordinary: 'ZZnR-34-prethodni',
}

// Status na temelju next_check_date
export function computeCheckStatus(nextDate: string | null): 'ok' | 'expiring_soon' | 'expired' {
  if (!nextDate) return 'ok'
  const days = Math.ceil((new Date(nextDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'expired'
  if (days <= 90) return 'expiring_soon'
  return 'ok'
}

export type HealthCheckFilters = {
  search: string
  checkType: string
  result: string
  page: number
}

export const DEFAULT_HC_FILTERS: HealthCheckFilters = {
  search: '',
  checkType: 'all',
  result: 'all',
  page: 1,
}

export const HC_PAGE_SIZE = 25
