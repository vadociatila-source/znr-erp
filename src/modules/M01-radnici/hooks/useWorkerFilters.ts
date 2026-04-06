// URL-based filters za listu radnika
// URL format: /radnici?search=ivan&status=active&page=2
// Shareable links per CLAUDE.md §7

import { useLocation } from 'wouter'
import { useCallback, useMemo } from 'react'
import type { WorkerFilters } from '../types'
import { DEFAULT_FILTERS } from '../types'

export function useWorkerFilters(): [WorkerFilters, (partial: Partial<WorkerFilters>) => void] {
  const [, navigate] = useLocation()

  const filters = useMemo<WorkerFilters>(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      search: params.get('search') ?? DEFAULT_FILTERS.search,
      status: (params.get('status') as WorkerFilters['status']) ?? DEFAULT_FILTERS.status,
      page: Number(params.get('page')) || DEFAULT_FILTERS.page,
    }
  }, [window.location.search]) // eslint-disable-line react-hooks/exhaustive-deps

  const setFilters = useCallback((partial: Partial<WorkerFilters>) => {
    const next = { ...filters, ...partial }
    // Resetiraj stranicu kad se filter promijeni
    if ('search' in partial || 'status' in partial) next.page = 1

    const params = new URLSearchParams()
    if (next.search) params.set('search', next.search)
    if (next.status !== 'active') params.set('status', next.status)
    if (next.page > 1) params.set('page', String(next.page))

    const qs = params.toString()
    navigate('/radnici' + (qs ? `?${qs}` : ''))
  }, [filters, navigate])

  return [filters, setFilters]
}
