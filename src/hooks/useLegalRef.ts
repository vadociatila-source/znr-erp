import { useLegalStore } from '@/store/legal.store'
export const useLegalRef = (code: string) => useLegalStore(s => s.byCode(code))
export const useLegalRefsByModule = (mod: string) => useLegalStore(s => s.byModule(mod))
