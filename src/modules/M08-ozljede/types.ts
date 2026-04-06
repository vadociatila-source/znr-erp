// M08 Ozljede na radu — domain types
// [ZAK: čl. 62 ZZnR] Prijava HZZO u roku 48 sati — kazna 5.000–50.000 EUR
import type { Database } from '@/types/database.types'

export type IncidentRow = Database['public']['Tables']['incidents']['Row']
export type IncidentInsert = Database['public']['Tables']['incidents']['Insert']

export type IncidentWithWorker = IncidentRow & {
  worker: { id: string; first_name: string; last_name: string } | null
}

export const INCIDENT_STATUSES = [
  { value: 'reported',      label: 'Prijavljeno' },
  { value: 'investigating', label: 'U istrazi' },
  { value: 'resolved',      label: 'Zaključeno' },
] as const

export function compute48hStatus(reportDeadline: string, hzzoReported: boolean): 'ok' | 'urgent' | 'critical' {
  if (hzzoReported) return 'ok'
  const hours = (new Date(reportDeadline).getTime() - Date.now()) / (1000 * 60 * 60)
  if (hours <= 0) return 'critical'
  if (hours <= 24) return 'urgent'
  return 'ok'
}

export type IncidentFilters = {
  status: string
  page: number
}
export const DEFAULT_INC_FILTERS: IncidentFilters = { status: 'all', page: 1 }
export const INC_PAGE_SIZE = 25
