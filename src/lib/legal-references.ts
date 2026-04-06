// [ZAK] Legal references loader
// legal_references je GLOBALNA tablica — ista za sve tenante.
// Zakon je isti za sve tvrtke u HR. Nema tenant_id na ovoj tablici.

import { supabase } from '@/lib/supabase'
import type { LegalReference } from '@/types/legal.types'

let cache: LegalReference[] | null = null
let cacheTs: number | null = null
const TTL = 10 * 60 * 1000 // 10 minuta

export async function loadLegalReferences(): Promise<LegalReference[]> {
  if (cache && cacheTs && Date.now() - cacheTs < TTL) return cache

  const { data, error } = await supabase
    .from('legal_references')
    .select('*')
    .eq('is_active', true)
    .order('code')

  if (error) {
    console.error('[ZAK] Greška pri učitavanju legal_references:', error)
    return cache ?? []
  }

  cache = data as LegalReference[]
  cacheTs = Date.now()
  return cache
}

export function getLegalRefByCode(refs: LegalReference[], code: string) {
  return refs.find(r => r.code === code) ?? null
}

export function getLegalRefsByModule(refs: LegalReference[], moduleCode: string) {
  return refs.filter(r => r.module_codes.includes(moduleCode))
}

export function clearLegalRefCache() {
  cache = null
  cacheTs = null
}

export function formatLegalRef(ref: LegalReference): string {
  const parts: string[] = []
  if (ref.article) parts.push(ref.article)
  if (ref.title) {
    parts.push(
      ref.title
        .replace('Zakon o zaštiti na radu', 'ZZnR')
        .replace('Pravilnik o ', 'Pr. ')
    )
  }
  if (ref.deadline_description) parts.push(ref.deadline_description)
  return parts.join(' — ')
}
