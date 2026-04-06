// M08 — Incidents data hook
// [ZAK: čl. 62 ZZnR] Prijava ozljede HZZO — 48h
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type { IncidentWithWorker, IncidentInsert, IncidentFilters } from '../types'
import { INC_PAGE_SIZE } from '../types'

export function useIncidentsList(filters: IncidentFilters) {
  const [incidents, setIncidents] = useState<IncidentWithWorker[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    let query = supabase
      .from('incidents')
      .select('*, worker:workers!worker_id(id, first_name, last_name)', { count: 'exact' })

    if (filters.status !== 'all') query = query.eq('status', filters.status)

    const from = (filters.page - 1) * INC_PAGE_SIZE
    query = query.order('incident_date', { ascending: false }).range(from, from + INC_PAGE_SIZE - 1)

    const { data, count } = await query
    setIncidents((data ?? []) as unknown as IncidentWithWorker[])
    setTotalCount(count ?? 0)
    setIsLoading(false)
  }, [filters.status, filters.page])

  useEffect(() => { fetch() }, [fetch])
  return { incidents, totalCount, isLoading, refetch: fetch }
}

export function useIncidentMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createIncident = async (input: Omit<IncidentInsert, 'tenant_id' | 'report_deadline'>): Promise<string> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      // [ZAK: čl. 62 ZZnR] report_deadline = incident_date + 48h
      const deadline = new Date(input.incident_date)
      deadline.setHours(deadline.getHours() + 48)

      const { data, error } = await supabase
        .from('incidents')
        .insert({
          ...input,
          tenant_id: tenantId,
          report_deadline: deadline.toISOString(),
        })
        .select('id')
        .single()
      if (error) throw error
      return data.id
    } finally { setIsSubmitting(false) }
  }

  const markHzzoReported = async (id: string): Promise<void> => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ hzzo_reported: true, hzzo_reported_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    } finally { setIsSubmitting(false) }
  }

  return { createIncident, markHzzoReported, isSubmitting }
}
