// Legal store — zakonske reference (globalne, iste za sve tenante)
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { LegalReference } from '@/types/legal.types'
import { loadLegalReferences, getLegalRefByCode, getLegalRefsByModule } from '@/lib/legal-references'

interface LegalState {
  refs: LegalReference[]
  isLoaded: boolean
  load: () => Promise<void>
  byCode: (code: string) => LegalReference | null
  byModule: (moduleCode: string) => LegalReference[]
}

export const useLegalStore = create<LegalState>()(
  devtools(
    (set, get) => ({
      refs: [],
      isLoaded: false,

      load: async () => {
        if (get().isLoaded) return
        const refs = await loadLegalReferences()
        set({ refs, isLoaded: true })
      },

      byCode: (code) => getLegalRefByCode(get().refs, code),
      byModule: (module) => getLegalRefsByModule(get().refs, module),
    }),
    { name: 'legal-store' }
  )
)
