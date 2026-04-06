// M06 Radni okoliš — ispitivanja fizikalnih/kemijskih čimbenika
// [ZAK: PR-05] Fizikalni max 3 god, kemijski max 2 god

export type EnvironmentTestRow = {
  id: string; tenant_id: string; test_type: string; test_name: string
  test_date: string; next_test_date: string | null; provider: string | null
  location: string | null; result: string | null; document_url: string | null
  legal_ref_code: string | null; notes: string | null; status: string
  created_at: string; updated_at: string; created_by: string | null; updated_by: string | null
}

export const TEST_TYPES = [
  { value: 'physical', label: 'Fizikalni (mikroklima, buka, rasvjeta)' },
  { value: 'chemical', label: 'Kemijski (prašine, plinovi)' },
] as const

export const RESULT_OPTIONS = [
  { value: 'compliant', label: 'Sukladano' },
  { value: 'non_compliant', label: 'Nesukladno' },
  { value: 'partial', label: 'Djelomično sukladno' },
] as const

export const LEGAL_CODES: Record<string, string> = {
  physical: 'PR05-fizikalni-3god',
  chemical: 'PR05-kemijski-2god',
}
