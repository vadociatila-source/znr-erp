// M02 — Work positions data hook
// [ZAK: čl. 18 ZZnR] Procjena rizika
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type { WorkPositionRow, WorkPositionInsert, WorkPositionUpdate, PositionFilters } from '../types'
import { POS_PAGE_SIZE } from '../types'

export function usePositionsList(filters: PositionFilters) {
  const [positions, setPositions] = useState<WorkPositionRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    let query = supabase.from('work_positions').select('*', { count: 'exact' })

    if (filters.status !== 'all') query = query.eq('status', filters.status)
    if (filters.search.trim()) {
      const s = `%${filters.search.trim()}%`
      query = query.or(`name.ilike.${s},code.ilike.${s}`)
    }

    const from = (filters.page - 1) * POS_PAGE_SIZE
    query = query.order('name').range(from, from + POS_PAGE_SIZE - 1)

    const { data, count } = await query
    setPositions(data ?? [])
    setTotalCount(count ?? 0)
    setIsLoading(false)
  }, [filters.status, filters.search, filters.page])

  useEffect(() => { fetch() }, [fetch])
  return { positions, totalCount, isLoading, refetch: fetch }
}

export function usePositionMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPosition = async (input: Omit<WorkPositionInsert, 'tenant_id'>): Promise<string> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('work_positions').insert({ ...input, tenant_id: tenantId }).select('id').single()
      if (error) throw error
      return data.id
    } finally { setIsSubmitting(false) }
  }

  const updatePosition = async (id: string, input: WorkPositionUpdate): Promise<void> => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('work_positions').update(input).eq('id', id)
      if (error) throw error
    } finally { setIsSubmitting(false) }
  }

  return { createPosition, updatePosition, isSubmitting }
}
