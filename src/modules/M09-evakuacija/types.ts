// M09 Evakuacija — vježbe evakuacije i spašavanja
// [ZAK: čl. 45 ZZnR] Min. jednom godišnje
export type EvacuationRow = {
  id: string; tenant_id: string; drill_date: string; next_drill_date: string | null
  drill_type: string; participants: number | null; duration_minutes: number | null
  location: string | null; findings: string | null; corrective_actions: string | null
  document_url: string | null; legal_ref_code: string | null; notes: string | null
  status: string; created_at: string; updated_at: string
  created_by: string | null; updated_by: string | null
}

export const DRILL_TYPES = [
  { value: 'full', label: 'Potpuna vježba' },
  { value: 'partial', label: 'Djelomična vježba' },
  { value: 'tabletop', label: 'Teorijska vježba' },
] as const
