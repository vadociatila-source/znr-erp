import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type { OzoRecordRow } from '../types'

type OzoWithWorker = OzoRecordRow & {
  worker: { id: string; first_name: string; last_name: string } | null
}

export function useOzoList() {
  const [records, setRecords] = useState<OzoWithWorker[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase.from('ozo_records')
      .select('*, worker:workers!worker_id(id, first_name, last_name)')
      .order('issued_date', { ascending: false })
    setRecords((data ?? []) as unknown as OzoWithWorker[])
    setIsLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { records, isLoading, refetch: fetch }
}

export function useOzoMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const create = async (input: Partial<OzoRecordRow>): Promise<void> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('ozo_records').insert({ ...input, tenant_id: tenantId } as never)
      if (error) throw error
    } finally { setIsSubmitting(false) }
  }

  return { create, isSubmitting }
}
