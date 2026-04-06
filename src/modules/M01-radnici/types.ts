// M01 Radnici — domain types
// [ZAK: čl. 61 ZZnR] Evidencija radnika je trajna — nikad hard delete
import type { Database } from '@/types/database.types'

export type WorkerRow = Database['public']['Tables']['workers']['Row']
export type WorkerInsert = Database['public']['Tables']['workers']['Insert']
export type WorkerUpdate = Database['public']['Tables']['workers']['Update']

export type WorkPositionRow = Database['public']['Tables']['work_positions']['Row']

// Worker s joinanim radnim mjestom
export type WorkerWithPosition = WorkerRow & {
  work_position: Pick<WorkPositionRow, 'id' | 'name' | 'is_special_conditions'> | null
}

// Filter state — mapira se na URL search params
export type WorkerFilters = {
  search: string
  status: 'active' | 'former' | 'all'
  page: number
}

export const DEFAULT_FILTERS: WorkerFilters = {
  search: '',
  status: 'active',
  page: 1,
}

export const PAGE_SIZE = 25

// Contract type labels za Select dropdown
export const CONTRACT_TYPES = [
  { value: 'neodredjeno', label: 'Neodređeno' },
  { value: 'odredjeno', label: 'Određeno' },
  { value: 'student', label: 'Student' },
  { value: 'vanjski', label: 'Vanjski suradnik' },
  { value: 'privremeni', label: 'Privremeni' },
] as const

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Muški' },
  { value: 'F', label: 'Ženski' },
] as const
