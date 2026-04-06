// M04 — Health checks data hook
// [ZAK: čl. 34 ZZnR] Zdravstveni pregledi za poslove s posebnim uvjetima
// RLS automatski filtrira po tenant_id.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type { HealthCheckWithWorker, HealthCheckInsert, HealthCheckFilters } from '../types'
import { HC_PAGE_SIZE } from '../types'

export function useHealthChecksList(filters: HealthCheckFilters) {
  const [checks, setChecks] = useState<HealthCheckWithWorker[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    let query = supabase
      .from('health_checks')
      .select('*, worker:workers!worker_id(id, first_name, last_name)', { count: 'exact' })

    if (filters.checkType !== 'all') query = query.eq('check_type', filters.checkType)
    if (filters.result !== 'all') query = query.eq('result', filters.result)

    const from = (filters.page - 1) * HC_PAGE_SIZE
    query = query
      .order('check_date', { ascending: false })
      .range(from, from + HC_PAGE_SIZE - 1)

    const { data, error: err, count } = await query
    if (err) { setError(err.message) } else {
      setChecks((data ?? []) as unknown as HealthCheckWithWorker[])
      setTotalCount(count ?? 0)
    }
    setIsLoading(false)
  }, [filters.checkType, filters.result, filters.page])

  useEffect(() => { fetch() }, [fetch])
  return { checks, totalCount, isLoading, error, refetch: fetch }
}

export function useWorkerHealthChecks(workerId: string | undefined) {
  const [checks, setChecks] = useState<HealthCheckWithWorker[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!workerId) { setIsLoading(false); return }
    setIsLoading(true)
    supabase
      .from('health_checks')
      .select('*, worker:workers!worker_id(id, first_name, last_name)')
      .eq('worker_id', workerId)
      .order('check_date', { ascending: false })
      .then(({ data }) => {
        setChecks((data ?? []) as unknown as HealthCheckWithWorker[])
        setIsLoading(false)
      })
  }, [workerId])

  return { checks, isLoading }
}

export function useHealthCheckMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createCheck = async (input: Omit<HealthCheckInsert, 'tenant_id'>): Promise<string> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('health_checks')
        .insert({ ...input, tenant_id: tenantId })
        .select('id')
        .single()
      if (error) throw error
      return data.id
    } finally {
      setIsSubmitting(false)
    }
  }

  return { createCheck, isSubmitting }
}
