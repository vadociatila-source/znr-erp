// M05 — Lista radne opreme + vatrogasnih aparata
// [ZAK: PR-04 NN 16/16] Pregled radne opreme max. svake 3 godine
// [ZAK: čl. 39 ZOP NN 92/10] Vatrogasni aparati — vizualni 1god, servis 2god

import { useState } from 'react'
import { Link } from 'wouter'
import { Plus, Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input, Badge } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { EquipmentTable } from '../components/EquipmentTable'
import { Pagination } from '@/modules/M01-radnici/components/Pagination'
import { useEquipmentList } from '../hooks/useEquipment'
import { EQUIPMENT_TYPES, EQ_PAGE_SIZE, DEFAULT_EQ_FILTERS } from '../types'
import type { EquipmentFilters } from '../types'

export default function RadnaOpremaPage() {
  const [filters, setFilters] = useState<EquipmentFilters>(DEFAULT_EQ_FILTERS)
  const { items, totalCount, isLoading } = useEquipmentList(filters)
  const totalPages = Math.ceil(totalCount / EQ_PAGE_SIZE)

  const updateFilter = (partial: Partial<EquipmentFilters>) => {
    setFilters(f => ({ ...f, ...partial, page: 'page' in partial ? partial.page! : 1 }))
  }

  return (
    <AppLayout
      title="Radna oprema"
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Radna oprema' }]}
      actions={
        <div className="flex items-center gap-3">
          <LegalBadge article="PR-04 NN 16/16" deadline="pregled max. 3 god" />
          <Link href="/radna-oprema/novo">
            <Button size="sm" leftIcon={<Plus size={14} />}>Nova oprema</Button>
          </Link>
        </div>
      }
    >
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input placeholder="Pretraži po nazivu, serijskom ili inventarskom broju..."
            leftAddon={<Search size={16} />}
            value={filters.search}
            onChange={e => updateFilter({ search: e.target.value })} />
        </div>
        <div className="w-48">
          <Select options={[{ value: 'all', label: 'Sve vrste' }, ...EQUIPMENT_TYPES]}
            value={filters.equipmentType}
            onChange={e => updateFilter({ equipmentType: e.target.value })} />
        </div>
        <div className="w-40">
          <Select options={[
            { value: 'active', label: 'Aktivna' },
            { value: 'out_of_service', label: 'Izvan uporabe' },
            { value: 'disposed', label: 'Rashodovana' },
            { value: 'all', label: 'Sve' },
          ]} value={filters.status}
            onChange={e => updateFilter({ status: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Badge variant="info">{totalCount}</Badge>
          <span>komada opreme</span>
        </div>
      </div>

      <EquipmentTable items={items} isLoading={isLoading} />

      <Pagination currentPage={filters.page} totalPages={totalPages}
        onPageChange={page => updateFilter({ page })} />
    </AppLayout>
  )
}
