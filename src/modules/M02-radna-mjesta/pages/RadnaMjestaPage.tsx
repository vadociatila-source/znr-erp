// M02 — Lista radnih mjesta + procjena rizika
// [ZAK: čl. 18 ZZnR] Procjena rizika — revizija min. svake 2 godine
import { useState } from 'react'
import { Link } from 'wouter'
import { Plus, Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input, Badge } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { PositionsTable } from '../components/PositionsTable'
import { Pagination } from '@/modules/M01-radnici/components/Pagination'
import { usePositionsList } from '../hooks/useWorkPositions'
import { POS_PAGE_SIZE, DEFAULT_POS_FILTERS } from '../types'
import type { PositionFilters } from '../types'

export default function RadnaMjestaPage() {
  const [filters, setFilters] = useState<PositionFilters>(DEFAULT_POS_FILTERS)
  const { positions, totalCount, isLoading } = usePositionsList(filters)
  const totalPages = Math.ceil(totalCount / POS_PAGE_SIZE)

  const updateFilter = (partial: Partial<PositionFilters>) => {
    setFilters(f => ({ ...f, ...partial, page: 'page' in partial ? partial.page! : 1 }))
  }

  return (
    <AppLayout
      title="Radna mjesta"
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Radna mjesta' }]}
      actions={
        <div className="flex items-center gap-3">
          <LegalBadge article="čl. 18 ZZnR" deadline="revizija procjene rizika min. 2 god" />
          <Link href="/radna-mjesta/novo">
            <Button size="sm" leftIcon={<Plus size={14} />}>Novo radno mjesto</Button>
          </Link>
        </div>
      }
    >
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input placeholder="Pretraži po nazivu ili šifri..."
            leftAddon={<Search size={16} />} value={filters.search}
            onChange={e => updateFilter({ search: e.target.value })} />
        </div>
        <div className="w-40">
          <Select options={[
            { value: 'active', label: 'Aktivna' },
            { value: 'inactive', label: 'Neaktivna' },
            { value: 'all', label: 'Sve' },
          ]} value={filters.status}
            onChange={e => updateFilter({ status: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Badge variant="info">{totalCount}</Badge>
          <span>radnih mjesta</span>
        </div>
      </div>

      <PositionsTable positions={positions} isLoading={isLoading} />
      <Pagination currentPage={filters.page} totalPages={totalPages}
        onPageChange={page => updateFilter({ page })} />
    </AppLayout>
  )
}
