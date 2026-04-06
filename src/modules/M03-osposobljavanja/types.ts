// M03 Osposobljavanja — domain types
// [ZAK: čl. 27 ZZnR] Osposobljavanje za rad na siguran način
// [ZAK: PR-02 NN 142/21] Usavršavanje svake 4 godine

import type { Database } from '@/types/database.types'

export type TrainingRow = Database['public']['Tables']['trainings']['Row']
export type TrainingInsert = Database['public']['Tables']['trainings']['Insert']
export type TrainingUpdate = Database['public']['Tables']['trainings']['Update']

// Training s joinanim worker imenom
export type TrainingWithWorker = TrainingRow & {
  worker: { id: string; first_name: string; last_name: string } | null
}

// Vrsta osposobljavanja — labels za UI
export const TRAINING_TYPES = [
  { value: 'initial',          label: 'Početno osposobljavanje' },
  { value: 'refresher',        label: 'Usavršavanje (obnova)' },
  { value: 'position_change',  label: 'Promjena radnog mjesta' },
  { value: 'fire_safety',      label: 'Zaštita od požara' },
  { value: 'first_aid',        label: 'Prva pomoć' },
  { value: 'equipment',        label: 'Rad s opremom' },
  { value: 'other',            label: 'Ostalo' },
] as const

export type TrainingType = typeof TRAINING_TYPES[number]['value']

// Legal ref kodovi za auto-linkanje
export const TRAINING_LEGAL_CODES: Record<string, string> = {
  initial:         'ZZnR-27-novi-radnik-30d',
  refresher:       'ZZnR-27-usavrsavanje-4god',
  position_change: 'ZZnR-27-promjena-rm',
}

// Status kalkulacija — [ZAK] pragovi su konzervativni
export function computeTrainingStatus(validUntil: string | null): TrainingRow['status'] {
  if (!validUntil) return 'valid' // nema isteka = trajno važeće (npr. početno)
  const days = Math.ceil(
    (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (days <= 0) return 'expired'
  if (days <= 60) return 'expiring_soon'
  return 'valid'
}

// Filter state
export type TrainingFilters = {
  search: string
  status: 'all' | 'valid' | 'expiring_soon' | 'expired'
  type: string // training_type ili 'all'
  page: number
}

export const DEFAULT_TRAINING_FILTERS: TrainingFilters = {
  search: '',
  status: 'all',
  type: 'all',
  page: 1,
}

export const TRAINING_PAGE_SIZE = 25
