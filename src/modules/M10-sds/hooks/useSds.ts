import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type { SdsDocumentRow } from '../types'

export function useSdsList() {
  const [docs, setDocs] = useState<SdsDocumentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase.from('sds_documents').select('*').order('chemical_name')
    setDocs((data ?? []) as unknown as SdsDocumentRow[])
    setIsLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { docs, isLoading, refetch: fetch }
}

export function useSdsMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const create = async (input: Partial<SdsDocumentRow>): Promise<void> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('sds_documents').insert({ ...input, tenant_id: tenantId } as never)
      if (error) throw error
    } finally { setIsSubmitting(false) }
  }

  return { create, isSubmitting }
}
