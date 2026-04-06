// M03 — Lista svih osposobljavanja (cross-worker view)
// [ZAK: čl. 27 ZZnR] Osposobljavanje za rad na siguran način
// [ZAK: PR-02 NN 142/21] Usavršavanje svake 4 godine

import { useState } from 'react'
import { Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Input, Badge } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { TrainingsTable } from '../components/TrainingsTable'
import { Pagination } from '@/modules/M01-radnici/components/Pagination'
import { useTrainingsList } from '../hooks/useTrainings'
import { TRAINING_TYPES, TRAINING_PAGE_SIZE } from '../types'
import type { TrainingFilters } from '../types'
import { DEFAULT_TRAINING_FILTERS } from '../types'

export default function OsposobljavanjaPage() {
  const [filters, setFilters] = useState<TrainingFilters>(DEFAULT_TRAINING_FILTERS)
  const { trainings, totalCount, isLoading } = useTrainingsList(filters)
  const totalPages = Math.ceil(totalCount / TRAINING_PAGE_SIZE)

  const updateFilter = (partial: Partial<TrainingFilters>) => {
    setFilters(f => ({ ...f, ...partial, page: 'page' in partial ? partial.page! : 1 }))
  }

  return (
    <AppLayout
      title="Osposobljavanja"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Osposobljavanja' },
      ]}
      actions={
        <LegalBadge article="čl. 27 ZZnR" deadline="30 dana novi / 4 god. usavršavanje" />
      }
    >
      {/* Filteri */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Pretraži po nazivu osposobljavanja..."
            leftAddon={<Search size={16} />}
            value={filters.search}
            onChange={e => updateFilter({ search: e.target.value })}
          />
        </div>
        <div className="w-44">
          <Select
            options={[
              { value: 'all', label: 'Svi statusi' },
              { value: 'valid', label: 'Važeće' },
              { value: 'expiring_soon', label: 'Uskoro ističe' },
              { value: 'expired', label: 'Isteklo' },
            ]}
            value={filters.status}
            onChange={e => updateFilter({ status: e.target.value as TrainingFilters['status'] })}
          />
        </div>
        <div className="w-52">
          <Select
            options={[
              { value: 'all', label: 'Sve vrste' },
              ...TRAINING_TYPES,
            ]}
            value={filters.type}
            onChange={e => updateFilter({ type: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Badge variant="info">{totalCount}</Badge>
          <span>osposobljavanja</span>
        </div>
      </div>

      <TrainingsTable trainings={trainings} isLoading={isLoading} />

      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={page => updateFilter({ page })}
      />
    </AppLayout>
  )
}
