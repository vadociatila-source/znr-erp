// M03 — Trainings data hook (CRUD + filtering)
// [ZAK: čl. 27 ZZnR] Osposobljavanje za rad na siguran način
// RLS automatski filtrira po tenant_id.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type {
  TrainingWithWorker, TrainingInsert, TrainingUpdate,
  TrainingFilters,
} from '../types'
import { TRAINING_PAGE_SIZE, computeTrainingStatus } from '../types'

// ── Lista osposobljavanja s paginacijom ──────────────────────────
export function useTrainingsList(filters: TrainingFilters) {
  const [trainings, setTrainings] = useState<TrainingWithWorker[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrainings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    let query = supabase
      .from('trainings')
      .select('*, worker:workers!worker_id(id, first_name, last_name)', { count: 'exact' })

    // Status filter
    if (filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    // Type filter
    if (filters.type !== 'all') {
      query = query.eq('training_type', filters.type)
    }

    // Search (ime djelatnika ili naziv osposobljavanja)
    if (filters.search.trim()) {
      const s = `%${filters.search.trim()}%`
      query = query.or(`training_name.ilike.${s}`)
    }

    // Paginacija
    const from = (filters.page - 1) * TRAINING_PAGE_SIZE
    query = query
      .order('training_date', { ascending: false })
      .range(from, from + TRAINING_PAGE_SIZE - 1)

    const { data, error: err, count } = await query

    if (err) {
      console.error('[useTrainings] fetch error:', err)
      setError(err.message)
    } else {
      setTrainings((data ?? []) as unknown as TrainingWithWorker[])
      setTotalCount(count ?? 0)
    }
    setIsLoading(false)
  }, [filters.status, filters.type, filters.search, filters.page])

  useEffect(() => { fetchTrainings() }, [fetchTrainings])

  return { trainings, totalCount, isLoading, error, refetch: fetchTrainings }
}

// ── Osposobljavanja za jednog djelatnika ──────────────────────────
export function useWorkerTrainings(workerId: string | undefined) {
  const [trainings, setTrainings] = useState<TrainingWithWorker[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!workerId) { setIsLoading(false); return }
    setIsLoading(true)

    supabase
      .from('trainings')
      .select('*, worker:workers!worker_id(id, first_name, last_name)')
      .eq('worker_id', workerId)
      .order('training_date', { ascending: false })
      .then(({ data }) => {
        setTrainings((data ?? []) as unknown as TrainingWithWorker[])
        setIsLoading(false)
      })
  }, [workerId])

  return { trainings, isLoading }
}

// ── Mutations ─────────────────────────────────────────────────────
export function useTrainingMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createTraining = async (input: Omit<TrainingInsert, 'tenant_id'>): Promise<string> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      // Izračunaj status na osnovu valid_until
      const status = computeTrainingStatus(input.valid_until ?? null)

      const { data, error } = await supabase
        .from('trainings')
        .insert({ ...input, tenant_id: tenantId, status })
        .select('id')
        .single()
      if (error) throw error
      return data.id
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateTraining = async (id: string, input: TrainingUpdate): Promise<void> => {
    setIsSubmitting(true)
    try {
      // Rekalkuliraj status ako se valid_until mijenja
      const update = { ...input }
      if ('valid_until' in update) {
        update.status = computeTrainingStatus(update.valid_until ?? null)
      }

      const { error } = await supabase
        .from('trainings')
        .update(update)
        .eq('id', id)
      if (error) throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return { createTraining, updateTraining, isSubmitting }
}
