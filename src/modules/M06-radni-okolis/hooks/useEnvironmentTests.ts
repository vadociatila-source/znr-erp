import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type { EnvironmentTestRow } from '../types'

export function useEnvironmentTestsList() {
  const [tests, setTests] = useState<EnvironmentTestRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase.from('environment_tests').select('*').order('test_date', { ascending: false })
    setTests((data ?? []) as unknown as EnvironmentTestRow[])
    setIsLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { tests, isLoading, refetch: fetch }
}

export function useEnvironmentTestMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const create = async (input: Partial<EnvironmentTestRow>): Promise<void> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('environment_tests').insert({ ...input, tenant_id: tenantId } as never)
      if (error) throw error
    } finally { setIsSubmitting(false) }
  }

  return { create, isSubmitting }
}
