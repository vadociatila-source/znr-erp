// M01 — Lista radnika
// [ZAK: čl. 61 ZZnR] Evidencija radnika je trajna — bivši se ne brišu
// Sprint 003 — CRUD s filterima, paginacijom, CSV exportom

import { Link } from 'wouter'
import { Plus, Download, Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input, Badge } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { LegalBadge } from '@/components/legal/LegalBadge'
import { WorkersTable } from '../components/WorkersTable'
import { Pagination } from '../components/Pagination'
import { useWorkersList } from '../hooks/useWorkers'
import { useWorkerFilters } from '../hooks/useWorkerFilters'
import { exportWorkersCSV } from '../utils/csv-export'
import { PAGE_SIZE } from '../types'

export default function RadniciPage() {
  const [filters, setFilters] = useWorkerFilters()
  const { workers, totalCount, isLoading } = useWorkersList(filters)
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <AppLayout
      title="Djelatnici"
      breadcrumb={[
        { label: 'Home', href: '/' },
        { label: 'Djelatnici' },
      ]}
      actions={
        <div className="flex items-center gap-3">
          <LegalBadge article="čl. 61 ZZnR" deadline="evidencija trajno" />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={() => exportWorkersCSV(workers)}
            disabled={workers.length === 0}
          >
            CSV
          </Button>
          <Link href="/radnici/novi">
            <Button size="sm" leftIcon={<Plus size={14} />}>
              Novi djelatnik
            </Button>
          </Link>
        </div>
      }
    >
      {/* Filteri */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Pretraži djelatnike po imenu, prezimenu ili OIB-u..."
            leftAddon={<Search size={16} />}
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
          />
        </div>
        <div className="w-40">
          <Select
            options={[
              { value: 'active', label: 'Aktivni' },
              { value: 'former', label: 'Bivši' },
              { value: 'all', label: 'Svi' },
            ]}
            value={filters.status}
            onChange={e => setFilters({ status: e.target.value as 'active' | 'former' | 'all' })}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Badge variant="info">{totalCount}</Badge>
          <span>{filters.status === 'active' ? 'aktivnih' : filters.status === 'former' ? 'bivših' : 'ukupno'} djelatnika</span>
        </div>
      </div>

      {/* Tablica */}
      <WorkersTable workers={workers} isLoading={isLoading} />

      {/* Paginacija */}
      <Pagination
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={page => setFilters({ page })}
      />
    </AppLayout>
  )
}
