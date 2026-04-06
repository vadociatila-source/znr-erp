// M05 Radna oprema — domain types
// [ZAK: PR-04 NN 16/16] Pregled radne opreme max. svake 3 godine
// [ZAK: čl. 39 ZOP NN 92/10] Vatrogasni aparati — vizualni 1god, servis 2god

import type { Database } from '@/types/database.types'

export type EquipmentRow = Database['public']['Tables']['equipment']['Row']
export type EquipmentInsert = Database['public']['Tables']['equipment']['Insert']
export type EquipmentUpdate = Database['public']['Tables']['equipment']['Update']

export const EQUIPMENT_TYPES = [
  // Standardna oprema
  { value: 'machine',            label: 'Stroj / Uređaj' },
  { value: 'pressure_vessel',    label: 'Posuda pod tlakom' },
  { value: 'lifting',            label: 'Dizalica / Viličar' },
  { value: 'electrical',         label: 'Električna instalacija' },
  { value: 'vehicle',            label: 'Vozilo' },
  // Vatrogasni aparati — [ZAK: Pr. NN 101/11] 3 roka: 90d/365d/5god
  { value: 'fire_extinguisher',  label: 'Vatrogasni aparat' },
  { value: 'fire_protection',    label: 'PP oprema (maska, kombinezon)' },
  // ZOP stabilni sustavi — [ZAK: ZoZP NN 92/10 čl.40] godišnje ispitivanje
  { value: 'hydrant_network',    label: 'Hidrantska mreža' },
  { value: 'fire_alarm_system',  label: 'Sustav za dojavu požara (vatrodojava)' },
  { value: 'sprinkler_system',   label: 'Sprinkler sustav' },
  { value: 'co2_suppression',    label: 'CO₂ / prah sustav gašenja' },
  { value: 'emergency_lighting', label: 'Protupanična / sigurnosna rasvjeta' },
  { value: 'gas_detection',      label: 'Detekcija zapaljivih plinova i para' },
  { value: 'other',              label: 'Ostalo' },
] as const

export const EQUIPMENT_LEGAL_CODES: Record<string, string> = {
  machine:           'PR04-oprema-3god',
  fire_extinguisher: 'ZOP-VA-servis-365d',
  fire_protection:   'PR04-oprema-3god',
  pressure_vessel:   'PR04-oprema-3god',
  lifting:           'PR04-oprema-3god',
  electrical:        'PR04-oprema-3god',
  vehicle:           'PR04-oprema-3god',
  hydrant_network:   'ZOP-hidrant-365d',
  fire_alarm_system: 'ZOP-vatrodojava-365d',
  sprinkler_system:  'ZOP-sprinkler-365d',
  co2_suppression:   'ZOP-co2-365d',
  emergency_lighting:'ZOP-sig-rasvjeta-365d',
  gas_detection:     'ZOP-plin-detekcija-365d',
  other:             'PR04-oprema-3god',
}

export function computeInspectionStatus(nextDate: string | null): 'ok' | 'expiring_soon' | 'expired' {
  if (!nextDate) return 'ok'
  const days = Math.ceil((new Date(nextDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'expired'
  if (days <= 60) return 'expiring_soon'
  return 'ok'
}

export const STATUS_OPTIONS = [
  { value: 'active',         label: 'Aktivna' },
  { value: 'out_of_service', label: 'Izvan uporabe' },
  { value: 'disposed',       label: 'Rashodovana' },
] as const

export type EquipmentFilters = {
  search: string
  equipmentType: string
  status: string
  page: number
}

export const DEFAULT_EQ_FILTERS: EquipmentFilters = {
  search: '',
  equipmentType: 'all',
  status: 'active',
  page: 1,
}

export const EQ_PAGE_SIZE = 25
