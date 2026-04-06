// M07 OZO — Osobna zaštitna oprema
// [ZAK: PR-06 NN 5/21]
export type OzoRecordRow = {
  id: string; tenant_id: string; worker_id: string; item_name: string
  item_type: string | null; issued_date: string; replacement_date: string | null
  quantity: number; size: string | null; notes: string | null; status: string
  created_at: string; updated_at: string; created_by: string | null; updated_by: string | null
}

export const OZO_ITEM_TYPES = [
  { value: 'helmet', label: 'Kaciga' },
  { value: 'gloves', label: 'Rukavice' },
  { value: 'goggles', label: 'Zaštitne naočale' },
  { value: 'footwear', label: 'Zaštitna obuća' },
  { value: 'clothing', label: 'Zaštitna odjeća' },
  { value: 'hearing', label: 'Zaštita sluha' },
  { value: 'respiratory', label: 'Zaštita dišnih putova' },
  { value: 'fall_protection', label: 'Zaštita od pada' },
  { value: 'other', label: 'Ostalo' },
] as const
