import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type { EvacuationRow } from '../types'

export function useEvacuationsList() {
  const [drills, setDrills] = useState<EvacuationRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase.from('evacuations').select('*').order('drill_date', { ascending: false })
    setDrills((data ?? []) as unknown as EvacuationRow[])
    setIsLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { drills, isLoading, refetch: fetch }
}

export function useEvacuationMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const create = async (input: Partial<EvacuationRow>): Promise<void> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('evacuations').insert({ ...input, tenant_id: tenantId } as never)
      if (error) throw error
    } finally { setIsSubmitting(false) }
  }

  return { create, isSubmitting }
}
