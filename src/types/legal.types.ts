// [ZAK] Tipovi za zakonske reference — srce sustava
// Svi rokovi i obveze dolaze iz legal_references tablice u Supabase

export interface LegalReference {
  id: string
  code: string                         // npr. "ZZnR-27-30d"
  title: string                        // "Zakon o zaštiti na radu"
  article: string | null               // "čl. 27"
  nn_number: string | null             // "NN 71/14, 118/14, 94/18, 96/18"
  effective_date: string | null
  description: string | null           // "Osposobljavanje novog radnika"
  deadline_days: number | null         // 30 (null = nije fiksni rok)
  deadline_description: string | null  // "30 dana od dana zaposlenja"
  module_codes: string[]               // ["M03"]
  is_active: boolean
  superseded_by: string | null
  last_verified: string | null
  source_url: string | null
  created_at: string
  updated_at: string
}

export type AlarmLevel = 'critical' | 'urgent' | 'warning' | 'info' | 'ok'

export interface AlarmItem {
  id: string
  level: AlarmLevel
  title: string
  description: string
  entity_type: string        // 'worker' | 'equipment' | 'training' | ...
  entity_id: string
  entity_name: string        // ime radnika / naziv opreme / ...
  due_date: string | null
  days_until_due: number | null
  legal_reference: LegalReference | null
  module_code: string        // "M03", "M04", ...
  action_url: string         // link na stranicu entiteta
}

// Standardne razine alarma — konzistentno kroz cijeli sustav
// [ZAK] Pragovi su konzervativni — bolje upozoriti ranije nego kasniti
export function getAlarmLevel(daysUntilExpiry: number): AlarmLevel {
  if (daysUntilExpiry <= 0)  return 'critical'
  if (daysUntilExpiry <= 30) return 'urgent'
  if (daysUntilExpiry <= 60) return 'warning'
  if (daysUntilExpiry <= 90) return 'info'
  return 'ok'
}

export const ALARM_COLORS: Record<AlarmLevel, string> = {
  critical: 'bg-red-50 border-red-400 text-red-800',
  urgent:   'bg-orange-50 border-orange-400 text-orange-800',
  warning:  'bg-yellow-50 border-yellow-400 text-yellow-800',
  info:     'bg-blue-50 border-blue-400 text-blue-800',
  ok:       'bg-green-50 border-green-400 text-green-800',
}

export const ALARM_BADGE_COLORS: Record<AlarmLevel, string> = {
  critical: 'bg-red-100 text-red-700 border-red-300',
  urgent:   'bg-orange-100 text-orange-700 border-orange-300',
  warning:  'bg-yellow-100 text-yellow-700 border-yellow-300',
  info:     'bg-blue-100 text-blue-700 border-blue-300',
  ok:       'bg-green-100 text-green-700 border-green-300',
}

export const ALARM_LEVEL_LABELS: Record<AlarmLevel, string> = {
  critical: 'Isteklo / Hitno',
  urgent:   'Uskoro ističe',
  warning:  'Upozorenje',
  info:     'Na vidiku',
  ok:       'Uredno',
}
