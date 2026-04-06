// M04 — Lista zdravstvenih pregleda
// [ZAK: čl. 34 ZZnR] Zdravstveni pregledi za poslove s posebnim uvjetima

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Badge } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { HealthChecksTable } from '../components/HealthChecksTable'
import { Pagination } from '@/modules/M01-radnici/components/Pagination'
import { useHealthChecksList } from '../hooks/useHealthChecks'
import { CHECK_TYPES, RESULT_OPTIONS, HC_PAGE_SIZE, DEFAULT_HC_FILTERS } from '../types'
import type { HealthCheckFilters } from '../types'

export default function ZdravstveniPreglediPage() {
  const [filters, setFilters] = useState<HealthCheckFilters>(DEFAULT_HC_FILTERS)
  const { checks, totalCount, isLoading } = useHealthChecksList(filters)
  const totalPages = Math.ceil(totalCount / HC_PAGE_SIZE)

  const updateFilter = (partial: Partial<HealthCheckFilters>) => {
    setFilters(f => ({ ...f, ...partial, page: 'page' in partial ? partial.page! : 1 }))
  }

  return (
    <AppLayout
      title="Zdravstveni pregledi"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Zdravstveni pregledi' },
      ]}
      actions={
        <LegalBadge article="čl. 34 ZZnR" deadline="periodički: 1-3 god" />
      }
    >
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="w-44">
          <Select
            options={[{ value: 'all', label: 'Sve vrste' }, ...CHECK_TYPES]}
            value={filters.checkType}
            onChange={e => updateFilter({ checkType: e.target.value })}
          />
        </div>
        <div className="w-52">
          <Select
            options={[{ value: 'all', label: 'Svi rezultati' }, ...RESULT_OPTIONS]}
            value={filters.result}
            onChange={e => updateFilter({ result: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Badge variant="info">{totalCount}</Badge>
          <span>pregleda</span>
        </div>
      </div>

      <HealthChecksTable checks={checks} isLoading={isLoading} />

      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={page => updateFilter({ page })}
      />
    </AppLayout>
  )
}
