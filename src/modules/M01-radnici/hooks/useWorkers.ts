// M01 — Workers data hook (CRUD + filtering)
// RLS automatski filtrira po tenant_id — nema ručnog filtriranja.
// [ZAK: čl. 61 ZZnR] Nikad hard delete — deactivateWorker postavlja status='former'.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type { WorkerWithPosition, WorkerInsert, WorkerUpdate, WorkerFilters, WorkPositionRow } from '../types'
import { PAGE_SIZE } from '../types'

// ── Fetch workers s paginacijom i filterima ─────────────────────
export function useWorkersList(filters: WorkerFilters) {
  const [workers, setWorkers] = useState<WorkerWithPosition[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    let query = supabase
      .from('workers')
      .select('*, work_position:work_positions!position_id(id, name, is_special_conditions)', { count: 'exact' })

    // Status filter
    if (filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    // Search filter (ime, prezime, OIB)
    if (filters.search.trim()) {
      const s = `%${filters.search.trim()}%`
      query = query.or(`first_name.ilike.${s},last_name.ilike.${s},oib.ilike.${s}`)
    }

    // Paginacija
    const from = (filters.page - 1) * PAGE_SIZE
    query = query
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    const { data, error: err, count } = await query

    if (err) {
      console.error('[useWorkers] fetch error:', err)
      setError(err.message)
    } else {
      setWorkers((data ?? []) as unknown as WorkerWithPosition[])
      setTotalCount(count ?? 0)
    }
    setIsLoading(false)
  }, [filters.status, filters.search, filters.page])

  useEffect(() => { fetchWorkers() }, [fetchWorkers])

  return { workers, totalCount, isLoading, error, refetch: fetchWorkers }
}

// ── Fetch single worker ──────────────────────────────────────────
export function useWorker(id: string | undefined) {
  const [worker, setWorker] = useState<WorkerWithPosition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setIsLoading(false); return }
    setIsLoading(true)

    supabase
      .from('workers')
      .select('*, work_position:work_positions!position_id(id, name, is_special_conditions)')
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setWorker(data as unknown as WorkerWithPosition)
        setIsLoading(false)
      })
  }, [id])

  return { worker, isLoading, error }
}

// ── Fetch work positions (za form Select) ────────────────────────
export function useWorkPositions() {
  const [positions, setPositions] = useState<Pick<WorkPositionRow, 'id' | 'name'>[]>([])

  useEffect(() => {
    supabase
      .from('work_positions')
      .select('id, name')
      .eq('status', 'active')
      .order('name')
      .then(({ data }) => setPositions(data ?? []))
  }, [])

  return positions
}

// ── Mutations ─────────────────────────────────────────────────────

export function useWorkerMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createWorker = async (input: Omit<WorkerInsert, 'tenant_id'>): Promise<string> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('workers')
        .insert({ ...input, tenant_id: tenantId })
        .select('id')
        .single()
      if (error) throw error
      // [ZAK: čl. 27 ZZnR] Task za osposobljavanje automatski kreiran DB triggerom
      return data.id
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateWorker = async (id: string, input: WorkerUpdate): Promise<void> => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('workers')
        .update(input)
        .eq('id', id)
      if (error) throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // [ZAK: čl. 61 ZZnR] Soft delete — nikad brisati, samo status='former'
  const deactivateWorker = async (id: string): Promise<void> => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('workers')
        .update({
          status: 'former',
          termination_date: new Date().toISOString().slice(0, 10),
        })
        .eq('id', id)
      if (error) throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return { createWorker, updateWorker, deactivateWorker, isSubmitting }
}
