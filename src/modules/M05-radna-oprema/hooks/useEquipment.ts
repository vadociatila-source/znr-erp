// M05 — Equipment data hook
// [ZAK: PR-04 NN 16/16] Pregled radne opreme
// RLS automatski filtrira po tenant_id.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import type { EquipmentRow, EquipmentInsert, EquipmentUpdate, EquipmentFilters } from '../types'
import { EQ_PAGE_SIZE } from '../types'

export function useEquipmentList(filters: EquipmentFilters) {
  const [items, setItems] = useState<EquipmentRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    let query = supabase
      .from('equipment')
      .select('*', { count: 'exact' })

    if (filters.status !== 'all') query = query.eq('status', filters.status)
    if (filters.equipmentType !== 'all') query = query.eq('equipment_type', filters.equipmentType)
    if (filters.search.trim()) {
      const s = `%${filters.search.trim()}%`
      query = query.or(`name.ilike.${s},serial_number.ilike.${s},inventory_number.ilike.${s}`)
    }

    const from = (filters.page - 1) * EQ_PAGE_SIZE
    query = query
      .order('name')
      .range(from, from + EQ_PAGE_SIZE - 1)

    const { data, error: err, count } = await query
    if (err) { setError(err.message) } else {
      setItems(data ?? [])
      setTotalCount(count ?? 0)
    }
    setIsLoading(false)
  }, [filters.status, filters.equipmentType, filters.search, filters.page])

  useEffect(() => { fetch() }, [fetch])
  return { items, totalCount, isLoading, error, refetch: fetch }
}

export function useEquipmentMutations() {
  const tenantId = useTenantStore(s => s.activeTenant?.id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createEquipment = async (input: Omit<EquipmentInsert, 'tenant_id'>): Promise<string> => {
    if (!tenantId) throw new Error('Nema aktivnog tenanta')
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert({ ...input, tenant_id: tenantId })
        .select('id')
        .single()
      if (error) throw error
      return data.id
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateEquipment = async (id: string, input: EquipmentUpdate): Promise<void> => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('equipment').update(input).eq('id', id)
      if (error) throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return { createEquipment, updateEquipment, isSubmitting }
}
