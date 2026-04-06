// M08 — Ozljede na radu
// [ZAK: čl. 62 ZZnR] Prijava HZZO u roku 48 sati — kazna 5.000–50.000 EUR
import { useState } from 'react'
import { Link } from 'wouter'
import { Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { IncidentsTable } from '../components/IncidentsTable'
import { Pagination } from '@/modules/M01-radnici/components/Pagination'
import { useIncidentsList } from '../hooks/useIncidents'
import { INCIDENT_STATUSES, INC_PAGE_SIZE, DEFAULT_INC_FILTERS } from '../types'
import type { IncidentFilters } from '../types'

export default function OzljededPage() {
  const [filters, setFilters] = useState<IncidentFilters>(DEFAULT_INC_FILTERS)
  const { incidents, totalCount, isLoading } = useIncidentsList(filters)
  const totalPages = Math.ceil(totalCount / INC_PAGE_SIZE)

  const updateFilter = (partial: Partial<IncidentFilters>) => {
    setFilters(f => ({ ...f, ...partial, page: 'page' in partial ? partial.page! : 1 }))
  }

  return (
    <AppLayout
      title="Ozljede na radu"
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Ozljede na radu' }]}
      actions={
        <div className="flex items-center gap-3">
          <LegalBadge article="čl. 62 ZZnR" deadline="48h HZZO" penalty="Kazna: 5.000–50.000 EUR" />
          <Link href="/ozljede/novo">
            <Button size="sm" variant="danger" leftIcon={<Plus size={14} />}>Prijavi ozljedu</Button>
          </Link>
        </div>
      }
    >
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="w-44">
          <Select options={[{ value: 'all', label: 'Svi statusi' }, ...INCIDENT_STATUSES]}
            value={filters.status} onChange={e => updateFilter({ status: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Badge variant="info">{totalCount}</Badge>
          <span>ozljeda</span>
        </div>
      </div>

      <IncidentsTable incidents={incidents} isLoading={isLoading} />
      <Pagination currentPage={filters.page} totalPages={totalPages}
        onPageChange={page => updateFilter({ page })} />
    </AppLayout>
  )
}
